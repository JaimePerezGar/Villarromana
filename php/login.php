<?php
/**
 * Login endpoint for the editor system
 */

require_once 'config.php';

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($input['username']) || !isset($input['password'])) {
    sendResponse(false, null, 'Username and password are required');
}

$username = $input['username'];
$password = $input['password'];

// Verify credentials
if ($username === ADMIN_USERNAME && $password === ADMIN_PASSWORD) {
    // Set session
    $_SESSION['authenticated'] = true;
    $_SESSION['username'] = $username;
    $_SESSION['login_time'] = time();
    
    // Generate a token for the session
    $token = bin2hex(random_bytes(32));
    $_SESSION['token'] = $token;
    
    sendResponse(true, [
        'message' => 'Login successful',
        'token' => $token,
        'sessionId' => session_id()
    ]);
} else {
    sendResponse(false, null, 'Invalid credentials');
}