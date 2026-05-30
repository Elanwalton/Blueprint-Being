<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->token) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing token or password']);
    exit;
}

// Validate password strength
if (strlen($data->password) < 6) {
    http_response_code(400);
    echo json_encode(['message' => 'Password must be at least 6 characters']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Find user with valid token
    $query = "SELECT id FROM users WHERE reset_token = :token AND reset_expires > NOW()";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':token', $data->token);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Update password and clear token
        $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
        
        $updateQuery = "UPDATE users SET password_hash = :password_hash, reset_token = NULL, reset_expires = NULL WHERE id = :id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':password_hash', $password_hash);
        $updateStmt->bindParam(':id', $user['id']);
        
        if ($updateStmt->execute()) {
            http_response_code(200);
            echo json_encode(['message' => 'Password has been reset successfully.']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Unable to update password.']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid or expired token.']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Server error: ' . $e->getMessage()]);
}
?>
