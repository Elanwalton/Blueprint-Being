'use client';

import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiTrash2, FiBell } from 'react-icons/fi';
import api from '@/lib/api';

interface Comment {
  id: number;
  content: string;
  username: string;
  post_title: string;
  created_at: string;
  status: string;
}

const STATUS_TABS = ['pending', 'approved', 'spam'];

export default function CommentModeration() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [counts, setCounts] = useState<Record<string, number>>({ pending: 0, approved: 0, spam: 0 });

  useEffect(() => { fetchComments(); }, [filter]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const r = await api.get(`/comments/index.php?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(r.data.comments || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch counts for badge indicators
  useEffect(() => {
    const fetchCounts = async () => {
      const token = localStorage.getItem('token');
      try {
        const results = await Promise.allSettled(
          STATUS_TABS.map(s => api.get(`/comments/index.php?status=${s}`, {
            headers: { Authorization: `Bearer ${token}` },
          }))
        );
        const newCounts: Record<string, number> = {};
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') {
            newCounts[STATUS_TABS[i]] = (r.value.data.comments || []).length;
          }
        });
        setCounts(newCounts);
      } catch {}
    };
    fetchCounts();
  }, [comments]); // refresh counts after any moderation action

  const handleModerate = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      // The backend expects comment_id + status via PUT
      await api.put('/comments/index.php', { comment_id: id, status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchComments();
    } catch (err) {
      alert('Failed to moderate comment');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this comment?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/comments/index.php?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchComments();
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Comment Moderation</h1>
        <p className="text-gray-600">All new comments require admin approval before appearing publicly.</p>
      </div>

      {/* Filter tabs with count badges */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center space-x-2">
          {STATUS_TABS.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`relative px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                filter === status
                  ? 'bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {counts[status] > 0 && (
                <span className={`ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold rounded-full ${
                  filter === status ? 'bg-white/30 text-white' :
                  status === 'pending' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {counts[status]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Admin-only notice */}
      <div className="mb-6 flex items-center space-x-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        <FiBell className="w-4 h-4 flex-shrink-0" />
        <span>Only admins can approve comments. Comments stay <strong>pending</strong> until approved here.</span>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b4d8]" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{comment.username}</h3>
                  <p className="text-sm text-gray-500">
                    On: <span className="text-gray-700">{comment.post_title}</span> · {new Date(comment.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                  comment.status === 'approved' ? 'bg-green-100 text-green-800' :
                  comment.status === 'spam' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {comment.status}
                </span>
              </div>

              <p className="text-gray-700 mb-4 bg-gray-50 rounded-lg p-3 text-sm">{comment.content}</p>

              <div className="flex items-center space-x-3">
                {comment.status !== 'approved' && (
                  <button
                    onClick={() => handleModerate(comment.id, 'approved')}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-green-500 text-white text-sm hover:bg-green-600 transition-colors"
                  >
                    <FiCheck className="w-4 h-4 mr-1.5" />Approve
                  </button>
                )}
                {comment.status !== 'spam' && (
                  <button
                    onClick={() => handleModerate(comment.id, 'spam')}
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-yellow-500 text-white text-sm hover:bg-yellow-600 transition-colors"
                  >
                    <FiX className="w-4 h-4 mr-1.5" />Spam
                  </button>
                )}
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-600 text-sm hover:bg-red-100 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4 mr-1.5" />Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500">No {filter} comments</p>
          </div>
        )}
      </div>
    </div>
  );
}
