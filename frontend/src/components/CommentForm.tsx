'use client';

import { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { commentAPI, CommentData } from '@/lib/api';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export default function CommentForm({ postId, parentId, onSuccess, onCancel, placeholder = 'Write your comment...' }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data: CommentData = {
        post_id: postId,
        content: content.trim(),
      };

      if (parentId) {
        data.parent_id = parentId;
      }

      await commentAPI.createComment(data);
      setContent('');
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={parentId ? 3 : 4}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none resize-none"
          disabled={loading}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex items-center space-x-3">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="inline-flex items-center px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Posting...
            </>
          ) : (
            <>
              <FiSend className="w-4 h-4 mr-2" />
              Post Comment
            </>
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
