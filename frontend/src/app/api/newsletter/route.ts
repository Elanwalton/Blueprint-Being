export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

async function tryGetUser(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization') || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) return null;
    const decoded = await adminAuth.verifyIdToken(idToken);
    const snap = await adminDb.collection('users').doc(decoded.uid).get();
    if (!snap.exists) return null;
    return { uid: decoded.uid, role: snap.data()!.role as string };
  } catch {
    return null;
  }
}

// ─── GET: list subscribers (admin only) ─────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const user = await tryGetUser(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const snap = await adminDb
      .collection('newsletter_subscribers')
      .orderBy('created_at', 'desc')
      .get();

    const subscribers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ subscribers });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}

// ─── POST: subscribe ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
    }

    // Check existing
    const existing = await adminDb
      .collection('newsletter_subscribers')
      .where('email', '==', data.email)
      .limit(1)
      .get();

    if (!existing.empty) {
      const doc = existing.docs[0].data();
      if (doc.status === 'active') {
        return NextResponse.json({ message: 'Email already subscribed' }, { status: 400 });
      }
      // Reactivate
      await existing.docs[0].ref.update({ status: 'active', subscribed_at: new Date().toISOString() });
      return NextResponse.json({ message: 'Subscription reactivated successfully' });
    }

    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);

    await adminDb.collection('newsletter_subscribers').add({
      email: data.email,
      name: data.name || '',
      status: 'active',
      is_verified: false,
      verification_token: token,
      created_at: new Date().toISOString(),
      subscribed_at: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        message: 'Subscribed successfully! Please check your email to verify.',
        verification_token: process.env.NODE_ENV !== 'production' ? token : undefined,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}

// ─── PUT: verify email ────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.token) {
      return NextResponse.json({ message: 'Verification token is required' }, { status: 400 });
    }

    const snap = await adminDb
      .collection('newsletter_subscribers')
      .where('verification_token', '==', data.token)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ message: 'Invalid verification token' }, { status: 400 });
    }

    await snap.docs[0].ref.update({ is_verified: true, verification_token: null });
    return NextResponse.json({ message: 'Email verified successfully' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}

// ─── DELETE: unsubscribe ──────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const snap = await adminDb
      .collection('newsletter_subscribers')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ message: 'Email not found' }, { status: 404 });
    }

    await snap.docs[0].ref.update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
    });

    return NextResponse.json({ message: 'Unsubscribed successfully' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}
