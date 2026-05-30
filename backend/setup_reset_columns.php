<?php
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Add reset_token column
    $sql = "SHOW COLUMNS FROM users LIKE 'reset_token'";
    $stmt = $db->prepare($sql);
    $stmt->execute();

    if ($stmt->rowCount() == 0) {
        $sql = "ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL";
        $db->exec($sql);
        echo "Added reset_token column.<br>";
    } else {
        echo "reset_token column already exists.<br>";
    }

    // Add reset_expires column
    $sql = "SHOW COLUMNS FROM users LIKE 'reset_expires'";
    $stmt = $db->prepare($sql);
    $stmt->execute();

    if ($stmt->rowCount() == 0) {
        $sql = "ALTER TABLE users ADD COLUMN reset_expires DATETIME DEFAULT NULL";
        $db->exec($sql);
        echo "Added reset_expires column.<br>";
    } else {
        echo "reset_expires column already exists.<br>";
    }
    
    echo "Database setup completed successfully.";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
