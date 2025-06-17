<?php
/**
 * Handle image uploads
 */

require_once 'config.php';

// Verify authentication
if (!isset($_POST['auth']) || !verifyAuth($_POST['auth'])) {
    sendResponse(false, null, 'Unauthorized');
}

// Check if file was uploaded
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $errorMessage = 'No file uploaded';
    if (isset($_FILES['image']['error'])) {
        switch ($_FILES['image']['error']) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                $errorMessage = 'File is too large';
                break;
            case UPLOAD_ERR_PARTIAL:
                $errorMessage = 'File was only partially uploaded';
                break;
            case UPLOAD_ERR_NO_FILE:
                $errorMessage = 'No file was uploaded';
                break;
            case UPLOAD_ERR_NO_TMP_DIR:
                $errorMessage = 'Missing temporary folder';
                break;
            case UPLOAD_ERR_CANT_WRITE:
                $errorMessage = 'Failed to write file to disk';
                break;
            default:
                $errorMessage = 'Unknown upload error';
        }
    }
    sendResponse(false, null, $errorMessage);
}

$uploadedFile = $_FILES['image'];

// Validate file size
if ($uploadedFile['size'] > MAX_UPLOAD_SIZE) {
    sendResponse(false, null, 'File size exceeds maximum allowed size of ' . (MAX_UPLOAD_SIZE / 1024 / 1024) . 'MB');
}

// Validate file type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $uploadedFile['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, ALLOWED_IMAGE_TYPES)) {
    sendResponse(false, null, 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed');
}

try {
    // Generate unique filename
    $extension = pathinfo($uploadedFile['name'], PATHINFO_EXTENSION);
    $filename = uniqid('img_') . '_' . time() . '.' . strtolower($extension);
    $targetPath = UPLOAD_DIR . '/' . $filename;
    
    // Move uploaded file
    if (!move_uploaded_file($uploadedFile['tmp_name'], $targetPath)) {
        throw new Exception('Failed to move uploaded file');
    }
    
    // Make sure the file has proper permissions
    chmod($targetPath, 0644);
    
    // Generate relative URL for the image
    $imageUrl = 'img/uploads/' . $filename;
    
    sendResponse(true, [
        'url' => $imageUrl,
        'filename' => $filename,
        'size' => $uploadedFile['size'],
        'type' => $mimeType,
        'message' => 'Image uploaded successfully'
    ]);
    
} catch (Exception $e) {
    // Clean up on error
    if (isset($targetPath) && file_exists($targetPath)) {
        unlink($targetPath);
    }
    sendResponse(false, null, 'Error uploading image: ' . $e->getMessage());
}