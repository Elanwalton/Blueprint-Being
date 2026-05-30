export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if username is taken
    const usernameSnap = await adminDb
      .collection('users')
      .where('username', '==', username)
      .limit(1)
      .get();

    if (!usernameSnap.empty) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 400 });
    }

    // Create Firebase Auth user
    let userRecord;
    try {
      userRecord = await adminAuth.createUser({ email, password, displayName: username });
    } catch (err: any) {
      if (err.code === 'auth/email-already-exists') {
        return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
      }
      throw err;
    }

    const role = 'subscriber';

    // Set custom role claim
    await adminAuth.setCustomUserClaims(userRecord.uid, { role });

    // Create Firestore user document
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      username,
      email,
      role,
      profile_picture: null,
      bio: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: { id: userRecord.uid, username, email, role },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Register error:', err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}
