import * as admin from 'firebase-admin';

let app: admin.app.App;

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  // Support both plain (with literal \n) and base64-encoded private keys.
  // On Vercel, set FIREBASE_ADMIN_PRIVATE_KEY_BASE64 to avoid multiline env issues:
  //   openssl base64 -in serviceAccountKey.json | tr -d '\n'  (then copy just the private_key value)
  let privateKey: string | undefined;
  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64) {
    privateKey = Buffer.from(process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64, 'base64').toString('utf-8');
  } else {
    privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  }

  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      '[firebaseAdmin] Missing credentials — API routes will fail at runtime. ' +
      'Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY (or FIREBASE_ADMIN_PRIVATE_KEY_BASE64).'
    );
    // Initialise a minimal app so imports don't throw during Next.js build
    app = admin.initializeApp({ projectId: projectId || 'placeholder', storageBucket });
  } else {
    try {
      app = admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        storageBucket,
      });
    } catch (error) {
      console.warn('[firebaseAdmin] Failed to initialise with cert credentials:', error);
      app = admin.initializeApp({ projectId, storageBucket });
    }
  }
} else {
  app = admin.apps[0]!;
}

export const adminAuth = admin.auth(app);
export const adminDb = admin.firestore(app);
export const adminStorage = admin.storage(app);
export default app;
