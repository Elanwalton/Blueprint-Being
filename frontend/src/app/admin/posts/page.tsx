'use client';

import { useEffect, useState } from 'react';
import { FiPlus, FiSearch } from 'react-icons/fi';
import Link from 'next/link';
import PostTable from '@/components/admin/PostTable';
import api from '@/lib/api';

export default function PostsManagement() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, [statusFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await api.get('/posts/index.php', { params });
      setPosts(response.data.posts || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/posts/manage.php?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Posts</h1>
          <p className="text-gray-600">Manage your blog posts</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white font-medium hover:shadow-lg transition-all"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          New Post
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none"
          />
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b4d8]"></div>
          </div>
        ) : (
          <PostTable
            posts={filteredPosts}
            onDelete={handleDelete}
            activeFilter={statusFilter}
            onFilterChange={(s) => setStatusFilter(s)}
          />
        )}
      </div>
    </div>
  );
}
