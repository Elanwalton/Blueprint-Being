<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';

// Verify admin token
$user = verifyToken();

if ($user['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['message' => 'Admin access required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get date range
    $start_date = $_GET['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
    $end_date = $_GET['end_date'] ?? date('Y-m-d');
    
    // Total posts
    $posts_query = "SELECT COUNT(*) as total FROM posts WHERE status = 'published'";
    $posts_stmt = $db->prepare($posts_query);
    $posts_stmt->execute();
    $total_posts = $posts_stmt->fetch()['total'];
    
    // Total views
    $views_query = "SELECT SUM(view_count) as total FROM posts";
    $views_stmt = $db->prepare($views_query);
    $views_stmt->execute();
    $total_views = $views_stmt->fetch()['total'] ?? 0;
    
    // Total comments
    $comments_query = "SELECT COUNT(*) as total FROM comments WHERE status = 'approved'";
    $comments_stmt = $db->prepare($comments_query);
    $comments_stmt->execute();
    $total_comments = $comments_stmt->fetch()['total'];
    
    // Total users
    $users_query = "SELECT COUNT(*) as total FROM users";
    $users_stmt = $db->prepare($users_query);
    $users_stmt->execute();
    $total_users = $users_stmt->fetch()['total'];
    
    // Newsletter subscribers
    $subscribers_query = "SELECT COUNT(*) as total FROM newsletter_subscribers WHERE status = 'active'";
    $subscribers_stmt = $db->prepare($subscribers_query);
    $subscribers_stmt->execute();
    $total_subscribers = $subscribers_stmt->fetch()['total'];
    
    // Most popular posts
    $popular_query = "SELECT p.id, p.title, p.slug, p.view_count, c.name as category_name,
                             (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND status = 'approved') as comment_count
                      FROM posts p
                      LEFT JOIN categories c ON p.category_id = c.id
                      WHERE p.status = 'published'
                      ORDER BY p.view_count DESC 
                      LIMIT 10";
    $popular_stmt = $db->prepare($popular_query);
    $popular_stmt->execute();
    $popular_posts = $popular_stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Views over time
    $views_over_time_query = "SELECT DATE(viewed_at) as date, COUNT(*) as views 
                              FROM post_views 
                              WHERE viewed_at BETWEEN :start_date AND :end_date
                              GROUP BY DATE(viewed_at) 
                              ORDER BY date";
    $views_time_stmt = $db->prepare($views_over_time_query);
    $views_time_stmt->bindParam(':start_date', $start_date);
    $views_time_stmt->bindParam(':end_date', $end_date);
    $views_time_stmt->execute();
    $views_over_time = $views_time_stmt->fetchAll();
    
    // Category distribution
    $category_query = "SELECT c.name, COUNT(p.id) as post_count 
                       FROM categories c
                       LEFT JOIN posts p ON c.id = p.category_id AND p.status = 'published'
                       GROUP BY c.id, c.name
                       ORDER BY post_count DESC";
    $category_stmt = $db->prepare($category_query);
    $category_stmt->execute();
    $category_distribution = $category_stmt->fetchAll();
    
    // Recent activity mapped to recent_views for frontend
    $activity_query = "SELECT title as post_title, created_at as viewed_at
                       FROM posts 
                       WHERE status = 'published'
                       UNION ALL
                       SELECT CONCAT('Comment: ', p.title) as post_title, c.created_at as viewed_at
                       FROM comments c
                       INNER JOIN posts p ON c.post_id = p.id
                       WHERE c.status = 'approved'
                       ORDER BY viewed_at DESC
                       LIMIT 20";
    $activity_stmt = $db->prepare($activity_query);
    $activity_stmt->execute();
    $recent_views = $activity_stmt->fetchAll();
    
    $avg_views_per_post = $total_posts > 0 ? round($total_views / $total_posts, 1) : 0;
    
    http_response_code(200);
    echo json_encode([
        'total_posts' => (int)$total_posts,
        'total_views' => (int)$total_views,
        'total_comments' => (int)$total_comments,
        'total_users' => (int)$total_users,
        'total_subscribers' => (int)$total_subscribers,
        'avg_views_per_post' => $avg_views_per_post,
        'popular_posts' => $popular_posts,
        'views_over_time' => $views_over_time,
        'category_distribution' => $category_distribution,
        'recent_views' => $recent_views
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Server error: ' . $e->getMessage()]);
}
?>
