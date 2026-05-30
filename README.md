# Blueprint Being

Blueprint Being is a modern, responsive, and secure full-stack blog platform.

## Architecture

The project has been migrated from a legacy PHP/MySQL backend to a robust serverless architecture:

- **Frontend & API**: [Next.js](https://nextjs.org/) (App Router)
- **Database & Authentication**: [Firebase](https://firebase.google.com/) (Firestore, Auth, and Storage)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

All backend operations are handled securely through Next.js Server API Routes (`/src/app/api/`) utilizing the Firebase Admin SDK. The frontend interacts with these APIs using Axios and the Firebase Client SDK for browser-level authentication.

## Features

- **Role-Based Access Control**: Admin, Editor, Author, Contributor, and Subscriber roles handled via Firebase Custom Claims.
- **Rich Text Editor**: Secure, easy-to-use content formatting.
- **Media Library**: Upload and manage images directly via Firebase Storage.
- **Threaded Comments**: Interactive, moderatable comment sections for posts.
- **Newsletter Subscription**: Built-in endpoints for audience engagement.
- **Advanced Security**: Strict Next.js HTTP headers (HSTS, CSP, X-Frame-Options) and disabled legacy components.

## Getting Started

Please see [`INSTALLATION.md`](./INSTALLATION.md) for full instructions on how to set up your Firebase project and `.env.local` variables, and how to run the application locally or deploy it to Vercel.

## Documentation

- [`PROJECT_SUMMARY.md`](./PROJECT_SUMMARY.md) - Detailed breakdown of features, roles, and the API structure.
- [`INSTALLATION.md`](./INSTALLATION.md) - Environment setup and deployment guide.
