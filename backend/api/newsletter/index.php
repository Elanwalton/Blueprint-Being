<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if ($method === 'GET') {
        // Get all subscribers (admin only)
        require_once '../../config/jwt.php';
        $user = verifyToken();
        
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['message' => 'Admin access required']);
            exit;
        }
        
        $query = "SELECT id, email, name, status, is_verified, created_at FROM newsletter_subscribers ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $subscribers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode(['subscribers' => $subscribers]);
        
    } elseif ($method === 'POST') {
        // Subscribe to newsletter
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->email)) {
            http_response_code(400);
            echo json_encode(['message' => 'Email is required']);
            exit;
        }
        
        if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['message' => 'Invalid email format']);
            exit;
        }
        
        // Check if already subscribed
        $check_query = "SELECT id, status FROM newsletter_subscribers WHERE email = :email";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(':email', $data->email);
        $check_stmt->execute();
        
        if ($check_stmt->rowCount() > 0) {
            $existing = $check_stmt->fetch();
            if ($existing['status'] === 'active') {
                http_response_code(400);
                echo json_encode(['message' => 'Email already subscribed']);
                exit;
            } else {
                // Reactivate subscription
                $update_query = "UPDATE newsletter_subscribers SET status = 'active', subscribed_at = NOW() WHERE email = :email";
                $update_stmt = $db->prepare($update_query);
                $update_stmt->bindParam(':email', $data->email);
                $update_stmt->execute();
                
                http_response_code(200);
                echo json_encode(['message' => 'Subscription reactivated successfully']);
                exit;
            }
        }
        
        // Generate verification token
        $verification_token = bin2hex(random_bytes(32));
        
        $query = "INSERT INTO newsletter_subscribers (email, name, verification_token) 
                  VALUES (:email, :name, :verification_token)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $data->email);
        $name = $data->name ?? '';
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':verification_token', $verification_token);
        
        if ($stmt->execute()) {
            // In production, send verification email here
            
            http_response_code(201);
            echo json_encode([
                'message' => 'Subscribed successfully! Please check your email to verify.',
                'verification_token' => $verification_token // Only for testing, remove in production
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Unable to subscribe']);
        }
        
    } elseif ($method === 'PUT') {
        // Verify email
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->token)) {
            http_response_code(400);
            echo json_encode(['message' => 'Verification token is required']);
            exit;
        }
        
        $query = "UPDATE newsletter_subscribers SET verified = TRUE WHERE verification_token = :token";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':token', $data->token);
        
        if ($stmt->execute() && $stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(['message' => 'Email verified successfully']);
        } else {
            http_response_code(400);
            echo json_encode(['message' => 'Invalid verification token']);
        }
        
    } elseif ($method === 'DELETE') {
        // Unsubscribe
        if (!isset($_GET['email'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Email is required']);
            exit;
        }
        
        $email = $_GET['email'];
        
        $query = "UPDATE newsletter_subscribers SET status = 'unsubscribed', unsubscribed_at = NOW() WHERE email = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $email);
        
        if ($stmt->execute() && $stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode(['message' => 'Unsubscribed successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Email not found']);
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Server error: ' . $e->getMessage()]);
}
?>
