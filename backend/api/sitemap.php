<?php
require_once '../config/cors.php';
require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get all published posts
    $query = "SELECT p.slug, p.updated_at, p.publish_date
              FROM posts p
              WHERE p.status = 'published'
              AND (p.publish_date IS NULL OR p.publish_date <= NOW())
              ORDER BY p.publish_date DESC, p.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $posts = $stmt->fetchAll();
    
    // Get categories
    $catQuery = "SELECT slug, updated_at FROM categories ORDER BY name";
    $catStmt = $db->prepare($catQuery);
    $catStmt->execute();
    $categories = $catStmt->fetchAll();
    
    // Get tags
    $tagQuery = "SELECT slug, updated_at FROM tags ORDER BY name";
    $tagStmt = $db->prepare($tagQuery);
    $tagStmt->execute();
    $tags = $tagStmt->fetchAll();
    
    // Set XML header
    header('Content-Type: application/xml; charset=utf-8');
    
    // Generate sitemap
    echo '<?xml version="1.0" encoding="UTF-8"?>';
    echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    
    // Homepage
    echo '<url>';
    echo '<loc>http://localhost/Carson-blog/frontend</loc>';
    echo '<changefreq>daily</changefreq>';
    echo '<priority>1.0</priority>';
    echo '</url>';
    
    // Blog page
    echo '<url>';
    echo '<loc>http://localhost/Carson-blog/frontend/blog</loc>';
    echo '<changefreq>daily</changefreq>';
    echo '<priority>0.9</priority>';
    echo '</url>';
    
    // Posts
    foreach ($posts as $post) {
        echo '<url>';
        echo '<loc>http://localhost/Carson-blog/frontend/blog/' . htmlspecialchars($post['slug']) . '</loc>';
        echo '<lastmod>' . date('Y-m-d', strtotime($post['updated_at'])) . '</lastmod>';
        echo '<changefreq>weekly</changefreq>';
        echo '<priority>0.8</priority>';
        echo '</url>';
    }
    
    // Categories
    foreach ($categories as $cat) {
        echo '<url>';
        echo '<loc>http://localhost/Carson-blog/frontend/category/' . htmlspecialchars($cat['slug']) . '</loc>';
        echo '<lastmod>' . date('Y-m-d', strtotime($cat['updated_at'])) . '</lastmod>';
        echo '<changefreq>weekly</changefreq>';
        echo '<priority>0.7</priority>';
        echo '</url>';
    }
    
    // Tags
    foreach ($tags as $tag) {
        echo '<url>';
        echo '<loc>http://localhost/Carson-blog/frontend/tag/' . htmlspecialchars($tag['slug']) . '</loc>';
        echo '<lastmod>' . date('Y-m-d', strtotime($tag['updated_at'])) . '</lastmod>';
        echo '<changefreq>weekly</changefreq>';
        echo '<priority>0.6</priority>';
        echo '</url>';
    }
    
    echo '</urlset>';
    
} catch (Exception $e) {
    http_response_code(500);
    echo '<?xml version="1.0" encoding="UTF-8"?>';
    echo '<error>Failed to generate sitemap</error>';
}
?>
