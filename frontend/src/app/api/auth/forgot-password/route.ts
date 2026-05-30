export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // Generate a Firebase password reset link (sends email automatically when using
    // Firebase Auth's built-in mail service).  The link points to the Firebase
    // action-handler URL; use actionCodeSettings to redirect back to your app.
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
      handleCodeInApp: false,
    };

    try {
      const link = await adminAuth.generatePasswordResetLink(email, actionCodeSettings);

      // In production the link is emailed automatically by Firebase.
      // We return it here only to preserve dev/testing parity with the old PHP endpoint.
      return NextResponse.json({
        message: 'If your email exists in our system, you will receive a password reset link.',
        debug_link: process.env.NODE_ENV !== 'production' ? link : undefined,
      });
    } catch (err: any) {
      // Don't reveal whether the email exists
      if (err.code === 'auth/user-not-found') {
        return NextResponse.json({
          message: 'If your email exists in our system, you will receive a password reset link.',
        });
      }
      throw err;
    }
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}
