<?php
declare(strict_types=1);

/**
 * scripts/pipeline/md-to-sqlite.php
 * Hydrates local SQLite database (database/gyankosh.db) from Git Markdown files.
 * Part of Gyankosh Hybrid Architecture - Phase 1.
 */

$rootDir = realpath(__DIR__ . '/../../');
$dbPath = $rootDir . '/database/gyankosh.db';
$schemaPath = $rootDir . '/database/schema.sql';
$libraryDir = $rootDir . '/src/content/library';
$weightsFile = $rootDir . '/src/data/weights.json';

echo "🕉️ Gyankosh Data Pipeline: Markdown -> SQLite Ingest\n";
echo "=======================================================\n";

// 1. Ensure database directory exists
if (!is_dir(dirname($dbPath))) {
    mkdir(dirname($dbPath), 0755, true);
}

// 2. Initialize SQLite connection & Schema
$pdo = new PDO("sqlite:{$dbPath}");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Check if raw_frontmatter column exists in texts table, add if needed
$schemaSql = file_get_contents($schemaPath);
$pdo->exec($schemaSql);

// Ensure raw_frontmatter column exists
$columns = $pdo->query("PRAGMA table_info(texts)")->fetchAll(PDO::FETCH_ASSOC);
$hasRawFm = false;
foreach ($columns as $col) {
    if ($col['name'] === 'raw_frontmatter') {
        $hasRawFm = true;
        break;
    }
}
if (!$hasRawFm) {
    $pdo->exec("ALTER TABLE texts ADD COLUMN raw_frontmatter TEXT");
}

// 3. Load weights registry
$weights = [];
if (file_exists($weightsFile)) {
    $weightsJson = json_decode(file_get_contents($weightsFile), true);
    $weights = $weightsJson['weights'] ?? [];
}

// 3b. Load physical book & Gita Press references from TODO.md
$bookInfo = [];
$todoFile = $rootDir . '/TODO.md';
if (file_exists($todoFile)) {
    $todoContent = file_get_contents($todoFile);
    $lines = explode("\n", $todoContent);
    foreach ($lines as $line) {
        if (str_contains($line, '.md')) {
            $cols = array_map('trim', explode('|', $line));
            if (count($cols) >= 6) {
                if (preg_match('/`([a-z0-9\-]+)\.md`/', $cols[3], $sm)) {
                    $bookInfo[$sm[1]] = $cols[5] ?? '';
                }
            }
        }
    }
}

// Numbered verse blocks matching indicParser.ts
$verseBlocks = [
    'Shloka' => true,
    'Mantra' => true,
    'Chaupai' => true,
    'Doha' => true,
    'Soratha' => true,
    'Chhanda' => true,
    'Chhand' => true,
    'Prose' => true,
];

// 4. Read all Markdown files
$files = glob($libraryDir . '/*.md');
sort($files);

$pdo->beginTransaction();

// Clear existing working data to ensure fresh sync
$pdo->exec("DELETE FROM blocks");
$pdo->exec("DELETE FROM texts");

$textStmt = $pdo->prepare("
    INSERT INTO texts (
        slug, title, author, description, category, language, cover_color,
        cover_image, show_numbering, context, weight, chapter, tags_json,
        gita_press_code, raw_frontmatter
    ) VALUES (
        :slug, :title, :author, :description, :category, :language, :cover_color,
        :cover_image, :show_numbering, :context, :weight, :chapter, :tags_json,
        :gita_press_code, :raw_frontmatter
    )
");

$blockStmt = $pdo->prepare("
    INSERT INTO blocks (
        text_slug, block_order, block_type, verse_num, content_raw, padas_json
    ) VALUES (
        :text_slug, :block_order, :block_type, :verse_num, :content_raw, :padas_json
    )
");

$totalTexts = 0;
$totalBlocks = 0;
$totalVerses = 0;

foreach ($files as $file) {
    $slug = basename($file, '.md');
    $content = file_get_contents($file);

    // Normalize newlines
    $normalized = str_replace(["\r\n", "\r"], "\n", $content);

    // Split frontmatter and body
    if (!preg_match('/^---\n(.*?)\n---\n*(.*)$/s', $normalized, $matches)) {
        echo "⚠️ Warning: Skipping {$slug} (malformed frontmatter)\n";
        continue;
    }

    $rawFm = $matches[1];
    $body = trim($matches[2]);

    // Parse simple YAML fields
    $meta = [
        'title' => '',
        'author' => null,
        'description' => '',
        'category' => 'Other',
        'language' => 'Sanskrit',
        'coverColor' => null,
        'coverImage' => null,
        'showNumbering' => 1,
        'context' => null,
        'chapter' => null,
        'tags' => [],
    ];

    $fmLines = explode("\n", $rawFm);
    foreach ($fmLines as $line) {
        $line = trim($line);
        if (preg_match('/^([a-zA-Z0-9_]+):\s*(.*)$/', $line, $m)) {
            $key = $m[1];
            $val = trim($m[2]);

            // Unquote strings
            if (preg_match('/^"(.*)"$/', $val, $qm) || preg_match("/^'(.*)'$/", $val, $qm)) {
                $val = $qm[1];
            }

            if ($key === 'tags') {
                if (preg_match('/^\[(.*)\]$/', $val, $tm)) {
                    $tagsArray = array_map(function($t) {
                        return trim(trim(trim($t), '"'), "'");
                    }, explode(',', $tm[1]));
                    $meta['tags'] = array_values(array_filter($tagsArray));
                }
            } elseif ($key === 'showNumbering') {
                $meta['showNumbering'] = ($val === 'false' || $val === '0') ? 0 : 1;
            } elseif ($key === 'chapter') {
                $meta['chapter'] = is_numeric($val) ? (int)$val : null;
            } else {
                $meta[$key] = $val;
            }
        }
    }

    $weight = $weights[$slug] ?? null;

    $textStmt->execute([
        ':slug' => $slug,
        ':title' => $meta['title'],
        ':author' => $meta['author'] ?? null,
        ':description' => $meta['description'],
        ':category' => $meta['category'],
        ':language' => $meta['language'] ?? 'Sanskrit',
        ':cover_color' => $meta['coverColor'] ?? null,
        ':cover_image' => $meta['coverImage'] ?? null,
        ':show_numbering' => $meta['showNumbering'],
        ':context' => $meta['context'] ?? null,
        ':weight' => $weight,
        ':chapter' => $meta['chapter'],
        ':tags_json' => json_encode($meta['tags'], JSON_UNESCAPED_UNICODE),
        ':gita_press_code' => $bookInfo[$slug] ?? null,
        ':raw_frontmatter' => $rawFm,
    ]);

    // Parse blocks
    $rawBlocks = preg_split('/\n\s*\n+/', $body);
    $blockOrder = 0;
    $verseCounter = 0;
    $nameCounter = 0;

    foreach ($rawBlocks as $rawBlock) {
        $rawBlock = trim($rawBlock);
        if ($rawBlock === '') continue;

        $blockOrder++;
        $tag = 'Plain';
        $contentLines = '';
        $verseNum = null;

        if (preg_match('/^\[([A-Za-z]+)\]\s*(.*)$/s', $rawBlock, $bm)) {
            $tag = $bm[1];
            $contentLines = trim($bm[2]);
        } else {
            $contentLines = $rawBlock;
        }

        // Calculate verse number if applicable
        if (isset($verseBlocks[$tag])) {
            $verseCounter++;
            $verseNum = $verseCounter;
            $totalVerses++;
        } elseif ($tag === 'Name') {
            $nameCounter++;
            $verseNum = $nameCounter;
            $totalVerses++;
        }

        $linesArray = array_values(array_filter(array_map('trim', explode("\n", $contentLines))));

        $blockStmt->execute([
            ':text_slug' => $slug,
            ':block_order' => $blockOrder,
            ':block_type' => $tag,
            ':verse_num' => $verseNum,
            ':content_raw' => $contentLines,
            ':padas_json' => json_encode($linesArray, JSON_UNESCAPED_UNICODE),
        ]);

        $totalBlocks++;
    }

    $totalTexts++;
}

$pdo->commit();

echo "✅ Ingest Complete!\n";
echo "   Texts loaded: {$totalTexts}\n";
echo "   Blocks stored: {$totalBlocks}\n";
echo "   Verses indexed: {$totalVerses}\n";
echo "   Database size: " . round(filesize($dbPath) / 1024, 2) . " KB\n";
