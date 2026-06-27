'use client';

import { useEffect, useState } from 'react';
import { FiFileText, FiMessageCircle, FiMail, FiEye } from 'react-icons/fi';
import StatsCard from '@/components/admin/StatsCard';
import Link from 'next/link';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalComments: 0,
    totalSubscribers: 0,
    totalViews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch analytics data
      const analyticsResponse = await api.get('/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (analyticsResponse.data) {
        setStats({
          totalPosts: analyticsResponse.data.total_posts || 0,
          totalComments: analyticsResponse.data.total_comments || 0,
          totalSubscribers: analyticsResponse.data.total_subscribers || 0,
          totalViews: analyticsResponse.data.total_views || 0,
        });
      }

      // Fetch recent posts
      const postsResponse = await api.get('/posts?limit=5');
      setRecentPosts(postsResponse.data.posts || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b4d8]"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening with your blog.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Posts"
          value={stats.totalPosts}
          icon={FiFileText}
          color="blue"
        />
        <StatsCard
          title="Total Comments"
          value={stats.totalComments}
          icon={FiMessageCircle}
          color="green"
        />
        <StatsCard
          title="Subscribers"
          value={stats.totalSubscribers}
          icon={FiMail}
          color="purple"
        />
        <StatsCard
          title="Total Views"
          value={stats.totalViews}
          icon={FiEye}
          color="orange"
        />
      </div>

      {/* Recent Posts */}
      <div className="bg-white dark:bg-[#0f2040] rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Recent Posts</h2>
          <Link
            href="/admin/posts"
            className="text-sm text-[#00b4d8] hover:underline font-medium"
          >
            View All
          </Link>
        </div>

        {recentPosts.length > 0 ? (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1a2c50] transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{post.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {post.view_count} views • {post.comment_count} comments
                  </p>
                </div>
                <Link
                  href={`/admin/posts/edit/${post.id}`}
                  className="px-4 py-2 text-sm text-[#00b4d8] hover:bg-[#00b4d8] hover:text-white rounded-lg transition-colors border border-[#00b4d8]"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No posts yet. Create your first post!</p>
            <Link
              href="/admin/posts/new"
              className="inline-block mt-4 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white font-medium hover:shadow-lg transition-all"
            >
              Create Post
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link
          href="/admin/posts/new"
          className="bg-gradient-to-br from-[#00b4d8] to-[#0077b6] text-white rounded-xl p-6 hover:shadow-xl transition-all"
        >
          <FiFileText className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-bold mb-1">New Post</h3>
          <p className="text-sm opacity-90">Create a new blog post</p>
        </Link>

        <Link
          href="/admin/comments"
          className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 hover:shadow-xl transition-all"
        >
          <FiMessageCircle className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-bold mb-1">Moderate Comments</h3>
          <p className="text-sm opacity-90">Review pending comments</p>
        </Link>

        <Link
          href="/admin/analytics"
          className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl p-6 hover:shadow-xl transition-all"
        >
          <FiEye className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-bold mb-1">View Analytics</h3>
          <p className="text-sm opacity-90">Check your blog stats</p>
        </Link>
      </div>
    </div>
  );
}
