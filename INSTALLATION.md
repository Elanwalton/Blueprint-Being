# Installation & Deployment Guide

## Quick Start (Development)

### Step 1: Database Setup

1. **Create Database**
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE modern_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Import schema
mysql -u root -p modern_blog < database/schema.sql
```

2. **Verify Installation**
```bash
mysql -u root -p modern_blog -e "SHOW TABLES;"
```

You should see 10 tables listed.

### Step 2: Backend Configuration

1. **Update Database Credentials**

Edit `backend/config/database.php`:

```php
private $host = "localhost";
private $db_name = "modern_blog";
private $username = "root";        // Your MySQL username
private $password = "your_password"; // Your MySQL password
```

2. **Update JWT Secret** (Important for production!)

Edit `backend/config/jwt.php`:

```php
private static $secret_key = "YOUR-SUPER-SECRET-KEY-CHANGE-THIS";
```

3. **Configure Web Server**

**For XAMPP/WAMP:**
- Place the `modern-blog/backend` folder in `htdocs/` or `www/`
- Access via: `http://localhost/modern-blog/backend/api/`

**For Apache with .htaccess:**

Create `backend/.htaccess`:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^api/(.*)$ api/$1 [L,QSA]
</IfModule>
```

**For Nginx:**

Add to your server block:
```nginx
location /api/ {
    try_files $uri $uri/ /api/index.php?$args;
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

### Step 3: Frontend Configuration

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Configure Environment**

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost/modern-blog/backend/api
```

For production:
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

3. **Run Development Server**
```bash
npm run dev
```

Visit: `http://localhost:3000`

## Testing the Installation

### Test Backend API

1. **Test Registration:**
```bash
curl -X POST http://localhost/modern-blog/backend/api/auth/register.php \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

2. **Test Login:**
```bash
curl -X POST http://localhost/modern-blog/backend/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@blog.com",
    "password": "admin123"
  }'
```

3. **Test Get Posts:**
```bash
curl http://localhost/modern-blog/backend/api/posts/index.php
```

### Test Frontend

1. Visit `http://localhost:3000`
2. Click "Get Started" or "Login"
3. Use default admin credentials:
   - Email: `admin@blog.com`
   - Password: `admin123`

## Production Deployment

### Backend Deployment

1. **Upload Files**
- Upload `backend/` folder to your web server
- Ensure `config/` folder is NOT publicly accessible

2. **Security Checklist**
```bash
# Set proper permissions
chmod 755 backend/api
chmod 644 backend/api/**/*.php
chmod 600 backend/config/*.php

# Disable directory listing
# Add to .htaccess:
Options -Indexes
```

3. **Enable HTTPS**
- Install SSL certificate (Let's Encrypt recommended)
- Update CORS settings if needed

4. **Database Security**
- Use strong database passwords
- Create dedicated database user (don't use root)
- Limit database user permissions

```sql
CREATE USER 'blog_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON modern_blog.* TO 'blog_user'@'localhost';
FLUSH PRIVILEGES;
```

### Frontend Deployment

**Option 1: Vercel (Recommended)**

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
4. Deploy

**Option 2: Self-hosted**

1. **Build the application:**
```bash
cd frontend
npm run build
```

2. **Start production server:**
```bash
npm start
```

3. **Use PM2 for process management:**
```bash
npm install -g pm2
pm2 start npm --name "modern-blog" -- start
pm2 save
pm2 startup
```

4. **Setup Nginx reverse proxy:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment-Specific Configuration

### Development
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost/modern-blog/backend/api
NODE_ENV=development
```

### Staging
```env
# .env.staging
NEXT_PUBLIC_API_URL=https://staging.yourdomain.com/api
NODE_ENV=production
```

### Production
```env
# .env.production
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NODE_ENV=production
```

## Post-Deployment Steps

1. **Change Default Admin Password**
```sql
-- Login as admin and change password through UI, or:
UPDATE users 
SET password_hash = '$2y$10$YOUR_NEW_HASH_HERE'
WHERE email = 'admin@blog.com';
```

2. **Configure Email (for newsletters)**
- Set up SMTP server
- Update email sending functions
- Test newsletter subscription

3. **Setup Backups**
```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p modern_blog > backup_$DATE.sql
```

4. **Enable Monitoring**
- Setup error logging
- Monitor API response times
- Track user analytics

## Troubleshooting

### Common Issues

**1. CORS Errors**
```php
// backend/config/cors.php
header("Access-Control-Allow-Origin: https://yourdomain.com");
// Or for development:
header("Access-Control-Allow-Origin: *");
```

**2. 404 on API Endpoints**
- Check Apache mod_rewrite is enabled
- Verify .htaccess is working
- Check file permissions

**3. Database Connection Failed**
- Verify database credentials
- Check MySQL is running: `sudo systemctl status mysql`
- Test connection: `mysql -u username -p`

**4. JWT Token Errors**
- Check token is being sent in Authorization header
- Verify JWT secret key is consistent
- Check token hasn't expired

**5. File Upload Issues**
- Check PHP upload limits in php.ini:
```ini
upload_max_filesize = 20M
post_max_size = 20M
```

## Performance Optimization

### Backend
1. **Enable OPcache**
```ini
; php.ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
```

2. **Database Indexing**
```sql
-- Indexes are already created in schema.sql
-- Verify with:
SHOW INDEX FROM posts;
```

3. **Enable Gzip Compression**
```apache
# .htaccess
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/json
</IfModule>
```

### Frontend
1. **Image Optimization**
- Use Next.js Image component
- Serve WebP format
- Implement lazy loading

2. **Code Splitting**
- Already handled by Next.js
- Use dynamic imports for heavy components

3. **Caching**
```javascript
// next.config.js
module.exports = {
  // Enable SWC minification
  swcMinify: true,
  // Add cache headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600' }
        ],
      },
    ]
  },
}
```

## Security Hardening

1. **Hide PHP Version**
```ini
; php.ini
expose_php = Off
```

2. **Implement Rate Limiting**
```php
// Add to API endpoints
$ip = $_SERVER['REMOTE_ADDR'];
$requests = get_request_count($ip);
if ($requests > 100) {
    http_response_code(429);
    die('Too many requests');
}
```

3. **SQL Injection Prevention**
- Already using PDO prepared statements ✓
- Never concatenate user input in queries ✓

4. **XSS Prevention**
```php
// Always escape output
echo htmlspecialchars($user_input, ENT_QUOTES, 'UTF-8');
```

## Maintenance

### Regular Tasks
- **Daily**: Check error logs
- **Weekly**: Review analytics, backup database
- **Monthly**: Update dependencies, security audit
- **Quarterly**: Performance review, feature updates

### Backup Strategy
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups"

# Database backup
mysqldump -u root -p modern_blog | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Files backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /path/to/backend/uploads

# Keep last 30 days
find $BACKUP_DIR -mtime +30 -delete
```

## Support & Resources

- **Documentation**: Check README.md for API reference
- **Issues**: Report bugs via GitHub issues
- **Community**: Join our Discord/Slack community

---

Need help? Create an issue or contact support@yourdomain.com
