'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiClock, FiUser, FiCalendar } from 'react-icons/fi';
import { getPosts, Post } from '@/lib/api';

export default function Home() {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Fetch featured posts (using limit 2 for now as featured)
        const featuredData = await getPosts({ limit: 2 });
        setFeaturedPosts(featuredData.posts);

        // Fetch recent posts (using limit 6, excluding first 2 potentially if needed, but for now just getting latest 6)
        const recentData = await getPosts({ limit: 6 });
        setRecentPosts(recentData.posts);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#FCE9E9] via-white to-[#FCE9E9]">
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FCE9E9] to-[#FFE5E5] rounded-full blur-3xl opacity-40 -z-10 animate-float" />
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-gradient-to-tr from-[#FFE5E5] to-[#FCE9E9] rounded-full blur-3xl opacity-40 -z-10 animate-float" style={{ animationDelay: '2s' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight animate-fadeIn text-gray-900">
              Discover Stories That
              <span className="block bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] bg-clip-text text-transparent">
                Inspire & Inform
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              Explore cutting-edge insights, creative ideas, and expert perspectives across health, lifestyle, and business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <Link
                href="/register"
                className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] text-white hover:shadow-2xl hover:shadow-[#8B1E1E]/40 transition-all duration-300 font-medium transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center space-x-2 relative overflow-hidden group"
              >
                <span className="relative z-10">Start Reading</span>
                <FiArrowRight className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#C74D4D] to-[#8B1E1E] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              <Link
                href="/categories"
                className="inline-block px-8 py-4 rounded-lg bg-white text-gray-800 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 font-medium transform hover:-translate-y-1"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-4xl font-display font-bold text-gray-900">Featured Stories</h2>
            <Link
              href="/blog"
              className="text-[#8B1E1E] hover:text-[#511010] font-medium flex items-center space-x-2 group"
            >
              <span>View All</span>
              <FiArrowRight className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {loading ? (
              // Skeleton Loading
              [...Array(2)].map((_, i) => (
                <div key={i} className="card-premium h-96 animate-pulse">
                  <div className="h-64 bg-gray-200 animate-shimmer" />
                  <div className="p-8 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-shimmer" />
                    <div className="h-8 bg-gray-200 rounded w-3/4 animate-shimmer" />
                  </div>
                </div>
              ))
            ) : (
              featuredPosts.slice(0, 2).map((post, index) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group relative h-[30rem] overflow-hidden rounded-2xl block card-premium animate-fadeIn"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="absolute inset-0 bg-gray-900/40 group-hover:bg-gray-900/30 transition-colors duration-500 z-10 image-overlay" />
                   {/* Placeholder for image if post.featured_image is null/url logic needed */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                    style={{ backgroundImage: `url(${post.featured_image || '/images/placeholder.jpg'})` }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="badge-premium mb-4">
                      {post.category?.name || 'Uncategorized'}
                    </span>
                    <h3 className="text-3xl font-display font-bold mb-3 group-hover:text-pink-200 transition-colors">
                      {post.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-200">
                      <div className="flex items-center space-x-1">
                        <FiUser className="w-4 h-4" />
                        <span>{post.author.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiCalendar className="w-4 h-4" />
                        <span>{new Date(post.publish_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-gray-900 mb-10">Latest Articles</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Skeleton Loading
              [...Array(3)].map((_, i) => (
                <div key={i} className="card-premium h-[28rem] animate-pulse">
                  <div className="h-48 bg-gray-200 animate-shimmer" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-shimmer" />
                    <div className="h-6 bg-gray-200 rounded w-3/4 animate-shimmer" />
                    <div className="h-4 bg-gray-200 rounded w-full animate-shimmer" />
                  </div>
                </div>
              ))
            ) : (
              recentPosts.slice(0, 6).map((post, index) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col card-premium overflow-hidden h-full animate-fadeIn hover-glow"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gray-900/20 group-hover:bg-gray-900/10 transition-colors z-10" />
                    <div 
                      className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                      style={{ backgroundImage: `url(${post.featured_image || '/images/placeholder.jpg'})` }}
                    />
                    <div className="absolute bottom-4 left-4 z-20">
                      <span className="badge-premium bg-white/90 shadow-lg backdrop-blur-sm">
                        {post.category?.name || 'General'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6 flex flex-col">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                      <FiCalendar className="w-4 h-4" />
                      <span>{new Date(post.publish_date).toLocaleDateString()}</span>
                    </div>
                    
                    <h3 className="text-xl font-display font-bold text-gray-900 mb-2 group-hover:text-[#8B1E1E] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                        {/* Avatar placeholder */}
                        <div className="w-full h-full bg-gradient-to-br from-[#8B1E1E] to-[#C74D4D] flex items-center justify-center text-white text-xs font-bold">
                          {post.author.name[0]}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {post.author.name}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-strong rounded-3xl p-12 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#8B1E1E] to-[#C74D4D] rounded-full blur-[100px] opacity-20 -z-10 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#C74D4D] to-[#8B1E1E] rounded-full blur-[100px] opacity-20 -z-10 group-hover:opacity-30 transition-opacity duration-500" />
            
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Join Our Community
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Get the latest insights, tutorials, and trends delivered directly to your inbox.
            </p>
            
            <form className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-lg border border-gray-200 focus:border-[#8B1E1E] focus:ring-2 focus:ring-[#8B1E1E]/20 outline-none transition-all"
              />
              <button
                type="submit"
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] text-white hover:shadow-lg hover:shadow-[#8B1E1E]/30 transition-all font-medium transform hover:-translate-y-0.5"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
