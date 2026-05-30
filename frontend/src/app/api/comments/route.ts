export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

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

// ─── GET ─────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('post_id');
    const user = await tryGetUser(req);
    const isAdmin = user?.role === 'admin';

    if (!isAdmin && !postId) {
      return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
    }

    let q = adminDb.collection('comments') as any;

    if (postId) {
      q = q.where('post_id', '==', postId);
    }

    const statusParam = searchParams.get('status') || 'all';
    if (!isAdmin) {
      q = q.where('status', '==', 'approved');
    } else if (isAdmin && statusParam !== 'all') {
      q = q.where('status', '==', statusParam);
    }

    q = q.orderBy('created_at', 'desc');
    const snap = await q.get();
    const comments = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));

    // Build tree if filtered by post
    if (postId) {
      const map: Record<string, any> = {};
      comments.forEach((c: any) => { map[c.id] = { ...c, replies: [] }; });
      const tree: any[] = [];
      Object.values(map).forEach((c: any) => {
        if (!c.parent_id) tree.push(c);
        else if (map[c.parent_id]) map[c.parent_id].replies.push(c);
      });
      return NextResponse.json({ comments: tree });
    }

    return NextResponse.json({ comments });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}

// ─── POST (create comment) ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const user = await tryGetUser(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    if (!data.post_id || !data.content) {
      return NextResponse.json({ message: 'Post ID and content are required' }, { status: 400 });
    }
    if (String(data.content).length < 3) {
      return NextResponse.json({ message: 'Comment is too short' }, { status: 400 });
    }

    const userSnap = await adminDb.collection('users').doc(user.uid).get();
    const userData = userSnap.data()!;

    const ref = await adminDb.collection('comments').add({
      post_id: data.post_id,
      user_id: user.uid,
      username: userData.username,
      profile_picture: userData.profile_picture ?? null,
      parent_id: data.parent_id ?? null,
      content: data.content,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: 'Comment submitted for moderation', comment_id: ref.id },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}

// ─── PUT (moderate comment – admin only) ─────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const user = await tryGetUser(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const data = await req.json();
    if (!data.comment_id || !data.status) {
      return NextResponse.json({ message: 'Comment ID and status are required' }, { status: 400 });
    }

    const ref = adminDb.collection('comments').doc(data.comment_id);
    await ref.update({ status: data.status });

    // Update comment_count on the post when approving/rejecting
    const commentSnap = await ref.get();
    const comment = commentSnap.data();
    if (comment?.post_id) {
      const postRef = adminDb.collection('posts').doc(comment.post_id);
      if (data.status === 'approved') {
        await postRef.update({ comment_count: FieldValue.increment(1) });
      } else if (data.status === 'rejected') {
        await postRef.update({ comment_count: FieldValue.increment(-1) });
      }
    }

    return NextResponse.json({ message: 'Comment status updated' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const user = await tryGetUser(req);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ message: 'Comment ID is required' }, { status: 400 });

    const commentRef = adminDb.collection('comments').doc(id);
    const snap = await commentRef.get();
    if (!snap.exists) return NextResponse.json({ message: 'Comment not found' }, { status: 404 });

    const comment = snap.data()!;
    if (comment.user_id !== user.uid && user.role !== 'admin') {
      return NextResponse.json({ message: 'You can only delete your own comments' }, { status: 403 });
    }

    await commentRef.update({ status: 'deleted' });
    return NextResponse.json({ message: 'Comment deleted' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}
