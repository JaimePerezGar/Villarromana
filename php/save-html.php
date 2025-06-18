<?php
/**
 * Save HTML content directly to page files
 * This is part of the advanced editor system
 */

require_once 'config.php';

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($input['auth']) || !verifyAuth($input['auth'])) {
    sendResponse(false, null, 'Unauthorized');
}

if (!isset($input['page']) || !isset($input['html'])) {
    sendResponse(false, null, 'Missing required parameters');
}

$pageIdentifier = $input['page'];
$htmlContent = $input['html'];
$createBackup = isset($input['backup']) ? $input['backup'] : true;

try {
    // Determine the actual file path based on page identifier
    $filePath = getHtmlFilePath($pageIdentifier);
    
    if (!$filePath || !file_exists($filePath)) {
        throw new Exception('Page file not found: ' . $pageIdentifier);
    }
    
    // Create backup if requested
    if ($createBackup) {
        $backupDir = dirname(__DIR__) . '/backups/html';
        if (!file_exists($backupDir)) {
            mkdir($backupDir, 0755, true);
        }
        
        $backupPath = $backupDir . '/' . $pageIdentifier . '_' . date('Y-m-d_H-i-s') . '.html';
        copy($filePath, $backupPath);
        
        // Keep only last 10 backups per page
        cleanOldBackups($backupDir, $pageIdentifier, 10);
    }
    
    // Process HTML before saving
    $processedHtml = processHtmlForSaving($htmlContent);
    
    // Save the HTML file
    $saved = file_put_contents($filePath, $processedHtml);
    
    if ($saved === false) {
        throw new Exception('Failed to save HTML file');
    }
    
    // Log the save
    logSave($pageIdentifier, $filePath);
    
    sendResponse(true, [
        'message' => 'HTML saved successfully',
        'file' => $filePath,
        'backup' => $createBackup ? $backupPath : null,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    sendResponse(false, null, 'Error saving HTML: ' . $e->getMessage());
}

/**
 * Get the actual file path for a page identifier
 */
function getHtmlFilePath($pageIdentifier) {
    $baseDir = dirname(__DIR__);
    
    // Map page identifiers to actual file paths
    $pageMap = [
        'index' => '/index.html',
        'pages_instalaciones' => '/pages/instalaciones.html',
        'pages_ubicacion' => '/pages/ubicacion.html',
        'pages_entorno' => '/pages/entorno.html',
        'pages_galeria' => '/pages/galeria.html',
        'pages_contacto' => '/pages/contacto.html',
        'pages_comentarios' => '/pages/comentarios.html',
        'en_index' => '/en/index.html',
        'en_pages_facilities' => '/en/pages/facilities.html',
        'en_pages_location' => '/en/pages/location.html',
        'en_pages_environment' => '/en/pages/environment.html',
        'en_pages_gallery' => '/en/pages/gallery.html',
        'en_pages_contact' => '/en/pages/contact.html',
        'en_pages_reviews' => '/en/pages/reviews.html'
    ];
    
    if (isset($pageMap[$pageIdentifier])) {
        return $baseDir . $pageMap[$pageIdentifier];
    }
    
    // Try to construct path from identifier
    $path = str_replace('_', '/', $pageIdentifier);
    $fullPath = $baseDir . '/' . $path . '.html';
    
    if (file_exists($fullPath)) {
        return $fullPath;
    }
    
    return null;
}

/**
 * Process HTML content before saving
 */
function processHtmlForSaving($html) {
    // Create a DOMDocument
    $dom = new DOMDocument('1.0', 'UTF-8');
    
    // Suppress warnings for HTML5 elements
    libxml_use_internal_errors(true);
    
    // Load HTML with UTF-8 encoding
    $dom->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_HTML_NOPIDTENT | LIBXML_HTML_NODEFDTD);
    
    // Clear errors
    libxml_clear_errors();
    
    // Remove the XML declaration we added
    $html = $dom->saveHTML();
    $html = preg_replace('/<\?xml encoding="UTF-8"\>/', '', $html);
    
    // Clean up editor artifacts
    $patterns = [
        // Remove editor classes
        '/ class="editor-[^"]*"/',
        '/ editor-[^"]*="[^"]*"/',
        
        // Remove data attributes
        '/ data-editable="[^"]*"/',
        '/ data-editable-image="[^"]*"/',
        '/ data-editor-id="[^"]*"/',
        '/ contenteditable="[^"]*"/',
        
        // Remove editor wrapper divs
        '/<div class="editor-element-wrapper"[^>]*>/',
        '/<\/div>(\s*<!--.*?-->)?/',
        
        // Remove delete buttons
        '/<button class="editor-delete-btn"[^>]*>.*?<\/button>/',
        '/<button class="editor-list-item-delete"[^>]*>.*?<\/button>/',
        
        // Clean up empty class attributes
        '/ class=""/',
        '/ class=" "/',
        
        // Remove editor toolbar and panels
        '/<div id="advanced-editor-[^"]*"[^>]*>.*?<\/div>/s',
        '/<div class="editor-[^"]*"[^>]*>.*?<\/div>/s',
        
        // Remove inline styles added by editor
        '/ style="[^"]*outline[^"]*"/',
        '/ style="[^"]*cursor:\s*text[^"]*"/',
        '/ style="[^"]*min-height:\s*20px[^"]*"/',
    ];
    
    foreach ($patterns as $pattern) {
        $html = preg_replace($pattern, '', $html);
    }
    
    // Format the HTML nicely
    $dom = new DOMDocument('1.0', 'UTF-8');
    $dom->preserveWhiteSpace = false;
    $dom->formatOutput = true;
    
    libxml_use_internal_errors(true);
    $dom->loadHTML($html, LIBXML_HTML_NOPIDTENT | LIBXML_HTML_NODEFDTD);
    libxml_clear_errors();
    
    // Save formatted HTML
    $html = $dom->saveHTML();
    
    return $html;
}

/**
 * Clean old backups
 */
function cleanOldBackups($backupDir, $pageIdentifier, $keepCount) {
    $pattern = $backupDir . '/' . $pageIdentifier . '_*.html';
    $files = glob($pattern);
    
    if (count($files) > $keepCount) {
        // Sort by modification time
        usort($files, function($a, $b) {
            return filemtime($a) - filemtime($b);
        });
        
        // Remove oldest files
        $toDelete = array_slice($files, 0, count($files) - $keepCount);
        foreach ($toDelete as $file) {
            unlink($file);
        }
    }
}

/**
 * Log save action
 */
function logSave($pageIdentifier, $filePath) {
    $logDir = dirname(__DIR__) . '/logs';
    if (!file_exists($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logFile = $logDir . '/editor_saves.log';
    $logEntry = date('Y-m-d H:i:s') . " | Page: $pageIdentifier | File: $filePath | IP: " . $_SERVER['REMOTE_ADDR'] . PHP_EOL;
    
    file_put_contents($logFile, $logEntry, FILE_APPEND);
}