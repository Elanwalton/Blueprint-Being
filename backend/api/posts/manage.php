<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';

$user = verifyToken();

// Allowed roles for post management
$allowed_roles = ['admin', 'author', 'editor', 'contributor'];
if (!in_array($user['role'], $allowed_roles)) {
    http_response_code(403);
    echo json_encode(['message' => 'You do not have permission to manage posts']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    $database = new Database();
    $db = $database->getConnection();

    // ── Purge posts trashed > 30 days (runs on every API call) ──────────────
    $db->exec("DELETE FROM posts WHERE status = 'trashed' AND deleted_at IS NOT NULL AND deleted_at < DATE_SUB(NOW(), INTERVAL 30 DAY)");

    if ($method === 'GET') {
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Post ID is required']);
            exit;
        }

        $post_id = $_GET['id'];
        $query = "SELECT * FROM posts WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $post_id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $post = $stmt->fetch(PDO::FETCH_ASSOC);

            // Non-admin/editor can only see own posts
            if (!in_array($user['role'], ['admin', 'editor']) && $post['author_id'] != $user['id']) {
                http_response_code(403);
                echo json_encode(['message' => 'Access denied']);
                exit;
            }

            $tag_query = "SELECT t.name FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = :post_id";
            $tag_stmt = $db->prepare($tag_query);
            $tag_stmt->bindParam(':post_id', $post_id);
            $tag_stmt->execute();
            $post['tags'] = $tag_stmt->fetchAll(PDO::FETCH_COLUMN);

            http_response_code(200);
            echo json_encode(['post' => $post]);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Post not found']);
        }

    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->title) || !isset($data->content)) {
            http_response_code(400);
            echo json_encode(['message' => 'Title and content are required']);
            exit;
        }

        // Contributors can only submit as 'pending'
        $status = $data->status ?? 'draft';
        if ($user['role'] === 'contributor') {
            $status = 'pending';
        }
        // Only admin/editor can publish directly
        if (!in_array($user['role'], ['admin', 'editor']) && $status === 'published') {
            $status = 'pending';
        }

        // Generate slug
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data->title)));
        if (!empty($data->slug)) {
            $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data->slug)));
        }
        $check_stmt = $db->prepare("SELECT id FROM posts WHERE slug = :slug");
        $check_stmt->bindParam(':slug', $slug);
        $check_stmt->execute();
        if ($check_stmt->rowCount() > 0) { $slug .= '-' . time(); }

        $word_count = str_word_count(strip_tags($data->content));
        $publish_date = isset($data->publish_date) ? $data->publish_date : ($status === 'published' ? date('Y-m-d H:i:s') : null);
        $excerpt = $data->excerpt ?? substr(strip_tags($data->content), 0, 200);
        $featured_image = $data->featured_image ?? null;
        $category_id = $data->category_id ?? null;
        $meta_title = $data->meta_title ?? $data->title;
        $meta_description = $data->meta_description ?? $excerpt;
        $meta_keywords = $data->meta_keywords ?? '';
        $focus_keyword = $data->focus_keyword ?? null;

        $query = "INSERT INTO posts (title, slug, content, excerpt, featured_image, author_id, category_id,
                  status, publish_date, meta_title, meta_description, meta_keywords, word_count, focus_keyword)
                  VALUES (:title, :slug, :content, :excerpt, :featured_image, :author_id, :category_id,
                  :status, :publish_date, :meta_title, :meta_description, :meta_keywords, :word_count, :focus_keyword)";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':title', $data->title);
        $stmt->bindParam(':slug', $slug);
        $stmt->bindParam(':content', $data->content);
        $stmt->bindParam(':excerpt', $excerpt);
        $stmt->bindParam(':featured_image', $featured_image);
        $stmt->bindParam(':author_id', $user['id']);
        $stmt->bindParam(':category_id', $category_id);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':publish_date', $publish_date);
        $stmt->bindParam(':meta_title', $meta_title);
        $stmt->bindParam(':meta_description', $meta_description);
        $stmt->bindParam(':meta_keywords', $meta_keywords);
        $stmt->bindParam(':word_count', $word_count);
        $stmt->bindParam(':focus_keyword', $focus_keyword);

        if ($stmt->execute()) {
            $post_id = $db->lastInsertId();
            if (isset($data->tags) && is_array($data->tags)) {
                foreach ($data->tags as $tag_name) {
                    $tag_slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $tag_name)));
                    $tag_stmt = $db->prepare("INSERT INTO tags (name, slug) VALUES (:name, :slug) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)");
                    $tag_stmt->bindParam(':name', $tag_name);
                    $tag_stmt->bindParam(':slug', $tag_slug);
                    $tag_stmt->execute();
                    $tag_id = $db->lastInsertId();
                    $link_stmt = $db->prepare("INSERT INTO post_tags (post_id, tag_id) VALUES (:post_id, :tag_id)");
                    $link_stmt->bindParam(':post_id', $post_id);
                    $link_stmt->bindParam(':tag_id', $tag_id);
                    $link_stmt->execute();
                }
            }
            http_response_code(201);
            echo json_encode(['message' => 'Post created successfully', 'post_id' => $post_id, 'slug' => $slug]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Unable to create post']);
        }

    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->id)) {
            http_response_code(400);
            echo json_encode(['message' => 'Post ID is required']);
            exit;
        }

        // Fetch post
        $check_stmt = $db->prepare("SELECT author_id, status FROM posts WHERE id = :id");
        $check_stmt->bindParam(':id', $data->id);
        $check_stmt->execute();
        $post = $check_stmt->fetch(PDO::FETCH_ASSOC);

        if (!$post) {
            http_response_code(404);
            echo json_encode(['message' => 'Post not found']);
            exit;
        }

        // Ownership check: contributors and authors can only edit their own
        if (!in_array($user['role'], ['admin', 'editor'])) {
            if ($post['author_id'] != $user['id']) {
                http_response_code(403);
                echo json_encode(['message' => 'You can only edit your own posts']);
                exit;
            }
        }

        // Restore from trash action
        if (isset($data->action) && $data->action === 'restore') {
            $stmt = $db->prepare("UPDATE posts SET status = 'draft', deleted_at = NULL WHERE id = :id");
            $stmt->bindParam(':id', $data->id);
            echo json_encode(['message' => $stmt->execute() ? 'Post restored' : 'Restore failed']);
            exit;
        }

        $status = $data->status ?? $post['status'];
        // Contributors forced to pending
        if ($user['role'] === 'contributor') { $status = 'pending'; }
        // Authors cannot publish
        if ($user['role'] === 'author' && $status === 'published') { $status = 'pending'; }

        $word_count = str_word_count(strip_tags($data->content ?? ''));
        $excerpt = $data->excerpt ?? substr(strip_tags($data->content ?? ''), 0, 200);
        $featured_image = $data->featured_image ?? null;
        $category_id = $data->category_id ?? null;
        $publish_date = $data->publish_date ?? null;
        $meta_title = $data->meta_title ?? $data->title ?? '';
        $meta_description = $data->meta_description ?? $excerpt;
        $meta_keywords = $data->meta_keywords ?? '';
        $focus_keyword = $data->focus_keyword ?? null;
        $focus_keyword_val = $focus_keyword;
        $slug = isset($data->slug) ? strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $data->slug))) : null;

        $query = "UPDATE posts SET title = :title, content = :content, excerpt = :excerpt,
                  featured_image = :featured_image, category_id = :category_id, status = :status,
                  publish_date = :publish_date, meta_title = :meta_title, meta_description = :meta_description,
                  meta_keywords = :meta_keywords, word_count = :word_count, focus_keyword = :focus_keyword
                  " . ($slug ? ", slug = :slug" : "") . "
                  WHERE id = :id";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data->id);
        $stmt->bindParam(':title', $data->title);
        $stmt->bindParam(':content', $data->content);
        $stmt->bindParam(':excerpt', $excerpt);
        $stmt->bindParam(':featured_image', $featured_image);
        $stmt->bindParam(':category_id', $category_id);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':publish_date', $publish_date);
        $stmt->bindParam(':meta_title', $meta_title);
        $stmt->bindParam(':meta_description', $meta_description);
        $stmt->bindParam(':meta_keywords', $meta_keywords);
        $stmt->bindParam(':word_count', $word_count);
        $stmt->bindParam(':focus_keyword', $focus_keyword_val);
        if ($slug) { $stmt->bindParam(':slug', $slug); }

        if ($stmt->execute()) {
            if (isset($data->tags)) {
                $db->prepare("DELETE FROM post_tags WHERE post_id = :post_id")->execute([':post_id' => $data->id]);
                if (is_array($data->tags)) {
                    foreach ($data->tags as $tag_name) {
                        $tag_slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $tag_name)));
                        $tag_stmt = $db->prepare("INSERT INTO tags (name, slug) VALUES (:name, :slug) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)");
                        $tag_stmt->bindParam(':name', $tag_name);
                        $tag_stmt->bindParam(':slug', $tag_slug);
                        $tag_stmt->execute();
                        $tag_id = $db->lastInsertId();
                        $db->prepare("INSERT INTO post_tags (post_id, tag_id) VALUES (:post_id, :tag_id)")
                           ->execute([':post_id' => $data->id, ':tag_id' => $tag_id]);
                    }
                }
            }
            http_response_code(200);
            echo json_encode(['message' => 'Post updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Unable to update post']);
        }

    } elseif ($method === 'DELETE') {
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Post ID is required']);
            exit;
        }

        $post_id = $_GET['id'];
        $action = $_GET['action'] ?? 'trash'; // 'trash' or 'purge'

        // Ownership check
        if (!in_array($user['role'], ['admin', 'editor'])) {
            $check_stmt = $db->prepare("SELECT author_id FROM posts WHERE id = :id");
            $check_stmt->bindParam(':id', $post_id);
            $check_stmt->execute();
            $post = $check_stmt->fetch();
            if (!$post || $post['author_id'] != $user['id']) {
                http_response_code(403);
                echo json_encode(['message' => 'You can only delete your own posts']);
                exit;
            }
        }

        if ($action === 'purge' && $user['role'] === 'admin') {
            // Permanent delete
            $stmt = $db->prepare("DELETE FROM posts WHERE id = :id");
            $stmt->bindParam(':id', $post_id);
            $msg = $stmt->execute() ? 'Post permanently deleted' : 'Unable to delete post';
        } else {
            // Soft delete → trash
            $stmt = $db->prepare("UPDATE posts SET status = 'trashed', deleted_at = NOW() WHERE id = :id");
            $stmt->bindParam(':id', $post_id);
            $msg = $stmt->execute() ? 'Post moved to trash' : 'Unable to trash post';
        }

        echo json_encode(['message' => $msg]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Server error: ' . $e->getMessage()]);
}
?>
