<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';

$user = verifyToken();

// Admins have full access; editors can manage authors and subscribers
if (!in_array($user['role'], ['admin', 'editor'])) {
    http_response_code(403);
    echo json_encode(['message' => 'Access denied']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    $database = new Database();
    $db = $database->getConnection();

    if ($method === 'GET') {
        // Editors cannot see admin accounts
        if ($user['role'] === 'editor') {
            $query = "SELECT id, username, email, role, profile_picture, created_at FROM users WHERE role IN ('author','contributor','subscriber') ORDER BY created_at DESC";
            $stmt = $db->prepare($query);
        } else {
            $query = "SELECT id, username, email, role, profile_picture, created_at FROM users ORDER BY created_at DESC";
            $stmt = $db->prepare($query);
        }
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['users' => $users]);

    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->username) || !isset($data->email) || !isset($data->password)) {
            http_response_code(400);
            echo json_encode(['message' => 'Username, email, and password are required']);
            exit;
        }

        if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['message' => 'Invalid email format']);
            exit;
        }

        $check_stmt = $db->prepare("SELECT id FROM users WHERE email = :email OR username = :username");
        $check_stmt->execute([':email' => $data->email, ':username' => $data->username]);
        if ($check_stmt->rowCount() > 0) {
            http_response_code(400);
            echo json_encode(['message' => 'Email or username already exists']);
            exit;
        }

        $role = $data->role ?? 'author';
        // Editors cannot create admins or other editors
        if ($user['role'] === 'editor' && in_array($role, ['admin', 'editor'])) {
            http_response_code(403);
            echo json_encode(['message' => 'Editors cannot create admin or editor accounts']);
            exit;
        }

        $password_hash = password_hash($data->password, PASSWORD_DEFAULT);
        $stmt = $db->prepare("INSERT INTO users (username, email, password_hash, role) VALUES (:username, :email, :hash, :role)");
        $stmt->execute([':username' => $data->username, ':email' => $data->email, ':hash' => $password_hash, ':role' => $role]);

        http_response_code(201);
        echo json_encode(['message' => 'User created successfully', 'user_id' => $db->lastInsertId()]);

    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->id) || !isset($data->role)) {
            http_response_code(400);
            echo json_encode(['message' => 'User ID and role are required']);
            exit;
        }

        if ($data->id == $user['id']) {
            http_response_code(400);
            echo json_encode(['message' => 'You cannot change your own role']);
            exit;
        }

        // Editors cannot promote to admin/editor
        if ($user['role'] === 'editor' && in_array($data->role, ['admin', 'editor'])) {
            http_response_code(403);
            echo json_encode(['message' => 'Editors cannot assign admin or editor roles']);
            exit;
        }

        $stmt = $db->prepare("UPDATE users SET role = :role WHERE id = :id");
        $stmt->execute([':role' => $data->role, ':id' => $data->id]);
        echo json_encode(['message' => 'User role updated successfully']);

    } elseif ($method === 'DELETE') {
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['message' => 'User ID is required']);
            exit;
        }

        $uid = $_GET['id'];
        if ($uid == $user['id']) {
            http_response_code(400);
            echo json_encode(['message' => 'You cannot delete your own account']);
            exit;
        }

        // Editors cannot delete admins/editors
        $target = $db->prepare("SELECT role FROM users WHERE id = :id");
        $target->execute([':id' => $uid]);
        $target_user = $target->fetch(PDO::FETCH_ASSOC);
        if ($user['role'] === 'editor' && $target_user && in_array($target_user['role'], ['admin', 'editor'])) {
            http_response_code(403);
            echo json_encode(['message' => 'Editors cannot delete admin accounts']);
            exit;
        }

        $stmt = $db->prepare("DELETE FROM users WHERE id = :id");
        $stmt->execute([':id' => $uid]);
        echo json_encode(['message' => 'User deleted successfully']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Server error: ' . $e->getMessage()]);
}
?>
