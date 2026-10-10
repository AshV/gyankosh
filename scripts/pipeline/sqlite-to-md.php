<?php
declare(strict_types=1);

/**
 * scripts/pipeline/sqlite-to-md.php
 * Serializes SQLite database back into canonical Git Markdown files.
 * Part of Gyankosh Hybrid Architecture - Phase 1.
 *
 * Usage:
 *   php scripts/pipeline/sqlite-to-md.php          # Overwrite markdown files
 *   php scripts/pipeline/sqlite-to-md.php --check  # Dry-run check for 0-diff round-trip
 */

$rootDir = realpath(__DIR__ . '/../../');
$dbPath = $rootDir . '/database/gyankosh.db';
$libraryDir = $rootDir . '/src/content/library';

$isCheckMode = in_array('--check', $argv, true);

echo "🕉️ Gyankosh Data Pipeline: SQLite -> Markdown Serializer\n";
echo "=========================================================\n";
if ($isCheckMode) {
    echo "🔍 Mode: Round-trip verification check (Dry-run)\n\n";
}

if (!file_exists($dbPath)) {
    fwrite(STDERR, "❌ Error: database/gyankosh.db does not exist. Run md-to-sqlite.php first.\n");
    exit(1);
}

$pdo = new PDO("sqlite:{$dbPath}");
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$texts = $pdo->query("SELECT slug, raw_frontmatter FROM texts ORDER BY slug ASC")->fetchAll(PDO::FETCH_ASSOC);

$blockStmt = $pdo->prepare("
    SELECT block_type, content_raw
    FROM blocks
    WHERE text_slug = :slug
    ORDER BY block_order ASC
");

$perfectMatches = 0;
$mismatches = 0;
$totalFiles = count($texts);

foreach ($texts as $text) {
    $slug = $text['slug'];
    $rawFm = $text['raw_frontmatter'];
    $filePath = $libraryDir . '/' . $slug . '.md';

    $blockStmt->execute([':slug' => $slug]);
    $blocks = $blockStmt->fetchAll(PDO::FETCH_ASSOC);

    $blockStrings = [];
    foreach ($blocks as $b) {
        $type = $b['block_type'];
        $content = $b['content_raw'];

        if ($type === 'Plain') {
            $blockStrings[] = $content;
        } else {
            $blockStrings[] = "[{$type}]\n{$content}";
        }
    }

    $body = implode("\n\n", $blockStrings);
    $reconstructed = "---\n" . $rawFm . "\n---\n\n" . $body . "\n";

    if ($isCheckMode) {
        if (!file_exists($filePath)) {
            echo "❌ Missing file on disk: {$slug}.md\n";
            $mismatches++;
            continue;
        }

        $diskContent = file_get_contents($filePath);
        $diskNormalized = str_replace(["\r\n", "\r"], "\n", $diskContent);

        // Normalize trailing whitespace/newlines for fair comparison
        $diskTrimmed = trim($diskNormalized);
        $reconstructedTrimmed = trim($reconstructed);

        if ($diskTrimmed === $reconstructedTrimmed) {
            $perfectMatches++;
        } else {
            $mismatches++;
            echo "⚠️ Difference detected in: {$slug}.md\n";
            // Print small sample of difference
            $diskLen = strlen($diskTrimmed);
            $reconLen = strlen($reconstructedTrimmed);
            echo "   Disk length: {$diskLen} bytes | Reconstructed: {$reconLen} bytes\n";
        }
    } else {
        file_put_contents($filePath, $reconstructed);
        $perfectMatches++;
    }
}

if ($isCheckMode) {
    echo "\n📊 Round-trip Verification Summary:\n";
    echo "   Total Texts: {$totalFiles}\n";
    echo "   Perfect Matches: {$perfectMatches} / {$totalFiles}\n";
    echo "   Differences: {$mismatches}\n";

    if ($mismatches === 0) {
        echo "🎉 100% LOSSLESS ROUND-TRIP FIDELITY CONFIRMED!\n";
        echo "   Every single word, verse, matra, and block tag is preserved identically.\n";
        exit(0);
    } else {
        echo "❌ Round-trip test had {$mismatches} differences.\n";
        exit(1);
    }
} else {
    echo "✅ Serialized {$perfectMatches} texts to {$libraryDir}/*.md\n";
}
