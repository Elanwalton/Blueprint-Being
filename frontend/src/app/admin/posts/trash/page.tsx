'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiTrash2, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import api from '@/lib/api';

interface Post {
  id: number;
  title: string;
  author_id: number;
  deleted_at: string;
  category_id: number | null;
}

export default function TrashPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTrashed(); }, []);

  const fetchTrashed = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const r = await api.get('/posts/index.php?status=trashed', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(r.data.posts || []);
    } catch (err) {
      console.error('Error fetching trashed posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await api.put('/posts/manage.php', { id, action: 'restore' }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTrashed();
    } catch (err) {
      alert('Failed to restore post');
    }
  };

  const handlePurge = async (id: number) => {
    if (!confirm('Permanently delete this post? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/posts/manage.php?id=${id}&action=purge`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTrashed();
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  const daysLeft = (deleted_at: string) => {
    const expires = new Date(deleted_at);
    expires.setDate(expires.getDate() + 30);
    const diff = Math.max(0, Math.ceil((expires.getTime() - Date.now()) / 86400000));
    return diff;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2 flex items-center">
          <FiTrash2 className="w-7 h-7 mr-3 text-red-500" />
          Trash
        </h1>
        <p className="text-gray-600">Posts are permanently deleted 30 days after being trashed.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b4d8]" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-16 text-center shadow-sm">
          <FiTrash2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Trash is empty</p>
          <Link href="/admin/posts" className="mt-4 inline-block text-sm text-[#00b4d8] hover:underline">
            ← Back to Posts
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Title</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Trashed</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Auto-delete in</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {posts.map((post) => {
                const days = daysLeft(post.deleted_at);
                return (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(post.deleted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        days <= 3 ? 'bg-red-100 text-red-700' :
                        days <= 7 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {days === 0 ? 'Deletes today' : `${days} days`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleRestore(post.id)}
                          className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm hover:border-green-500 hover:text-green-600 transition-colors"
                        >
                          <FiRefreshCw className="w-4 h-4 mr-1.5" />Restore
                        </button>
                        <button
                          onClick={() => handlePurge(post.id)}
                          className="inline-flex items-center px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm hover:bg-red-100 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4 mr-1.5" />Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
