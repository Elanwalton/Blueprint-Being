export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

async function verifyAdminOrEditor(req: NextRequest) {
  const authHeader = req.headers.get('Authorization') || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) throw Object.assign(new Error('Unauthorized'), { status: 401 });

  const decoded = await adminAuth.verifyIdToken(idToken);
  const snap = await adminDb.collection('users').doc(decoded.uid).get();
  if (!snap.exists) throw Object.assign(new Error('User not found'), { status: 401 });

  const data = snap.data()!;
  const role = data.role as string;

  if (!['admin', 'editor'].includes(role)) {
    throw Object.assign(new Error('Access denied'), { status: 403 });
  }
  return { uid: decoded.uid, role };
}

// ─── GET: list users ──────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const caller = await verifyAdminOrEditor(req);

    let q = adminDb.collection('users') as any;
    if (caller.role === 'editor') {
      // Editors cannot see admin accounts
      q = q.where('role', 'in', ['author', 'contributor', 'subscriber']);
    }
    const snap = await q.orderBy('created_at', 'desc').get();
    const users = snap.docs.map((d: any) => {
      const { password_hash, ...rest } = d.data();
      return { id: d.id, ...rest };
    });
    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Server error' }, { status: err.status || 500 });
  }
}

// ─── POST: create user ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const caller = await verifyAdminOrEditor(req);
    const data = await req.json();

    if (!data.username || !data.email || !data.password) {
      return NextResponse.json({ message: 'Username, email, and password are required' }, { status: 400 });
    }

    const role = data.role || 'author';

    // Editors cannot create admin or editor
    if (caller.role === 'editor' && ['admin', 'editor'].includes(role)) {
      return NextResponse.json({ message: 'Editors cannot create admin or editor accounts' }, { status: 403 });
    }

    // Check uniqueness
    const usernameSnap = await adminDb.collection('users').where('username', '==', data.username).limit(1).get();
    if (!usernameSnap.empty) {
      return NextResponse.json({ message: 'Email or username already exists' }, { status: 400 });
    }

    let userRecord;
    try {
      userRecord = await adminAuth.createUser({ email: data.email, password: data.password, displayName: data.username });
    } catch (err: any) {
      if (err.code === 'auth/email-already-exists') {
        return NextResponse.json({ message: 'Email or username already exists' }, { status: 400 });
      }
      throw err;
    }

    await adminAuth.setCustomUserClaims(userRecord.uid, { role });

    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      username: data.username,
      email: data.email,
      role,
      profile_picture: null,
      bio: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ message: 'User created successfully', user_id: userRecord.uid }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Server error' }, { status: err.status || 500 });
  }
}

// ─── PUT: update user role ────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const caller = await verifyAdminOrEditor(req);
    const data = await req.json();

    if (!data.id || !data.role) {
      return NextResponse.json({ message: 'User ID and role are required' }, { status: 400 });
    }
    if (data.id === caller.uid) {
      return NextResponse.json({ message: 'You cannot change your own role' }, { status: 400 });
    }
    if (caller.role === 'editor' && ['admin', 'editor'].includes(data.role)) {
      return NextResponse.json({ message: 'Editors cannot assign admin or editor roles' }, { status: 403 });
    }

    await adminAuth.setCustomUserClaims(data.id, { role: data.role });
    await adminDb.collection('users').doc(data.id).update({ role: data.role, updated_at: new Date().toISOString() });
    return NextResponse.json({ message: 'User role updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Server error' }, { status: err.status || 500 });
  }
}

// ─── DELETE: delete user ──────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const caller = await verifyAdminOrEditor(req);
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('id');
    if (!uid) return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    if (uid === caller.uid) return NextResponse.json({ message: 'You cannot delete your own account' }, { status: 400 });

    // Editors cannot delete admin/editor accounts
    const targetSnap = await adminDb.collection('users').doc(uid).get();
    if (targetSnap.exists) {
      const targetRole = targetSnap.data()!.role as string;
      if (caller.role === 'editor' && ['admin', 'editor'].includes(targetRole)) {
        return NextResponse.json({ message: 'Editors cannot delete admin accounts' }, { status: 403 });
      }
    }

    await adminAuth.deleteUser(uid);
    await adminDb.collection('users').doc(uid).delete();
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Server error' }, { status: err.status || 500 });
  }
}
