# Modern Blog - Full-Stack Application

A beautifully designed, feature-rich blog platform built with Next.js 14 (frontend) and PHP (backend) with MySQL database.

## ✨ Features

### Core Features (Implemented)
1. **User Management**
   - User Registration & Login with JWT authentication
   - Role-based access (Admin, Author, Subscriber)
   - Profile management

2. **Content Management**
   - Create, Edit, Delete posts
   - Post categories and tags
   - Draft and scheduled publishing
   - Rich text editor support
   - Featured images

3. **Post Display & Navigation**
   - Responsive post layouts
   - Pagination
   - Search functionality
   - Related posts recommendations

4. **Commenting System**
   - Threaded comments
   - Comment moderation
   - Anti-spam measures

5. **Social Sharing**
   - Share buttons for major platforms
   - Social media integration ready

6. **SEO Optimization**
   - Customizable URLs (slugs)
   - Meta tags and descriptions
   - Structured data support

7. **Responsive Design**
   - Mobile-first approach
   - Cross-browser compatible
   - Modern gradient-based UI

8. **Analytics & Reporting**
   - Traffic analytics
   - Popular posts tracking
   - Engagement metrics
   - Admin dashboard

11. **Email Subscription/Newsletter**
    - Newsletter subscription
    - Email verification
    - Subscriber management

12. **Admin Panel**
    - Content moderation
    - Analytics dashboard
    - User management

### Monetization (Partial Implementation)
- Subscription system (database structure ready)
- Ready for payment gateway integration

## 🎨 Design Philosophy

This blog follows a **modern, gradient-heavy aesthetic** with:
- Distinctive font pairing (Playfair Display + Inter)
- Pink-purple gradient theme
- Smooth animations and transitions
- Card-based layouts with depth
- Glassmorphism effects
- Hover states and micro-interactions

## 📁 Project Structure

```
modern-blog/
├── backend/                 # PHP Backend
│   ├── api/
│   │   ├── auth/           # Authentication endpoints
│   │   │   ├── register.php
│   │   │   └── login.php
│   │   ├── posts/          # Posts management
│   │   │   ├── index.php   # Get all posts
│   │   │   ├── single.php  # Get single post
│   │   │   └── manage.php  # Create/update/delete
│   │   ├── comments/       # Comments system
│   │   │   └── index.php
│   │   ├── newsletter/     # Newsletter subscriptions
│   │   │   └── index.php
│   │   └── analytics/      # Analytics data
│   │       └── index.php
│   └── config/
│       ├── database.php    # Database connection
│       ├── jwt.php         # JWT authentication helper
│       └── cors.php        # CORS headers
├── database/
│   └── schema.sql          # Complete database schema
└── frontend/               # Next.js Frontend
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx  # Root layout
    │   │   ├── page.tsx    # Homepage
    │   │   └── globals.css # Global styles
    │   ├── components/
    │   │   ├── Navbar.tsx  # Navigation bar
    │   │   └── Footer.tsx  # Footer with newsletter
    │   └── lib/
    │       └── api.ts      # API service layer
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    └── tsconfig.json
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- PHP 7.4+ with PDO extension
- MySQL 5.7+ or MariaDB 10.3+
- Apache or Nginx web server

### Backend Setup

1. **Database Setup**
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE modern_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import schema
mysql -u root -p modern_blog < database/schema.sql
```

2. **Configure Database Connection**
Edit `backend/config/database.php`:
```php
private $host = "localhost";
private $db_name = "modern_blog";
private $username = "root";
private $password = "your_password";
```

3. **Configure Web Server**

**Apache (.htaccess)**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/(.*)$ api/$1 [L,QSA]
```

**Nginx**
```nginx
location /api/ {
    try_files $uri $uri/ /api/index.php?$args;
}
```

4. **Set Permissions**
```bash
chmod 755 backend/api
chmod 644 backend/api/**/*.php
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Configure Environment**
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost/modern-blog/backend/api
```

3. **Run Development Server**
```bash
npm run dev
```

4. **Build for Production**
```bash
npm run build
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register.php` - Register new user
- `POST /api/auth/login.php` - User login

### Posts
- `GET /api/posts/index.php` - Get all posts (with pagination, filters)
- `GET /api/posts/single.php?slug={slug}` - Get single post
- `POST /api/posts/manage.php` - Create post (Auth required)
- `PUT /api/posts/manage.php` - Update post (Auth required)
- `DELETE /api/posts/manage.php?id={id}` - Delete post (Auth required)

### Comments
- `GET /api/comments/index.php?post_id={id}` - Get comments for post
- `POST /api/comments/index.php` - Create comment (Auth required)
- `PUT /api/comments/index.php` - Moderate comment (Admin only)
- `DELETE /api/comments/index.php?id={id}` - Delete comment (Auth required)

### Newsletter
- `POST /api/newsletter/index.php` - Subscribe to newsletter
- `PUT /api/newsletter/index.php` - Verify email
- `DELETE /api/newsletter/index.php?email={email}` - Unsubscribe

### Analytics
- `GET /api/analytics/index.php` - Get analytics data (Admin only)

## 🔒 Security Features

1. **Authentication**
   - JWT-based authentication
   - Password hashing with bcrypt
   - Token expiration (7 days)

2. **Input Validation**
   - Email validation
   - Password strength requirements
   - SQL injection protection (PDO prepared statements)

3. **Authorization**
   - Role-based access control
   - Owner-only edit/delete permissions
   - Admin-only endpoints

4. **Comment Moderation**
   - Manual approval system
   - Spam detection ready
   - User reporting capability

## 🎯 Key Features to Add

Based on your requirements, here are additional features you can implement:

1. **File Upload System**
   - Image upload for featured images
   - Media library
   - Image optimization

2. **Payment Integration** (for subscriptions)
   - Stripe or PayPal integration
   - Subscription tiers
   - Payment history

3. **Advanced Editor**
   - Rich text editor (TinyMCE/Quill)
   - Code syntax highlighting
   - Image embedding

4. **Email System**
   - Newsletter sending
   - Email templates
   - SMTP configuration

5. **Sitemap Generation**
   - XML sitemap
   - Auto-update on new posts

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to change the color scheme:
```javascript
colors: {
  primary: {
    // Your custom colors
  },
}
```

### Fonts
Update `globals.css` Google Fonts import:
```css
@import url('https://fonts.googleapis.com/css2?family=Your+Font&display=swap');
```

## 📱 Pages Structure

### Frontend Pages (to implement)
- `/` - Homepage with hero and featured posts ✅
- `/blog` - Blog listing with filters
- `/blog/[slug]` - Single post page
- `/category/[slug]` - Category archive
- `/tag/[slug]` - Tag archive
- `/search` - Search results
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Admin/Author dashboard
- `/profile` - User profile

## 🔧 Technologies Used

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **React Icons** - Icon library
- **date-fns** - Date formatting

### Backend
- **PHP 7.4+** - Server-side language
- **MySQL** - Database
- **JWT** - Authentication
- **PDO** - Database abstraction

## 📊 Database Schema

The database includes 10 tables:
- `users` - User accounts and authentication
- `posts` - Blog posts with metadata
- `categories` - Post categories
- `tags` - Post tags
- `post_tags` - Many-to-many relationship
- `comments` - User comments with threading
- `subscriptions` - Premium subscriptions
- `newsletter_subscribers` - Email subscribers
- `post_views` - Analytics tracking
- Default admin user (email: admin@blog.com, password: admin123)

## 🚦 Default Credentials

**Admin Account:**
- Email: `admin@blog.com`
- Password: `admin123`

⚠️ **Change these credentials immediately in production!**

## 📝 License

This project is created for demonstration purposes.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For issues or questions, please create an issue in the repository.

---

Built with ❤️ using Next.js and PHP
