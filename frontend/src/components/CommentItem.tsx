'use client';

import { useState } from 'react';
import { FiMessageCircle, FiUser, FiClock, FiTrash2 } from 'react-icons/fi';
const formatDate = (date: Date, pattern: string) => {
  if (pattern === 'MMM d, yyyy') return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  return date.toLocaleDateString();
};

import CommentForm from './CommentForm';
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

interface CommentItemProps {
  comment: Comment;
  postId: string;
  currentUserId?: string;
  onUpdate: () => void;
}

export default function CommentItem({ comment, postId, currentUserId, onUpdate }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setDeleting(true);
    try {
      await commentAPI.deleteComment(comment.id);
      onUpdate();
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert('Failed to delete comment');
    } finally {
      setDeleting(false);
    }
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    onUpdate();
  };

  const isOwner = currentUserId === comment.user_id;

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B1E1E] to-[#C74D4D] flex items-center justify-center text-white font-bold">
            {comment.username[0].toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">{comment.username}</span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-500 flex items-center">
                  <FiClock className="w-3 h-3 mr-1" />
                  {formatDate(new Date(comment.created_at), 'MMM d, yyyy')}
                </span>
              </div>

              {isOwner && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                  title="Delete comment"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          </div>

          {/* Actions */}
          <div className="mt-2 flex items-center space-x-4">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-sm text-gray-600 hover:text-[#8B1E1E] transition-colors flex items-center"
            >
              <FiMessageCircle className="w-4 h-4 mr-1" />
              Reply
            </button>
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-4">
              <CommentForm
                postId={postId}
                parentId={comment.id}
                onSuccess={handleReplySuccess}
                onCancel={() => setShowReplyForm(false)}
                placeholder={`Reply to ${comment.username}...`}
              />
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  currentUserId={currentUserId}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
