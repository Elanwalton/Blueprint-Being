<?php
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $results = [];

    // 1. Expand users.role ENUM to include 'contributor' and 'editor'
    try {
        $db->exec("ALTER TABLE users MODIFY COLUMN role ENUM('admin','author','editor','contributor','subscriber') DEFAULT 'subscriber'");
        $results[] = "✅ users.role ENUM expanded (contributor, editor added)";
    } catch (PDOException $e) {
        $results[] = "ℹ️ users.role: " . $e->getMessage();
    }

    // 2. Expand posts.status ENUM to include 'pending' and 'trashed'
    try {
        $db->exec("ALTER TABLE posts MODIFY COLUMN status ENUM('draft','pending','published','scheduled','trashed') DEFAULT 'draft'");
        $results[] = "✅ posts.status ENUM expanded (pending, trashed added)";
    } catch (PDOException $e) {
        $results[] = "ℹ️ posts.status: " . $e->getMessage();
    }

    // 3. Add deleted_at column for soft-delete (30-day trash retention)
    $check = $db->query("SHOW COLUMNS FROM posts LIKE 'deleted_at'")->rowCount();
    if ($check == 0) {
        $db->exec("ALTER TABLE posts ADD COLUMN deleted_at DATETIME DEFAULT NULL");
        $results[] = "✅ posts.deleted_at column added";
    } else {
        $results[] = "ℹ️ posts.deleted_at already exists";
    }

    // 4. Add word_count column
    $check = $db->query("SHOW COLUMNS FROM posts LIKE 'word_count'")->rowCount();
    if ($check == 0) {
        $db->exec("ALTER TABLE posts ADD COLUMN word_count INT DEFAULT 0");
        $results[] = "✅ posts.word_count column added";
    } else {
        $results[] = "ℹ️ posts.word_count already exists";
    }

    // 5. Add focus_keyword column
    $check = $db->query("SHOW COLUMNS FROM posts LIKE 'focus_keyword'")->rowCount();
    if ($check == 0) {
        $db->exec("ALTER TABLE posts ADD COLUMN focus_keyword VARCHAR(255) DEFAULT NULL");
        $results[] = "✅ posts.focus_keyword column added";
    } else {
        $results[] = "ℹ️ posts.focus_keyword already exists";
    }

    echo "<h2>Migration Results</h2><ul>";
    foreach ($results as $r) {
        echo "<li>$r</li>";
    }
    echo "</ul><strong>Migration complete.</strong>";

} catch (Exception $e) {
    echo "❌ Migration failed: " . $e->getMessage();
}
?>
