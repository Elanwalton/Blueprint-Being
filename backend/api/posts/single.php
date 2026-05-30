<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

if (!isset($_GET['slug'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Slug parameter required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $slug = $_GET['slug'];
    
    // Get post
    $query = "SELECT p.id, p.title, p.slug, p.excerpt, p.content, p.featured_image, 
                     p.publish_date, p.view_count, p.meta_title, p.meta_description, 
                     p.meta_keywords, p.created_at, p.updated_at, p.status,
                     u.id as author_id, u.username as author_name, u.profile_picture as author_picture, u.bio as author_bio,
                     c.id as category_id, c.name as category_name, c.slug as category_slug
              FROM posts p
              LEFT JOIN users u ON p.author_id = u.id
              LEFT JOIN categories c ON p.category_id = c.id
              WHERE p.slug = :slug";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':slug', $slug);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['message' => 'Post not found']);
        exit;
    }
    
    $post = $stmt->fetch();
    
    // Get tags
    $tag_query = "SELECT t.id, t.name, t.slug 
                  FROM tags t
                  INNER JOIN post_tags pt ON t.id = pt.tag_id
                  WHERE pt.post_id = :post_id";
    $tag_stmt = $db->prepare($tag_query);
    $tag_stmt->bindParam(':post_id', $post['id']);
    $tag_stmt->execute();
    $tags = $tag_stmt->fetchAll();
    
    // Get related posts (same category or tags)
    $related_query = "SELECT DISTINCT p2.id, p2.title, p2.slug, p2.excerpt, p2.featured_image, p2.publish_date
                      FROM posts p2
                      LEFT JOIN post_tags pt2 ON p2.id = pt2.post_id
                      WHERE p2.id != :post_id 
                      AND p2.status = 'published'
                      AND (p2.publish_date IS NULL OR p2.publish_date <= NOW())
                      AND (p2.category_id = :category_id OR pt2.tag_id IN (
                          SELECT tag_id FROM post_tags WHERE post_id = :post_id
                      ))
                      ORDER BY p2.publish_date DESC
                      LIMIT 3";
    $related_stmt = $db->prepare($related_query);
    $related_stmt->bindParam(':post_id', $post['id']);
    $related_stmt->bindParam(':category_id', $post['category_id']);
    $related_stmt->execute();
    $related_posts = $related_stmt->fetchAll();
    
    // Increment view count
    $view_query = "UPDATE posts SET view_count = view_count + 1 WHERE id = :post_id";
    $view_stmt = $db->prepare($view_query);
    $view_stmt->bindParam(':post_id', $post['id']);
    $view_stmt->execute();
    
    // Track view
    if (isset($_SERVER['REMOTE_ADDR'])) {
        $track_query = "INSERT INTO post_views (post_id, ip_address, user_agent) VALUES (:post_id, :ip, :user_agent)";
        $track_stmt = $db->prepare($track_query);
        $track_stmt->bindParam(':post_id', $post['id']);
        $ip = $_SERVER['REMOTE_ADDR'];
        $user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $track_stmt->bindParam(':ip', $ip);
        $track_stmt->bindParam(':user_agent', $user_agent);
        $track_stmt->execute();
    }
    
    $response = [
        'id' => $post['id'],
        'title' => $post['title'],
        'slug' => $post['slug'],
        'excerpt' => $post['excerpt'],
        'content' => $post['content'],
        'featured_image' => $post['featured_image'],
        'publish_date' => $post['publish_date'],
        'view_count' => (int)$post['view_count'] + 1,
        'created_at' => $post['created_at'],
        'updated_at' => $post['updated_at'],
        'meta' => [
            'title' => $post['meta_title'],
            'description' => $post['meta_description'],
            'keywords' => $post['meta_keywords']
        ],
        'author' => [
            'id' => $post['author_id'],
            'name' => $post['author_name'],
            'picture' => $post['author_picture'],
            'bio' => $post['author_bio']
        ],
        'category' => $post['category_id'] ? [
            'id' => $post['category_id'],
            'name' => $post['category_name'],
            'slug' => $post['category_slug']
        ] : null,
        'tags' => $tags,
        'related_posts' => $related_posts
    ];
    
    http_response_code(200);
    echo json_encode($response);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Server error: ' . $e->getMessage()]);
}
?>
