export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb, adminStorage } from '@/lib/firebaseAdmin';

async function verifyUser(req: NextRequest) {
  const authHeader = req.headers.get('Authorization') || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) throw Object.assign(new Error('Unauthorized'), { status: 401 });
  return adminAuth.verifyIdToken(idToken);
}

// ─── GET: list media files ─────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await verifyUser(req);

    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) throw new Error('Storage bucket not configured');
    const bucket = adminStorage.bucket(bucketName);
    const [files] = await bucket.getFiles({ prefix: 'uploads/' });

    const media = await Promise.all(
      files.map(async (file) => {
        const [meta] = await file.getMetadata();
        return {
          filename: file.name,
          url: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
          size: parseInt(meta.size as string, 10),
          created_at: meta.timeCreated,
        };
      })
    );

    // Sort newest first
    media.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return NextResponse.json({ media });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Server error' }, { status: err.status || 500 });
  }
}

// ─── DELETE: remove media file ─────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    await verifyUser(req);

    const data = await req.json();
    if (!data.filename) {
      return NextResponse.json({ message: 'Filename is required' }, { status: 400 });
    }

    // Prevent path traversal: ensure it's under uploads/
    const safe = String(data.filename).replace(/\.\./g, '');
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) throw new Error('Storage bucket not configured');
    const bucket = adminStorage.bucket(bucketName);
    const file = bucket.file(safe);

    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ message: 'File not found' }, { status: 404 });
    }

    await file.delete();
    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Server error' }, { status: err.status || 500 });
  }
}
