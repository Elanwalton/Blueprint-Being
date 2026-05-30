import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Find post by slug
    const snap = await adminDb
      .collection('posts')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    const doc = snap.docs[0];
    const post = { id: doc.id, ...doc.data() } as any;

    // Increment view count
    await doc.ref.update({ view_count: FieldValue.increment(1) });

    // Track view (optional analytics sub-collection)
    await adminDb.collection('post_views').add({
      post_id: doc.id,
      viewed_at: new Date().toISOString(),
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || '',
    });

    // Related posts: same category or overlapping tags, exclude self
    const tagSlugs: string[] = (post.tags || []).map((t: any) => t.slug);
    const categorySlug: string | null = post.category?.slug ?? null;

    let relatedDocs: any[] = [];

    if (categorySlug) {
      const catSnap = await adminDb
        .collection('posts')
        .where('status', '==', 'published')
        .where('category.slug', '==', categorySlug)
        .orderBy('publish_date', 'desc')
        .limit(6)
        .get();
      relatedDocs = catSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p: any) => p.id !== doc.id);
    }

    if (relatedDocs.length < 3 && tagSlugs.length > 0) {
      const tagSnap = await adminDb
        .collection('posts')
        .where('status', '==', 'published')
        .orderBy('publish_date', 'desc')
        .limit(20)
        .get();
      const tagMatches = tagSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (p: any) =>
            p.id !== doc.id &&
            !relatedDocs.find((r) => r.id === p.id) &&
            (p.tags || []).some((t: any) => tagSlugs.includes(t.slug))
        );
      relatedDocs = [...relatedDocs, ...tagMatches];
    }

    const related_posts = relatedDocs.slice(0, 3).map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      featured_image: p.featured_image ?? null,
      publish_date: p.publish_date,
    }));

    return NextResponse.json({
      ...post,
      view_count: (post.view_count ?? 0) + 1,
      meta: {
        title: post.meta_title ?? post.title,
        description: post.meta_description ?? post.excerpt,
        keywords: post.meta_keywords ?? null,
      },
      related_posts,
    });
  } catch (err: any) {
    console.error('GET /api/posts/[slug] error:', err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}
