<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email)) {
    http_response_code(400);
    echo json_encode(['message' => 'Email is required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    // Check if email exists
    $query = "SELECT id, username FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $data->email);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Generate token
        $token = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));

        // Update user with token
        $updateQuery = "UPDATE users SET reset_token = :token, reset_expires = :expiry WHERE id = :id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':token', $token);
        $updateStmt->bindParam(':expiry', $expiry);
        $updateStmt->bindParam(':id', $user['id']);
        
        if ($updateStmt->execute()) {
            // In a real application, you would send an email here.
            // For development/demo purposes, we'll return the token in the response
            // so it can be used for testing without email setup.
            
            $resetLink = "http://localhost:3000/reset-password?token=" . $token;
            
            // Basic email sending logic (might need config to work on localhost)
            $to = $data->email;
            $subject = "Password Reset Request";
            $message = "Click the following link to reset your password: " . $resetLink;
            $headers = "From: noreply@example.com";
            
            // Try to send email, but don't fail if it doesn't work in dev
            @mail($to, $subject, $message, $headers); // Suppress errors with @

            http_response_code(200);
            echo json_encode([
                'message' => 'Password reset link sent to your email.',
                'debug_token' => $token, // REMOVE IN PRODUCTION
                'debug_link' => $resetLink // REMOVE IN PRODUCTION
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Unable to generate reset token.']);
        }
    } else {
        // Don't reveal that the user doesn't exist for security
        http_response_code(200);
        echo json_encode(['message' => 'If your email exists in our system, you will receive a password reset link.']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Server error: ' . $e->getMessage()]);
}
?>
