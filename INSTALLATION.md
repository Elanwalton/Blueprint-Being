# Installation & Deployment Guide

## Prerequisites
- Node.js 18.x or newer
- npm or yarn
- A Firebase Project (Free "Spark" plan is sufficient to start)

## 1. Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Authentication** (Email/Password).
3. Enable **Firestore Database** (Start in production mode).
4. Enable **Firebase Storage**.

### Generate Keys

1. **Client SDK Keys**: Go to Project Settings -> General -> "Your apps". Add a Web App and copy the config object values.
2. **Admin SDK Keys**: Go to Project Settings -> Service Accounts -> "Generate new private key". Download the JSON file.

## 2. Local Setup

Clone the repository and install dependencies:

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory using your Firebase keys:

```env
# Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Admin Configuration
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
# For local dev, you can use literal newlines \n:
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 3. Run Locally

```bash
npm run dev
```
Access the application at `http://localhost:3000`.

## 4. Deployment (Vercel)

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Add all the environment variables from your `.env.local`.
   - **CRITICAL**: For `FIREBASE_ADMIN_PRIVATE_KEY` on Vercel, it is highly recommended to encode your key in Base64 to avoid newline parsing errors.
   - Run this in your terminal: `openssl base64 -in serviceAccountKey.json | tr -d '\n'`
   - Add the output as a new environment variable in Vercel called `FIREBASE_ADMIN_PRIVATE_KEY_BASE64`.

4. Deploy the application. All API routes will run as serverless functions.
