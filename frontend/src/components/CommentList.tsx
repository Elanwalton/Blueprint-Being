'use client';

import { useState, useEffect } from 'react';
import { FiMessageCircle } from 'react-icons/fi';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { commentAPI } from '@/lib/api';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  username: string;
  created_at: string;
  parent_id: string | null;
  replies?: Comment[];
}

interface CommentListProps {
  postId: string;
}

export default function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get current user
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await commentAPI.getComments(postId);
      const allComments = response.data.comments || [];

      // Organize comments into threaded structure
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      // First pass: create map of all comments
      allComments.forEach((comment: Comment) => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      // Second pass: organize into tree structure
      allComments.forEach((comment: Comment) => {
        const commentWithReplies = commentMap.get(comment.id)!;
        
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies!.push(commentWithReplies);
          }
        } else {
          rootComments.push(commentWithReplies);
        }
      });

      setComments(rootComments);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b4d8]"></div>
        <p className="text-gray-600 mt-2">Loading comments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchComments}
          className="mt-4 px-4 py-2 text-sm text-[#00b4d8] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Comment Count */}
      <div className="flex items-center space-x-2 text-gray-700">
        <FiMessageCircle className="w-5 h-5" />
        <h3 className="text-xl font-display font-bold">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h3>
      </div>

      {/* Comment Form */}
      {user ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Leave a Comment</h4>
          <CommentForm postId={postId} onSuccess={fetchComments} />
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-gray-600 mb-4">Please log in to leave a comment</p>
          <a
            href="/login"
            className="inline-block px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white font-medium hover:shadow-lg transition-all"
          >
            Log In
          </a>
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              currentUserId={user?.id}
              onUpdate={fetchComments}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FiMessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
}
