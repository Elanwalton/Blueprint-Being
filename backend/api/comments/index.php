<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if ($method === 'GET') {
        // Check for admin access for moderation
        $is_admin = false;
        $status_filter = 'approved';
        
        try {
            $user = verifyToken();
            if ($user['role'] === 'admin') {
                $is_admin = true;
                $status_filter = $_GET['status'] ?? 'all';
            }
        } catch (Exception $e) {
            // Not logged in or invalid token - treat as public
        }
        
        // Public access requires post_id
        if (!$is_admin && !isset($_GET['post_id'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Post ID is required']);
            exit;
        }

        $params = [];
        $query = "SELECT c.id, c.content, c.created_at, c.parent_id, c.status,
                         u.id as user_id, u.username, u.profile_picture,
                         p.title as post_title
                  FROM comments c
                  INNER JOIN users u ON c.user_id = u.id
                  LEFT JOIN posts p ON c.post_id = p.id
                  WHERE 1=1";

        if (isset($_GET['post_id'])) {
            $query .= " AND c.post_id = :post_id";
            $params[':post_id'] = $_GET['post_id'];
        }

        if (!$is_admin) {
            $query .= " AND c.status = 'approved'";
        } elseif ($status_filter !== 'all') {
            $query .= " AND c.status = :status";
            $params[':status'] = $status_filter;
        }
        
        $query .= " ORDER BY c.created_at DESC";
        
        $stmt = $db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Only build tree if filtering by post_id
        if (isset($_GET['post_id'])) {
            $comment_tree = [];
            $comment_map = [];
            
            foreach ($comments as $comment) {
                $comment['replies'] = [];
                $comment_map[$comment['id']] = $comment;
            }
            
            foreach ($comment_map as $id => $comment) {
                if ($comment['parent_id'] === null) {
                    $comment_tree[] = &$comment_map[$id];
                } else {
                    if (isset($comment_map[$comment['parent_id']])) {
                        $comment_map[$comment['parent_id']]['replies'][] = &$comment_map[$id];
                    }
                }
            }
            $result = array_values($comment_tree);
        } else {
            $result = $comments;
        }
        
        http_response_code(200);
        echo json_encode(['comments' => $result]);
        
    } elseif ($method === 'POST') {
        // Create new comment
        $user = verifyToken();
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->post_id) || !isset($data->content)) {
            http_response_code(400);
            echo json_encode(['message' => 'Post ID and content are required']);
            exit;
        }
        
        // Simple spam check
        if (strlen($data->content) < 3) {
            http_response_code(400);
            echo json_encode(['message' => 'Comment is too short']);
            exit;
        }
        
        $query = "INSERT INTO comments (post_id, user_id, parent_id, content, status) 
                  VALUES (:post_id, :user_id, :parent_id, :content, 'pending')";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':post_id', $data->post_id);
        $stmt->bindParam(':user_id', $user['id']);
        $parent_id = $data->parent_id ?? null;
        $stmt->bindParam(':parent_id', $parent_id);
        $stmt->bindParam(':content', $data->content);
        
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode([
                'message' => 'Comment submitted for moderation',
                'comment_id' => $db->lastInsertId()
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Unable to create comment']);
        }
        
    } elseif ($method === 'PUT') {
        // Approve/reject comment (admin only)
        $user = verifyToken();
        
        if ($user['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['message' => 'Admin access required']);
            exit;
        }
        
        $data = json_decode(file_get_contents("php://input"));
        
        if (!isset($data->comment_id) || !isset($data->status)) {
            http_response_code(400);
            echo json_encode(['message' => 'Comment ID and status are required']);
            exit;
        }
        
        $query = "UPDATE comments SET status = :status WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':status', $data->status);
        $stmt->bindParam(':id', $data->comment_id);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(['message' => 'Comment status updated']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Unable to update comment']);
        }
        
    } elseif ($method === 'DELETE') {
        // Delete comment
        $user = verifyToken();
        
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Comment ID is required']);
            exit;
        }
        
        $comment_id = $_GET['id'];
        
        // Check if user owns the comment or is admin
        $check_query = "SELECT user_id FROM comments WHERE id = :id";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(':id', $comment_id);
        $check_stmt->execute();
        $comment = $check_stmt->fetch();
        
        if (!$comment || ($comment['user_id'] != $user['id'] && $user['role'] !== 'admin')) {
            http_response_code(403);
            echo json_encode(['message' => 'You can only delete your own comments']);
            exit;
        }
        
        $query = "UPDATE comments SET status = 'deleted' WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $comment_id);
        
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(['message' => 'Comment deleted']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Unable to delete comment']);
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Server error: ' . $e->getMessage()]);
}
?>
