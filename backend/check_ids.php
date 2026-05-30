<?php
require_once 'c:/xampp/htdocs/Carson-blog/backend/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "CATEGORIES:\n";
    $stmt = $db->query("SELECT id, name FROM categories");
    while($row = $stmt->fetch()) {
        echo $row['id'] . ': ' . $row['name'] . "\n";
    }

    echo "\nADMIN USERS:\n";
    $stmt = $db->query("SELECT id, username FROM users WHERE role='admin'");
    while($row = $stmt->fetch()) {
        echo $row['id'] . ': ' . $row['username'] . "\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
