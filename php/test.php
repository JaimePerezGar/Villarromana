<?php
/**
 * Test script to verify PHP is working correctly
 */

header('Content-Type: text/plain; charset=utf-8');

echo "PHP Editor System Test\n";
echo "======================\n\n";

// PHP Version
echo "PHP Version: " . PHP_VERSION . "\n";
echo "Operating System: " . PHP_OS . "\n\n";

// Check required extensions
$requiredExtensions = ['gd', 'json', 'session'];
echo "Required Extensions:\n";
foreach ($requiredExtensions as $ext) {
    $status = extension_loaded($ext) ? '✓' : '✗';
    echo "  $status $ext\n";
}
echo "\n";

// Check directories
echo "Directory Permissions:\n";
$directories = [
    '../content' => 'Content directory',
    '../content/backups' => 'Backups directory',
    '../img/uploads' => 'Uploads directory',
    '../logs' => 'Logs directory'
];

foreach ($directories as $dir => $name) {
    $path = __DIR__ . '/' . $dir;
    $exists = file_exists($path) ? '✓' : '✗';
    $writable = is_writable($path) ? '✓' : '✗';
    echo "  $name:\n";
    echo "    Exists: $exists\n";
    echo "    Writable: $writable\n";
}
echo "\n";

// Check upload settings
echo "Upload Settings:\n";
echo "  upload_max_filesize: " . ini_get('upload_max_filesize') . "\n";
echo "  post_max_size: " . ini_get('post_max_size') . "\n";
echo "  max_file_uploads: " . ini_get('max_file_uploads') . "\n";
echo "\n";

// Test session
session_start();
$_SESSION['test'] = 'Session working';
echo "Session Test: " . (isset($_SESSION['test']) ? '✓ Working' : '✗ Not working') . "\n\n";

// Test JSON encoding
$testData = ['test' => 'data', 'unicode' => 'ñáéíóú'];
$jsonTest = json_encode($testData, JSON_UNESCAPED_UNICODE);
echo "JSON Test: " . ($jsonTest ? '✓ Working' : '✗ Not working') . "\n";
echo "  Encoded: " . $jsonTest . "\n\n";

echo "All tests completed!\n";