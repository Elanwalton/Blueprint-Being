export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const ALLOWED_ROLES = ['admin', 'author', 'editor', 'contributor'];

async function verifyUser(req: NextRequest) {
  const authHeader = req.headers.get('Authorization') || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) throw Object.assign(new Error('Unauthorized'), { status: 401 });

  const decoded = await adminAuth.verifyIdToken(idToken);

  // Get role from Firestore (source of truth)
  const snap = await adminDb.collection('users').doc(decoded.uid).get();
  if (!snap.exists) throw Object.assign(new Error('User not found'), { status: 401 });

  const data = snap.data()!;
  return { uid: decoded.uid, role: data.role as string, username: data.username as string };
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-');
}

// ─── GET (single post for editing) ──────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    if (!ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });

    const snap = await adminDb.collection('posts').doc(id).get();
    if (!snap.exists) return NextResponse.json({ message: 'Post not found' }, { status: 404 });

    const post = { id: snap.id, ...snap.data() } as any;

    // Non-admin/editor can only see own posts
    if (!['admin', 'editor'].includes(user.role) && post.author_id !== user.uid) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ post });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Server error' }, { status: err.status || 500 });
  }
}

// ─── POST (create) ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    if (!ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const data = await req.json();
    if (!data.title || !data.content) {
      return NextResponse.json({ message: 'Title and content are required' }, { status: 400 });
    }

    // Role-based status enforcement
    let status: string = data.status || 'draft';
    if (user.role === 'contributor') status = 'pending';
    if (user.role === 'author' && status === 'published') status = 'pending';

    // Slug generation + uniqueness
    let slug = slugify(data.slug || data.title);
    const existing = await adminDb.collection('posts').where('slug', '==', slug).limit(1).get();
    if (!existing.empty) slug = `${slug}-${Date.now()}`;

    const excerpt =
      data.excerpt || data.content.replace(/<[^>]+>/g, '').substring(0, 200);
    const wordCount = data.content.replace(/<[^>]+>/g, '').split(/\s+/).length;
    const publish_date =
      data.publish_date ||
      (status === 'published' ? new Date().toISOString() : null);

    const userSnap = await adminDb.collection('users').doc(user.uid).get();
    const userData = userSnap.data()!;

    const postDoc = {
      title: data.title,
      slug,
      content: data.content,
      excerpt,
      featured_image: data.featured_image ?? null,
      author_id: user.uid,
      author: {
        id: user.uid,
        name: userData.username,
        picture: userData.profile_picture ?? null,
      },
      category: data.category ?? null,
      tags: data.tags
        ? data.tags.map((name: string) => ({ name, slug: slugify(name) }))
        : [],
      status,
      publish_date,
      meta_title: data.meta_title || data.title,
      meta_description: data.meta_description || excerpt,
      meta_keywords: data.meta_keywords || '',
      focus_keyword: data.focus_keyword ?? null,
      word_count: wordCount,
      view_count: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const ref = await adminDb.collection('posts').add(postDoc);

    return NextResponse.json(
      { message: 'Post created successfully', post_id: ref.id, slug },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('POST /api/posts/manage error:', err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: err.status || 500 });
  }
}

// ─── PUT (update / restore) ──────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    if (!ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const data = await req.json();
    if (!data.id) return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });

    const postRef = adminDb.collection('posts').doc(data.id);
    const postSnap = await postRef.get();
    if (!postSnap.exists) return NextResponse.json({ message: 'Post not found' }, { status: 404 });

    const existing = postSnap.data()!;

    // Ownership
    if (!['admin', 'editor'].includes(user.role) && existing.author_id !== user.uid) {
      return NextResponse.json({ message: 'You can only edit your own posts' }, { status: 403 });
    }

    // Restore action
    if (data.action === 'restore') {
      await postRef.update({ status: 'draft', deleted_at: null, updated_at: new Date().toISOString() });
      return NextResponse.json({ message: 'Post restored' });
    }

    let status: string = data.status ?? existing.status;
    if (user.role === 'contributor') status = 'pending';
    if (user.role === 'author' && status === 'published') status = 'pending';

    const excerpt =
      data.excerpt ||
      (data.content ? data.content.replace(/<[^>]+>/g, '').substring(0, 200) : existing.excerpt);
    const wordCount = data.content
      ? data.content.replace(/<[^>]+>/g, '').split(/\s+/).length
      : existing.word_count;

    const updates: Record<string, any> = {
      title: data.title ?? existing.title,
      content: data.content ?? existing.content,
      excerpt,
      featured_image: data.featured_image ?? existing.featured_image,
      category: data.category ?? existing.category,
      tags: data.tags
        ? data.tags.map((name: string) => ({ name, slug: slugify(name) }))
        : existing.tags,
      status,
      publish_date: data.publish_date ?? existing.publish_date,
      meta_title: data.meta_title ?? data.title ?? existing.meta_title,
      meta_description: data.meta_description ?? excerpt,
      meta_keywords: data.meta_keywords ?? existing.meta_keywords,
      focus_keyword: data.focus_keyword ?? existing.focus_keyword,
      word_count: wordCount,
      updated_at: new Date().toISOString(),
    };

    if (data.slug) {
      updates.slug = slugify(data.slug);
    }

    await postRef.update(updates);
    return NextResponse.json({ message: 'Post updated successfully' });
  } catch (err: any) {
    console.error('PUT /api/posts/manage error:', err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: err.status || 500 });
  }
}

// ─── DELETE (trash / purge) ──────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const user = await verifyUser(req);
    if (!ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action') || 'trash';
    if (!id) return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });

    const postRef = adminDb.collection('posts').doc(id);
    const postSnap = await postRef.get();
    if (!postSnap.exists) return NextResponse.json({ message: 'Post not found' }, { status: 404 });

    const post = postSnap.data()!;

    // Ownership
    if (!['admin', 'editor'].includes(user.role) && post.author_id !== user.uid) {
      return NextResponse.json({ message: 'You can only delete your own posts' }, { status: 403 });
    }

    if (action === 'purge' && user.role === 'admin') {
      await postRef.delete();
      return NextResponse.json({ message: 'Post permanently deleted' });
    }

    // Soft-delete: trash
    await postRef.update({
      status: 'trashed',
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Auto-purge posts trashed > 30 days (run opportunistically)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const stale = await adminDb
      .collection('posts')
      .where('status', '==', 'trashed')
      .where('deleted_at', '<=', thirtyDaysAgo)
      .get();
    const batch = adminDb.batch();
    stale.docs.forEach((d) => batch.delete(d.ref));
    if (!stale.empty) await batch.commit();

    return NextResponse.json({ message: 'Post moved to trash' });
  } catch (err: any) {
    console.error('DELETE /api/posts/manage error:', err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: err.status || 500 });
  }
}
