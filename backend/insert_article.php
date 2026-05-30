<?php
require_once 'c:/xampp/htdocs/Carson-blog/backend/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // 1. Create Health Category if not exists
    $name = 'Health';
    $slug = 'health';
    $desc = 'Articles about physical and mental well-being.';
    
    $check = $db->prepare("SELECT id FROM categories WHERE slug = ?");
    $check->execute([$slug]);
    $catId = $check->fetchColumn();

    if (!$catId) {
        $stmt = $db->prepare("INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)");
        $stmt->execute([$name, $slug, $desc]);
        $catId = $db->lastInsertId();
        echo "Created Category: Health (ID: $catId)\n";
    } else {
        echo "Category Health already exists (ID: $catId)\n";
    }

    // 2. Insert Article
    $title = '5 Daily Habits for a Healthier Life';
    $postSlug = '5-daily-habits-for-a-healthier-life';
    $content = '<h2>1. Stay Hydrated</h2><p>Drinking enough water is crucial for every system in your body. Aim for at least 8 glasses a day.</p><h2>2. Move Your Body</h2><p>Physical activity doesn\'t have to be intense. A 30-minute walk can significantly improve your cardiovascular health.</p><h2>3. Prioritize Sleep</h2><p>Your body repairs itself during sleep. Ensure you get 7-9 hours of quality rest each night.</p><h2>4. Eat Whole Foods</h2><p>Focus on fruits, vegetables, lean proteins, and whole grains while minimizing processed sugar.</p><h2>5. Practice Mindfulness</h2><p>Mental health is just as important as physical health. Take a few minutes each day to breathe and de-stress.</p>';
    $excerpt = 'Simple yet effective habits you can start today to improve your overall well-being.';
    $authorId = 2; // elanwalton
    $status = 'published';
    $publishDate = date('Y-m-d H:i:s');
    $wordCount = str_word_count(strip_tags($content));
    $focusKeyword = 'health habits';

    $stmt = $db->prepare("INSERT INTO posts (title, slug, content, excerpt, author_id, category_id, status, publish_date, word_count, focus_keyword) VALUES (:title, :slug, :content, :excerpt, :author_id, :category_id, :status, :publish_date, :word_count, :focus_keyword)");
    
    $stmt->execute([
        ':title' => $title,
        ':slug' => $postSlug,
        ':content' => $content,
        ':excerpt' => $excerpt,
        ':author_id' => $authorId,
        ':category_id' => $catId,
        ':status' => $status,
        ':publish_date' => $publishDate,
        ':word_count' => $wordCount,
        ':focus_keyword' => $focusKeyword
    ]);

    echo "Successfully inserted article: $title\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
