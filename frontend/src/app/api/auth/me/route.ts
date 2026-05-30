export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

/** Extract and verify the Firebase ID token from the Authorization header. */
async function verifyBearerToken(req: NextRequest) {
  const authHeader = req.headers.get('Authorization') || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) throw new Error('No token provided');
  return adminAuth.verifyIdToken(idToken);
}

export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyBearerToken(req);

    const snap = await adminDb.collection('users').doc(decoded.uid).get();
    if (!snap.exists) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const data = snap.data()!;
    return NextResponse.json({
      id: decoded.uid,
      username: data.username,
      email: data.email,
      role: data.role,
      profile_picture: data.profile_picture ?? null,
      bio: data.bio ?? null,
    });
  } catch (err: any) {
    if (err.code?.startsWith('auth/')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}
