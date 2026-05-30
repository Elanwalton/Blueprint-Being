<?php
require_once '../../config/cors.php';
require_once '../../config/jwt.php';

// Verify token
$user = verifyToken();

$method = $_SERVER['REQUEST_METHOD'];
$uploadsDir = '../../uploads/';

// Ensure directory exists
if (!file_exists($uploadsDir)) {
    mkdir($uploadsDir, 0755, true);
}

// Ensure trailing slash for paths
$baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]";
$baseUploadUrl = $baseUrl . '/Carson-blog/backend/uploads/';

if ($method === 'GET') {
    $files = scandir($uploadsDir);
    $media = [];

    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..' && !is_dir($uploadsDir . $file)) {
            $media[] = [
                'filename' => $file,
                'url' => $baseUploadUrl . $file,
                'size' => filesize($uploadsDir . $file),
                'created_at' => filemtime($uploadsDir . $file)
            ];
        }
    }

    // Sort by newest first
    usort($media, function($a, $b) {
        return $b['created_at'] - $a['created_at'];
    });

    http_response_code(200);
    echo json_encode(['media' => $media]);
    exit;
}

if ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->filename) || empty($data->filename)) {
        http_response_code(400);
        echo json_encode(['message' => 'Filename is required']);
        exit;
    }

    $filename = basename($data->filename); // Prevent path traversal
    $filepath = $uploadsDir . $filename;

    if (file_exists($filepath)) {
        if (unlink($filepath)) {
            http_response_code(200);
            echo json_encode(['message' => 'File deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to delete file']);
        }
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'File not found']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['message' => 'Method not allowed']);
exit;
?>
