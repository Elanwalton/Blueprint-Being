export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(_req: NextRequest) {
  try {
    const snap = await adminDb
      .collection('categories')
      .orderBy('name', 'asc')
      .get();

    const categories = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ categories });
  } catch (err: any) {
    console.error('GET /api/categories error:', err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}
