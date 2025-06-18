<?php
/**
 * Ultra-simple HTML saver for final-editor.js
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['html']) || !isset($input['page'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing html or page parameter']);
    exit;
}

$html = $input['html'];
$page = $input['page'];

// Sanitize page path
$page = str_replace(['../', '\\', '..\\'], '', $page);
if (empty($page) || $page === '/') {
    $page = 'index';
}
$page = ltrim($page, '/');
if (pathinfo($page, PATHINFO_EXTENSION) !== 'html') {
    $page .= '.html';
}

try {
    // Create backup first
    $backupDir = '../backups/html';
    if (!file_exists($backupDir)) {
        mkdir($backupDir, 0755, true);
    }
    
    $backupFile = $backupDir . '/' . pathinfo($page, PATHINFO_FILENAME) . '_' . date('Y-m-d_H-i-s') . '.html';
    
    // Backup existing file if it exists
    $targetFile = '../' . $page;
    if (file_exists($targetFile)) {
        copy($targetFile, $backupFile);
    }
    
    // Save new HTML
    $saved = file_put_contents($targetFile, $html);
    
    if ($saved === false) {
        throw new Exception('Failed to save HTML file');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'HTML saved successfully',
        'file' => $page,
        'backup' => $backupFile,
        'bytes' => $saved
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to save HTML: ' . $e->getMessage()
    ]);
}
?>