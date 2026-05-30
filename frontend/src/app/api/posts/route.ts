export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import {
  Query,
  CollectionReference,
  DocumentData,
} from 'firebase-admin/firestore';

/** Build a Firestore query from the request's search params */
async function buildPostsQuery(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const search = searchParams.get('search');
  const status = searchParams.get('status') || 'published';
  const authorId = searchParams.get('author_id');

  return { page, limit, category, tag, search, status, authorId };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, category, tag, search, status, authorId } =
      await buildPostsQuery(searchParams);

    const postsRef = adminDb.collection('posts') as CollectionReference<DocumentData>;
    let q: Query<DocumentData> = postsRef;

    q = q.where('status', '==', status);

    if (status === 'published') {
      q = q.where('publish_date', '<=', new Date().toISOString());
    }

    if (category) {
      q = q.where('category.slug', '==', category);
    }

    if (authorId) {
      q = q.where('author_id', '==', authorId);
    }

    // Fetch all matching docs (Firestore doesn't support server-side LIKE search)
    const snapshot = await q.orderBy('publish_date', 'desc').get();

    let docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

    // Client-side filter for tag & search (Firestore limitation)
    if (tag) {
      docs = docs.filter((p: any) =>
        Array.isArray(p.tags) && p.tags.some((t: any) => t.slug === tag)
      );
    }

    if (search) {
      const lower = search.toLowerCase();
      docs = docs.filter(
        (p: any) =>
          p.title?.toLowerCase().includes(lower) ||
          p.excerpt?.toLowerCase().includes(lower) ||
          p.content?.toLowerCase().includes(lower)
      );
    }

    const total = docs.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const posts = docs.slice(offset, offset + limit);

    return NextResponse.json({
      posts,
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        total_pages: totalPages,
      },
    });
  } catch (err: any) {
    console.error('GET /api/posts error:', err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}
