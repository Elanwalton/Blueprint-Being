'use client';

import { useState, useEffect } from 'react';
import { FiTrendingUp, FiEye, FiFileText, FiMessageCircle } from 'react-icons/fi';
import StatsCard from '@/components/admin/StatsCard';
import api from '@/lib/api';

export default function Analytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/analytics/index.php', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
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
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Track your blog's performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Views"
          value={stats?.total_views || 0}
          icon={FiEye}
          color="blue"
          change={12}
        />
        <StatsCard
          title="Total Posts"
          value={stats?.total_posts || 0}
          icon={FiFileText}
          color="green"
          change={5}
        />
        <StatsCard
          title="Total Comments"
          value={stats?.total_comments || 0}
          icon={FiMessageCircle}
          color="purple"
          change={8}
        />
        <StatsCard
          title="Avg. Views/Post"
          value={stats?.avg_views_per_post || 0}
          icon={FiTrendingUp}
          color="orange"
          change={-3}
        />
      </div>

      {/* Popular Posts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-display font-bold text-gray-900 mb-6">Most Popular Posts</h2>
        <div className="space-y-4">
          {stats?.popular_posts?.slice(0, 10).map((post: any, index: number) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#00b4d8] to-[#0077b6] flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{post.title}</h3>
                  <p className="text-sm text-gray-500">{post.category_name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{post.view_count}</p>
                <p className="text-xs text-gray-500">views</p>
              </div>
            </div>
          )) || (
            <p className="text-center text-gray-500 py-8">No data available</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-display font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {stats?.recent_views?.slice(0, 15).map((view: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <FiEye className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{view.post_title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(view.viewed_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )) || (
            <p className="text-center text-gray-500 py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
