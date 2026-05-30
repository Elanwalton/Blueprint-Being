<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->username) || !isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing required fields']);
    exit;
}

// Validate email
if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid email format']);
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
    
    // Check if username exists
    $query = "SELECT id FROM users WHERE username = :username";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':username', $data->username);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(['message' => 'Username already exists']);
        exit;
    }
    
    // Check if email exists
    $query = "SELECT id FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $data->email);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(['message' => 'Email already exists']);
        exit;
    }
    
    // Create user
    $query = "INSERT INTO users (username, email, password_hash, role) VALUES (:username, :email, :password_hash, 'subscriber')";
    $stmt = $db->prepare($query);
    
    $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
    
    $stmt->bindParam(':username', $data->username);
    $stmt->bindParam(':email', $data->email);
    $stmt->bindParam(':password_hash', $password_hash);
    
    if ($stmt->execute()) {
        $user_id = $db->lastInsertId();
        
        // Generate JWT token
        $token_payload = [
            'id' => $user_id,
            'username' => $data->username,
            'email' => $data->email,
            'role' => 'subscriber',
            'exp' => time() + (7 * 24 * 60 * 60) // 7 days
        ];
        
        $jwt = JWTHelper::encode($token_payload);
        
        http_response_code(201);
        echo json_encode([
            'message' => 'User registered successfully',
            'token' => $jwt,
            'user' => [
                'id' => $user_id,
                'username' => $data->username,
                'email' => $data->email,
                'role' => 'subscriber'
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Unable to register user']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Server error: ' . $e->getMessage()]);
}
?>
