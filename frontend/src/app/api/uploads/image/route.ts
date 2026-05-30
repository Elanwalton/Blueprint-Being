export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb, adminStorage } from '@/lib/firebaseAdmin';

async function verifyUser(req: NextRequest) {
  const authHeader = req.headers.get('Authorization') || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) throw Object.assign(new Error('Unauthorized'), { status: 401 });
  return adminAuth.verifyIdToken(idToken);
}

export async function POST(req: NextRequest) {
  try {
    await verifyUser(req);

    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { message: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `uploads/${crypto.randomUUID()}.${ext}`;

    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) throw new Error('Storage bucket not configured');

    const bucket = adminStorage.bucket(bucketName);
    const fileRef = bucket.file(filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
    });

    // Generate a signed URL valid for 10 years (Firebase Storage uniform access compatible)
    // Alternatively set Firebase Storage security rules to: allow read: if true;
    const [signedUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: Date.now() + 10 * 365 * 24 * 60 * 60 * 1000,
    });

    // Also store the stable gs:// path so we can regenerate URLs if needed
    const gsUrl = `gs://${bucketName}/${filename}`;

    return NextResponse.json({
      message: 'File uploaded successfully',
      url: signedUrl,
      gsUrl,
      filename,
    });
  } catch (err: any) {
    console.error('POST /api/uploads/image error:', err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: err.status || 500 });
  }
}
