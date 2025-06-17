<?php
/**
 * Configuration file for the editor system
 */

// Security settings
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', 'metadrop2024');

// Directory settings
define('CONTENT_DIR', __DIR__ . '/../content');
define('UPLOAD_DIR', __DIR__ . '/../img/uploads');
define('MAX_UPLOAD_SIZE', 10 * 1024 * 1024); // 10MB

// Allowed image types
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']);

// Session settings
session_start();

// CORS headers for local development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set JSON response header
header('Content-Type: application/json; charset=utf-8');

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Create directories if they don't exist
if (!file_exists(CONTENT_DIR)) {
    mkdir(CONTENT_DIR, 0755, true);
}

if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

/**
 * Verify authentication
 */
function verifyAuth($auth) {
    return $auth === ADMIN_PASSWORD;
}

/**
 * Send JSON response
 */
function sendResponse($success, $data = null, $error = null) {
    $response = ['success' => $success];
    
    if ($data !== null) {
        $response = array_merge($response, $data);
    }
    
    if ($error !== null) {
        $response['error'] = $error;
    }
    
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit();
}

/**
 * Sanitize file path
 */
function sanitizePath($path) {
    // Remove any directory traversal attempts
    $path = str_replace(['../', '..\\', '..', './', '.\\'], '', $path);
    $path = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $path);
    return $path;
}