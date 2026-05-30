# Blueprint Being - Project Summary

## Architecture
**Blueprint Being** is a fully serverless Next.js web application utilizing Firebase for its backend infrastructure. The legacy PHP backend has been completely decommissioned and removed.

### Stack
- **Frontend**: React (Next.js App Router), Tailwind CSS
- **Backend APIs**: Next.js API Routes (`src/app/api/`)
- **Database**: Google Cloud Firestore (NoSQL)
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage (Uniform Bucket-Level Access compatible via Signed URLs)

## Security
The application employs strict, enterprise-grade security measures:
1. **Next.js Headers**: The `next.config.js` enforces HSTS, blocks framing (X-Frame-Options), enforces strict Content Security Policies, and prevents MIME-sniffing.
2. **Server-Side Verification**: The Firebase Admin SDK is used inside the Next.js API routes to verify bearer tokens securely on every request.
3. **Role-Based Access Control**: Roles are stored in Firestore and propagated as Firebase Custom Claims for rigid permission checks on data mutation.

## API Structure

All endpoints reside under `/api/`:

- `/auth/*`: Login, registration, token verification, and password resets.
- `/posts/*`: Public fetching and internal CRUD management (`/posts/manage`).
- `/comments/*`: Threaded commentary with moderation statuses.
- `/categories/*`: Category metadata.
- `/users/*`: Admin controls for modifying user profiles and assigning roles.
- `/uploads/*`: Secure image upload generation and media deletion.
- `/analytics/*`: Aggregate statistics for the admin dashboard.
