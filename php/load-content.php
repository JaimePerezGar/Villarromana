<?php
/**
 * Load saved content for a page
 */

require_once 'config.php';

// Get page parameter
$page = isset($_GET['page']) ? sanitizePath($_GET['page']) : 'index';

try {
    // Create content file path
    $contentFile = CONTENT_DIR . '/' . $page . '.json';
    
    // Check if content file exists
    if (file_exists($contentFile)) {
        $content = json_decode(file_get_contents($contentFile), true);
        
        if ($content === null) {
            throw new Exception('Invalid content file format');
        }
        
        sendResponse(true, [
            'content' => $content,
            'page' => $page,
            'lastModified' => date('Y-m-d H:i:s', filemtime($contentFile))
        ]);
    } else {
        // No saved content for this page
        sendResponse(true, [
            'content' => [],
            'page' => $page,
            'message' => 'No saved content found'
        ]);
    }
    
} catch (Exception $e) {
    sendResponse(false, null, 'Error loading content: ' . $e->getMessage());
}