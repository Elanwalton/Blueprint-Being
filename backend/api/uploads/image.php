<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';

// Verify token
$user = verifyToken();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
    exit;
}

// Check if file was uploaded
if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['message' => 'No file uploaded']);
    exit;
}

$file = $_FILES['image'];

// Validate file
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
$maxSize = 5 * 1024 * 1024; // 5MB

if (!in_array($file['type'], $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.']);
    exit;
}

if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['message' => 'File too large. Maximum size is 5MB.']);
    exit;
}

if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(500);
    echo json_encode(['message' => 'Upload error occurred']);
    exit;
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('img_' . time() . '_') . '.' . $extension;
$uploadPath = '../../uploads/' . $filename;

// Create uploads directory if it doesn't exist
if (!file_exists('../../uploads')) {
    mkdir('../../uploads', 0755, true);
}

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to save file']);
    exit;
}

// Return file URL
$baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
$fileUrl = $baseUrl . '/Carson-blog/backend/uploads/' . $filename;

http_response_code(200);
echo json_encode([
    'message' => 'File uploaded successfully',
    'url' => $fileUrl,
    'filename' => $filename
]);
?>
