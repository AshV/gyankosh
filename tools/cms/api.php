<?php
declare(strict_types=1);

/**
 * tools/cms/api.php
 * Backend API for Gyankosh Localhost CMS & Verification Workspace.
 * Handles database operations, verse updates, Option A typo review workflow,
 * and automatic synchronization back to Git Markdown files.
 */

header('Content-Type: application/json; charset=utf-8');

$rootDir = realpath(__DIR__ . '/../../');
$dbPath = $rootDir . '/database/gyankosh.db';
$libraryDir = $rootDir . '/src/content/library';
$cmsConfig = file_exists(__DIR__ . '/config.php') ? require __DIR__ . '/config.php' : [];

if (!file_exists($dbPath)) {
    echo json_encode(['error' => 'Database not found. Please run npm run db:ingest first.']);
    exit;
}

try {
    $pdo = new PDO("sqlite:{$dbPath}");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// Helper: Serialize single text to its Markdown file
function serializeSingleText(PDO $pdo, string $slug, string $libraryDir): bool {
    $textStmt = $pdo->prepare("SELECT raw_frontmatter FROM texts WHERE slug = :slug");
    $textStmt->execute([':slug' => $slug]);
    $text = $textStmt->fetch(PDO::FETCH_ASSOC);
    if (!$text) return false;

    $blockStmt = $pdo->prepare("
        SELECT block_type, content_raw
        FROM blocks
        WHERE text_slug = :slug
        ORDER BY block_order ASC
    ");
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
    $output = "---\n" . $text['raw_frontmatter'] . "\n---\n\n" . $body . "\n";

    $targetFile = $libraryDir . '/' . $slug . '.md';
    return file_put_contents($targetFile, $output) !== false;
}

// Router
switch ($action) {
    case 'stats':
        $totalTexts = (int)$pdo->query("SELECT COUNT(*) FROM texts")->fetchColumn();
        $verifiedTexts = (int)$pdo->query("SELECT COUNT(*) FROM texts WHERE verification_status = 'verified'")->fetchColumn();
        $inProgressTexts = (int)$pdo->query("SELECT COUNT(*) FROM texts WHERE verification_status = 'in_progress'")->fetchColumn();
        $totalVerses = (int)$pdo->query("SELECT COUNT(*) FROM blocks WHERE verse_num IS NOT NULL")->fetchColumn();
        $verifiedVerses = (int)$pdo->query("SELECT COUNT(*) FROM blocks WHERE is_verified = 1")->fetchColumn();
        $pendingErrata = (int)$pdo->query("SELECT COUNT(*) FROM local_errata_reviews WHERE review_status = 'pending'")->fetchColumn();

        echo json_encode([
            'total_texts' => $totalTexts,
            'verified_texts' => $verifiedTexts,
            'in_progress_texts' => $inProgressTexts,
            'total_verses' => $totalVerses,
            'verified_verses' => $verifiedVerses,
            'pending_errata' => $pendingErrata,
        ]);
        break;

    case 'texts':
        $category = $_GET['category'] ?? '';
        $query = "SELECT slug, title, category, author, weight, gita_press_code, verification_status FROM texts";
        $params = [];
        if ($category && $category !== 'All') {
            $query .= " WHERE category = :category";
            $params[':category'] = $category;
        }
        $query .= " ORDER BY weight ASC, title ASC";
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $texts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['texts' => $texts]);
        break;

    case 'text':
        $slug = $_GET['slug'] ?? '';
        if (!$slug) {
            echo json_encode(['error' => 'Missing slug']);
            break;
        }

        $textStmt = $pdo->prepare("SELECT * FROM texts WHERE slug = :slug");
        $textStmt->execute([':slug' => $slug]);
        $text = $textStmt->fetch(PDO::FETCH_ASSOC);

        if (!$text) {
            echo json_encode(['error' => 'Text not found']);
            break;
        }

        $blockStmt = $pdo->prepare("
            SELECT id, block_order, block_type, verse_num, speaker, content_raw, is_verified, gita_press_page, notes
            FROM blocks
            WHERE text_slug = :slug
            ORDER BY block_order ASC
        ");
        $blockStmt->execute([':slug' => $slug]);
        $blocks = $blockStmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'text' => $text,
            'blocks' => $blocks,
        ]);
        break;

    case 'update_block':
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $blockId = (int)($input['block_id'] ?? 0);
        $contentRaw = trim($input['content_raw'] ?? '');
        $isVerified = (int)($input['is_verified'] ?? 0);
        $gitaPressPage = !empty($input['gita_press_page']) ? (int)$input['gita_press_page'] : null;
        $notes = $input['notes'] ?? null;

        if (!$blockId || $contentRaw === '') {
            echo json_encode(['error' => 'Invalid parameters']);
            break;
        }

        // Get text slug
        $stmt = $pdo->prepare("SELECT text_slug FROM blocks WHERE id = :id");
        $stmt->execute([':id' => $blockId]);
        $slug = $stmt->fetchColumn();

        if (!$slug) {
            echo json_encode(['error' => 'Block not found']);
            break;
        }

        // Update block
        $updateStmt = $pdo->prepare("
            UPDATE blocks
            SET content_raw = :content_raw,
                is_verified = :is_verified,
                gita_press_page = :gita_press_page,
                notes = :notes,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ");
        $updateStmt->execute([
            ':content_raw' => $contentRaw,
            ':is_verified' => $isVerified,
            ':gita_press_page' => $gitaPressPage,
            ':notes' => $notes,
            ':id' => $blockId,
        ]);

        // Auto-export updated Markdown file to Git
        $exported = serializeSingleText($pdo, $slug, $libraryDir);

        echo json_encode([
            'success' => true,
            'message' => 'Block updated in SQLite and synced to Markdown file',
            'exported' => $exported,
            'slug' => $slug,
        ]);
        break;

    case 'update_text_meta':
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $slug = $input['slug'] ?? '';
        $status = $input['verification_status'] ?? 'unverified';
        $gitaPressCode = $input['gita_press_code'] ?? null;

        if (!$slug) {
            echo json_encode(['error' => 'Missing slug']);
            break;
        }

        $stmt = $pdo->prepare("
            UPDATE texts
            SET verification_status = :status,
                gita_press_code = :gita_press_code,
                updated_at = CURRENT_TIMESTAMP
            WHERE slug = :slug
        ");
        $stmt->execute([
            ':status' => $status,
            ':gita_press_code' => $gitaPressCode,
            ':slug' => $slug,
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Text metadata updated successfully',
        ]);
        break;

    case 'errata':
        $statusFilter = $_GET['status'] ?? 'pending';
        $stmt = $pdo->prepare("
            SELECT r.*, t.title as text_title
            FROM local_errata_reviews r
            LEFT JOIN texts t ON t.slug = r.text_slug
            WHERE (:status = 'all' OR r.review_status = :status)
            ORDER BY r.created_at DESC
        ");
        $stmt->execute([':status' => $statusFilter]);
        $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['reports' => $reports]);
        break;

    case 'resolve_errata':
        $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $reportId = (int)($input['report_id'] ?? 0);
        $decision = $input['decision'] ?? ''; // 'accept' or 'reject'
        $appliedText = $input['applied_text'] ?? '';
        $adminNotes = $input['admin_notes'] ?? '';

        if (!$reportId || !in_array($decision, ['accept', 'reject'], true)) {
            echo json_encode(['error' => 'Invalid parameters']);
            break;
        }

        // Fetch report
        $stmt = $pdo->prepare("SELECT * FROM local_errata_reviews WHERE id = :id");
        $stmt->execute([':id' => $reportId]);
        $report = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$report) {
            echo json_encode(['error' => 'Report not found']);
            break;
        }

        $textSlug = $report['text_slug'];
        $verseId = $report['verse_id']; // e.g. "verse-3"

        if ($decision === 'accept' && $appliedText !== '') {
            // Find target block
            preg_match('/verse-(\d+)/', $verseId, $vm);
            $verseNum = !empty($vm[1]) ? (int)$vm[1] : null;

            if ($verseNum) {
                $blockStmt = $pdo->prepare("
                    SELECT id FROM blocks
                    WHERE text_slug = :slug AND verse_num = :verse_num
                    LIMIT 1
                ");
                $blockStmt->execute([':slug' => $textSlug, ':verse_num' => $verseNum]);
                $blockId = $blockStmt->fetchColumn();

                if ($blockId) {
                    $updateStmt = $pdo->prepare("
                        UPDATE blocks
                        SET content_raw = :content_raw,
                            is_verified = 1,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = :id
                    ");
                    $updateStmt->execute([
                        ':content_raw' => $appliedText,
                        ':id' => $blockId,
                    ]);

                    // Sync to Markdown file
                    serializeSingleText($pdo, $textSlug, $libraryDir);
                }
            }
        }

        // Mark report as resolved
        $resStmt = $pdo->prepare("
            UPDATE local_errata_reviews
            SET review_status = :status,
                admin_notes = :admin_notes,
                resolved_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ");
        $resStmt->execute([
            ':status' => $decision === 'accept' ? 'accepted' : 'rejected',
            ':admin_notes' => $adminNotes,
            ':id' => $reportId,
        ]);

        echo json_encode([
            'success' => true,
            'message' => $decision === 'accept' 
                ? "Correction applied! Verse updated and synced to Git file." 
                : "Report dismissed.",
        ]);
        break;

    case 'seed_sample_errata':
        // Generate realistic sample errata report for offline testing
        $sampleStmt = $pdo->prepare("
            INSERT INTO local_errata_reviews (
                text_slug, verse_id, selected_text, suggested_text,
                book_reference, user_note, anon_device_id, review_status
            ) VALUES (
                'hanuman-chalisa', 'verse-3',
                'महाबीर बिक्रम बजरंगी। कुमति निवार सुमति के संगी।।',
                'महावीर विक्रम बजरंगी। कुमति निवार सुमति के संगी।।',
                'गीताप्रेस गोरखपुर — चालीसा-संग्रह (कोड 1374), पृष्ठ 4',
                'गीताप्रेस संस्करण में ब के स्थान पर व (महावीर विक्रम) मुद्रित है। कृपया जांच करें।',
                'gk_anon_test_devotee', 'pending'
            )
        ");
        $sampleStmt->execute();

        echo json_encode([
            'success' => true,
            'message' => 'Sample errata report inserted for testing Option A review queue.',
        ]);
        break;

    case 'fetch_cloud_errata':
        $apiUrl = rtrim($cmsConfig['cloud_api_url'] ?? '', '/');
        $adminKey = $cmsConfig['admin_api_key'] ?? '';

        if (!$apiUrl) {
            echo json_encode(['error' => 'Cloud API URL not configured in tools/cms/config.php']);
            break;
        }

        $opts = [
            'http' => [
                'method' => 'GET',
                'header' => "X-Admin-Key: {$adminKey}\r\nAccept: application/json\r\n",
                'timeout' => 5,
                'ignore_errors' => true,
            ]
        ];
        $context = stream_context_create($opts);
        $res = @file_get_contents("{$apiUrl}/api/errata/pending", false, $context);

        if ($res === false) {
            echo json_encode(['error' => "Cannot connect to Cloud API at {$apiUrl}. Ensure server is running."]);
            break;
        }

        $data = json_decode($res, true);
        if (isset($data['error'])) {
            echo json_encode(['error' => "Cloud API responded: {$data['error']}"]);
            break;
        }

        $cloudReports = $data['reports'] ?? [];
        $imported = 0;

        $insertStmt = $pdo->prepare("
            INSERT INTO local_errata_reviews (
                cloud_report_id, text_slug, verse_id, selected_text, suggested_text,
                book_reference, user_note, anon_device_id, review_status
            ) VALUES (
                :cloud_id, :text_slug, :verse_id, :selected_text, :suggested_text,
                :book_ref, :user_note, :device_id, 'pending'
            )
        ");

        $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM local_errata_reviews WHERE cloud_report_id = :cloud_id");

        foreach ($cloudReports as $cr) {
            $checkStmt->execute([':cloud_id' => $cr['id']]);
            if ((int)$checkStmt->fetchColumn() === 0) {
                $insertStmt->execute([
                    ':cloud_id' => $cr['id'],
                    ':text_slug' => $cr['text_slug'],
                    ':verse_id' => $cr['verse_id'] ?? 'general',
                    ':selected_text' => $cr['selected_text'],
                    ':suggested_text' => $cr['suggested_text'],
                    ':book_ref' => $cr['book_reference'] ?? null,
                    ':user_note' => $cr['user_note'] ?? null,
                    ':device_id' => $cr['anon_device_id'] ?? 'unknown',
                ]);
                $imported++;
            }
        }

        echo json_encode([
            'success' => true,
            'message' => "Successfully imported {$imported} new errata report(s) from Cloud API.",
            'imported' => $imported,
        ]);
        break;

    case 'search_verses':
        $q = trim($_GET['q'] ?? '');
        if (mb_strlen($q) < 2) {
            echo json_encode(['results' => []]);
            break;
        }

        $stmt = $pdo->prepare("
            SELECT b.id, b.text_slug, b.verse_num, b.block_type, b.content_raw, t.title as text_title
            FROM blocks b
            JOIN texts t ON t.slug = b.text_slug
            WHERE b.content_raw LIKE :query
            ORDER BY t.weight ASC, b.verse_num ASC
            LIMIT 50
        ");
        $stmt->execute([':query' => "%{$q}%"]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['results' => $results]);
        break;

    case 'sync_all_from_git':
        // Re-runs ingest script
        require_once $rootDir . '/scripts/pipeline/md-to-sqlite.php';
        echo json_encode(['success' => true, 'message' => 'All texts re-ingested from Git into SQLite!']);
        break;

    case 'export_all_to_git':
        // Re-runs export script
        exec("php " . escapeshellarg($rootDir . '/scripts/pipeline/sqlite-to-md.php'), $output, $code);
        echo json_encode([
            'success' => $code === 0,
            'message' => 'All SQLite texts exported to Git Markdown files.',
            'output' => implode("\n", $output),
        ]);
        break;

    default:
        echo json_encode(['error' => 'Unknown action: ' . htmlspecialchars($action)]);
        break;
}
