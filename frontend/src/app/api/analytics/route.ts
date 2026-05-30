export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get('Authorization') || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) throw Object.assign(new Error('Unauthorized'), { status: 401 });

  const decoded = await adminAuth.verifyIdToken(idToken);
  const snap = await adminDb.collection('users').doc(decoded.uid).get();
  if (!snap.exists || snap.data()!.role !== 'admin') {
    throw Object.assign(new Error('Admin access required'), { status: 403 });
  }
  return decoded;
}

export async function GET(req: NextRequest) {
  try {
    await verifyAdmin(req);

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0];

    // Run all aggregate queries in parallel
    const [
      publishedSnap,
      allPostsSnap,
      commentsSnap,
      usersSnap,
      subscribersSnap,
      popularSnap,
      viewsSnap,
      categoriesSnap,
      recentSnap,
    ] = await Promise.all([
      adminDb.collection('posts').where('status', '==', 'published').get(),
      adminDb.collection('posts').get(),
      adminDb.collection('comments').where('status', '==', 'approved').get(),
      adminDb.collection('users').get(),
      adminDb.collection('newsletter_subscribers').where('status', '==', 'active').get(),
      adminDb.collection('posts').where('status', '==', 'published').orderBy('view_count', 'desc').limit(10).get(),
      adminDb.collection('post_views')
        .where('viewed_at', '>=', startDate)
        .where('viewed_at', '<=', endDate + 'T23:59:59Z')
        .orderBy('viewed_at', 'asc')
        .get(),
      adminDb.collection('categories').get(),
      adminDb.collection('posts').where('status', '==', 'published').orderBy('created_at', 'desc').limit(20).get(),
    ]);

    const total_posts = publishedSnap.size;
    const total_comments = commentsSnap.size;
    const total_users = usersSnap.size;
    const total_subscribers = subscribersSnap.size;

    let total_views = 0;
    allPostsSnap.docs.forEach((d) => { total_views += (d.data().view_count as number) || 0; });

    const avg_views_per_post = total_posts > 0 ? +(total_views / total_posts).toFixed(1) : 0;

    const popular_posts = popularSnap.docs.map((d) => {
      const p = d.data();
      return {
        id: d.id,
        title: p.title,
        slug: p.slug,
        view_count: p.view_count || 0,
        category_name: p.category?.name ?? null,
        comment_count: p.comment_count || 0,
      };
    });

    // Group views by date
    const viewsByDate: Record<string, number> = {};
    viewsSnap.docs.forEach((d) => {
      const date = String(d.data().viewed_at).split('T')[0];
      viewsByDate[date] = (viewsByDate[date] || 0) + 1;
    });
    const views_over_time = Object.entries(viewsByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, views]) => ({ date, views }));

    // Category distribution
    const catCounts: Record<string, { name: string; post_count: number }> = {};
    categoriesSnap.docs.forEach((d) => {
      catCounts[d.id] = { name: d.data().name as string, post_count: 0 };
    });
    publishedSnap.docs.forEach((d) => {
      const catId = d.data().category?.id as string | undefined;
      if (catId && catCounts[catId]) catCounts[catId].post_count++;
    });
    const category_distribution = Object.values(catCounts).sort(
      (a, b) => b.post_count - a.post_count
    );

    const recent_views = recentSnap.docs.map((d) => ({
      post_title: d.data().title,
      viewed_at: d.data().created_at,
    }));

    return NextResponse.json({
      total_posts,
      total_views,
      total_comments,
      total_users,
      total_subscribers,
      avg_views_per_post,
      popular_posts,
      views_over_time,
      category_distribution,
      recent_views,
    });
  } catch (err: any) {
    console.error('GET /api/analytics error:', err);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: err.status || 500 });
  }
}
