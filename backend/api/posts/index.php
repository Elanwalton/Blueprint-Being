<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get query parameters
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $category = isset($_GET['category']) ? $_GET['category'] : null;
    $tag = isset($_GET['tag']) ? $_GET['tag'] : null;
    $search = isset($_GET['search']) ? $_GET['search'] : null;
    $status = isset($_GET['status']) ? $_GET['status'] : 'published';
    
    $offset = ($page - 1) * $limit;
    
    // Build query
    $where_clauses = ["p.status = :status"];
    $params = [':status' => $status];
    
    if ($status === 'published') {
        $where_clauses[] = "(p.publish_date IS NULL OR p.publish_date <= NOW())";
    }
    
    if ($category) {
        $where_clauses[] = "c.slug = :category";
        $params[':category'] = $category;
    }
    
    if ($tag) {
        $where_clauses[] = "t.slug = :tag";
        $params[':tag'] = $tag;
    }
    
    if ($search) {
        $where_clauses[] = "(p.title LIKE :search OR p.content LIKE :search OR p.excerpt LIKE :search)";
        $params[':search'] = "%{$search}%";
    }
    
    $where_sql = implode(' AND ', $where_clauses);
    
    // Count total posts
    $count_query = "SELECT COUNT(DISTINCT p.id) as total 
                    FROM posts p
                    LEFT JOIN users u ON p.author_id = u.id
                    LEFT JOIN categories c ON p.category_id = c.id
                    LEFT JOIN post_tags pt ON p.id = pt.post_id
                    LEFT JOIN tags t ON pt.tag_id = t.id
                    WHERE {$where_sql}";
    
    $count_stmt = $db->prepare($count_query);
    foreach ($params as $key => $value) {
        $count_stmt->bindValue($key, $value);
    }
    $count_stmt->execute();
    $total = $count_stmt->fetch()['total'];
    
    // Get posts
    $query = "SELECT DISTINCT p.id, p.title, p.slug, p.excerpt, p.content, p.featured_image, 
                     p.publish_date, p.view_count, p.created_at, p.updated_at, p.status, p.word_count,
                     u.id as author_id, u.username as author_name, u.profile_picture as author_picture,
                     c.id as category_id, c.name as category_name, c.slug as category_slug,
                     (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND status = 'approved') as comment_count
              FROM posts p
              LEFT JOIN users u ON p.author_id = u.id
              LEFT JOIN categories c ON p.category_id = c.id
              LEFT JOIN post_tags pt ON p.id = pt.post_id
              LEFT JOIN tags t ON pt.tag_id = t.id
              WHERE {$where_sql}
              ORDER BY p.publish_date DESC, p.created_at DESC
              LIMIT :limit OFFSET :offset";
    
    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $posts = [];
    while ($row = $stmt->fetch()) {
        // Get tags for this post
        $tag_query = "SELECT t.id, t.name, t.slug 
                      FROM tags t
                      INNER JOIN post_tags pt ON t.id = pt.tag_id
                      WHERE pt.post_id = :post_id";
        $tag_stmt = $db->prepare($tag_query);
        $tag_stmt->bindParam(':post_id', $row['id']);
        $tag_stmt->execute();
        $tags = $tag_stmt->fetchAll();
        
        $posts[] = [
            'id' => $row['id'],
            'title' => $row['title'],
            'slug' => $row['slug'],
            'excerpt' => $row['excerpt'],
            'content' => $row['content'],
            'featured_image' => $row['featured_image'],
            'status' => $row['status'],
            'word_count' => (int)$row['word_count'],
            'publish_date' => $row['publish_date'],
            'view_count' => (int)$row['view_count'],
            'comment_count' => (int)$row['comment_count'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            'author' => [
                'id' => $row['author_id'],
                'name' => $row['author_name'],
                'picture' => $row['author_picture']
            ],
            'category' => $row['category_id'] ? [
                'id' => $row['category_id'],
                'name' => $row['category_name'],
                'slug' => $row['category_slug']
            ] : null,
            'tags' => $tags
        ];
    }
    
    http_response_code(200);
    echo json_encode([
        'posts' => $posts,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $limit,
            'total' => (int)$total,
            'total_pages' => ceil($total / $limit)
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Server error: ' . $e->getMessage()]);
}
?>
