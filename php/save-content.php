<?php
/**
 * Save content changes to the server
 */

require_once 'config.php';

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($input['auth']) || !verifyAuth($input['auth'])) {
    sendResponse(false, null, 'Unauthorized');
}

if (!isset($input['pageUrl']) || !isset($input['changes'])) {
    sendResponse(false, null, 'Missing required parameters');
}

$pageUrl = sanitizePath($input['pageUrl']);
$changes = $input['changes'];

// Validate changes
if (!is_array($changes) || empty($changes)) {
    sendResponse(false, null, 'No changes provided');
}

try {
    // Create content file path
    $contentFile = CONTENT_DIR . '/' . $pageUrl . '.json';
    
    // Load existing content or create new array
    $existingContent = [];
    if (file_exists($contentFile)) {
        $existingContent = json_decode(file_get_contents($contentFile), true) ?: [];
    }
    
    // Merge changes with existing content
    foreach ($changes as $elementId => $content) {
        $existingContent[$elementId] = $content;
    }
    
    // Save content
    $saved = file_put_contents(
        $contentFile,
        json_encode($existingContent, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    );
    
    if ($saved === false) {
        throw new Exception('Failed to save content file');
    }
    
    // Also save a backup with timestamp
    $backupFile = CONTENT_DIR . '/backups/' . $pageUrl . '_' . date('Y-m-d_H-i-s') . '.json';
    $backupDir = dirname($backupFile);
    if (!file_exists($backupDir)) {
        mkdir($backupDir, 0755, true);
    }
    file_put_contents(
        $backupFile,
        json_encode($existingContent, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    );
    
    sendResponse(true, [
        'message' => 'Content saved successfully',
        'file' => $contentFile,
        'elementsUpdated' => count($changes)
    ]);
    
} catch (Exception $e) {
    sendResponse(false, null, 'Error saving content: ' . $e->getMessage());
}