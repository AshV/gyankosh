<?php
declare(strict_types=1);

/**
 * cloud-api/index.php
 * Lightweight REST API for Gyankosh Cloud Backend.
 * Handles Anonymous Devotional Analytics and Option A Errata Submissions.
 */

$config = require __DIR__ . '/config.php';

// ── 1. CORS Handling ──────────────────────────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $config['allowed_origins'], true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
} else {
    // Default open for read/analytics requests or dev
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Key, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

// ── 2. Database Connection ───────────────────────────────────────
$dbConfig = $config['db'];
$dsn = "mysql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['database']};charset={$dbConfig['charset']}";

try {
    $pdo = new PDO($dsn, $dbConfig['username'], $dbConfig['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database connection failed',
        'details' => $e->getMessage(),
    ]);
    exit;
}

// ── 3. Helpers ────────────────────────────────────────────────────
function getJsonInput(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

function verifyAdminKey(array $config): bool {
    $headers = getallheaders();
    $providedKey = $headers['X-Admin-Key'] ?? $headers['x-admin-key'] ?? $_GET['admin_key'] ?? '';
    return hash_equals($config['admin_api_key'], $providedKey);
}

// ── 4. Routing ────────────────────────────────────────────────────
$action = $_GET['action'] ?? '';
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Match REST path or query param
if (str_ends_with($path, '/errata/report')) {
    $action = 'report_errata';
} elseif (str_ends_with($path, '/errata/pending')) {
    $action = 'pending_errata';
} elseif (str_ends_with($path, '/errata/resolve')) {
    $action = 'resolve_errata';
} elseif (str_ends_with($path, '/analytics/event')) {
    $action = 'analytics_event';
} elseif (str_ends_with($path, '/analytics/summary')) {
    $action = 'analytics_summary';
}

switch ($action) {
    // -------------------------------------------------------------
    // Public: Devotee reports a typo / errata
    // -------------------------------------------------------------
    case 'report_errata':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            break;
        }

        $input = getJsonInput();
        $textSlug = trim($input['text_slug'] ?? '');
        $verseId = trim($input['verse_id'] ?? '');
        $selectedText = trim($input['selected_text'] ?? '');
        $suggestedText = trim($input['suggested_text'] ?? '');
        $bookRef = trim($input['book_reference'] ?? '');
        $userNote = trim($input['user_note'] ?? '');
        $anonDeviceId = trim($input['anon_device_id'] ?? 'anonymous');

        if (!$textSlug || !$suggestedText) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            break;
        }

        $stmt = $pdo->prepare("
            INSERT INTO errata_reports (
                text_slug, verse_id, selected_text, suggested_text,
                book_reference, user_note, anon_device_id, status
            ) VALUES (
                :text_slug, :verse_id, :selected_text, :suggested_text,
                :book_reference, :user_note, :anon_device_id, 'pending'
            )
        ");
        $stmt->execute([
            ':text_slug' => $textSlug,
            ':verse_id' => $verseId ?: 'general',
            ':selected_text' => $selectedText,
            ':suggested_text' => $suggestedText,
            ':book_reference' => $bookRef ?: null,
            ':user_note' => $userNote ?: null,
            ':anon_device_id' => $anonDeviceId,
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'धन्यवाद! आपका सुझाव सत्यापन हेतु ज्ञानकोश सम्पादक मण्डल को भेज दिया गया है।',
            'report_id' => $pdo->lastInsertId(),
        ]);
        break;

    // -------------------------------------------------------------
    // Admin (Protected): Local CMS fetches pending errata reports
    // -------------------------------------------------------------
    case 'pending_errata':
        if (!verifyAdminKey($config)) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized: Invalid Admin Key']);
            break;
        }

        $stmt = $pdo->query("
            SELECT id, text_slug, verse_id, selected_text, suggested_text,
                   book_reference, user_note, anon_device_id, created_at
            FROM errata_reports
            WHERE status = 'pending'
            ORDER BY created_at ASC
        ");
        $reports = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'count' => count($reports),
            'reports' => $reports,
        ]);
        break;

    // -------------------------------------------------------------
    // Admin (Protected): Local CMS marks errata as resolved
    // -------------------------------------------------------------
    case 'resolve_errata':
        if (!verifyAdminKey($config)) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized: Invalid Admin Key']);
            break;
        }

        $input = getJsonInput();
        $reportId = (int)($input['report_id'] ?? 0);
        $status = $input['status'] ?? ''; // 'accepted' or 'rejected'
        $adminNotes = $input['admin_notes'] ?? '';

        if (!$reportId || !in_array($status, ['accepted', 'rejected'], true)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid parameters']);
            break;
        }

        $stmt = $pdo->prepare("
            UPDATE errata_reports
            SET status = :status,
                admin_notes = :admin_notes,
                resolved_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ");
        $stmt->execute([
            ':status' => $status,
            ':admin_notes' => $adminNotes,
            ':id' => $reportId,
        ]);

        echo json_encode([
            'success' => true,
            'message' => "Report {$reportId} marked as {$status}",
        ]);
        break;

    // -------------------------------------------------------------
    // Public: Anonymous Devotional Analytics Beacon
    // -------------------------------------------------------------
    case 'analytics_event':
        $input = getJsonInput();
        $anonDeviceId = trim($input['anon_device_id'] ?? '');
        $eventType = trim($input['event_type'] ?? '');
        $textSlug = trim($input['text_slug'] ?? '');
        $durationSeconds = (int)($input['duration_seconds'] ?? 0);
        $metadata = $input['metadata'] ?? null;

        $validEvents = ['view', 'read_start', 'read_finish', 'search_empty'];
        if (!$anonDeviceId || !in_array($eventType, $validEvents, true)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid analytics payload']);
            break;
        }

        // Generate privacy-safe IP hash (salted per day, raw IP never stored)
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        $ipHash = hash('sha256', $ip . date('Y-m-d') . 'gk_salt');

        $stmt = $pdo->prepare("
            INSERT INTO analytics_events (
                anon_device_id, event_type, text_slug, duration_seconds,
                metadata_json, ip_hash
            ) VALUES (
                :anon_device_id, :event_type, :text_slug, :duration_seconds,
                :metadata_json, :ip_hash
            )
        ");
        $stmt->execute([
            ':anon_device_id' => $anonDeviceId,
            ':event_type' => $eventType,
            ':text_slug' => $textSlug ?: null,
            ':duration_seconds' => $durationSeconds,
            ':metadata_json' => $metadata ? json_encode($metadata, JSON_UNESCAPED_UNICODE) : null,
            ':ip_hash' => $ipHash,
        ]);

        echo json_encode(['success' => true]);
        break;

    // -------------------------------------------------------------
    // Admin (Protected): Analytics Summary
    // -------------------------------------------------------------
    case 'analytics_summary':
        if (!verifyAdminKey($config)) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            break;
        }

        $topTexts = $pdo->query("
            SELECT text_slug, COUNT(*) as read_count, AVG(duration_seconds) as avg_duration
            FROM analytics_events
            WHERE event_type IN ('view', 'read_finish') AND text_slug IS NOT NULL
            GROUP BY text_slug
            ORDER BY read_count DESC
            LIMIT 15
        ")->fetchAll();

        $emptySearches = $pdo->query("
            SELECT metadata_json, COUNT(*) as count
            FROM analytics_events
            WHERE event_type = 'search_empty'
            GROUP BY metadata_json
            ORDER BY count DESC
            LIMIT 15
        ")->fetchAll();

        echo json_encode([
            'success' => true,
            'top_texts' => $topTexts,
            'empty_searches' => $emptySearches,
        ]);
        break;

    default:
        echo json_encode([
            'status' => 'online',
            'service' => 'Gyankosh Devotional API',
            'version' => '1.0.0',
            'endpoints' => [
                'POST /api/errata/report' => 'Report a typo or textual discrepancy (Anonymous)',
                'GET  /api/errata/pending' => 'Get pending reports (Admin Key required)',
                'POST /api/errata/resolve' => 'Resolve a report (Admin Key required)',
                'POST /api/analytics/event' => 'Log reading event (Anonymous)',
            ],
        ]);
        break;
}
