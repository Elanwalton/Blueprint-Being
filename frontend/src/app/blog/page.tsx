'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiSearch, FiCalendar, FiClock, FiUser, FiArrowLeft, FiArrowRight, FiEye, FiMessageCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getPosts, Post } from '@/lib/api';
const formatDate = (date: Date, pattern: string) => {
  if (pattern === 'MMM d') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return date.toLocaleDateString();
};
import { useSearchParams, useRouter } from 'next/navigation';

export default function BlogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  // Get params from URL
  const page = Number(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';

  const categories = [
    { name: 'All', slug: '' },
    { name: 'Health', slug: 'health' },
    { name: 'Lifestyle', slug: 'lifestyle' },
    { name: 'Business', slug: 'business' },
    { name: 'Travel', slug: 'travel' },
    { name: 'Food', slug: 'food' },
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await getPosts({
          page,
          limit: 9,
          category,
          search: searchQuery,
          status: 'published'
        });
        
        setPosts(data.posts);
        setTotalPages(data.pagination.total_pages);
        setTotalPosts(data.pagination.total);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    
    // Scroll to top on param change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, category, searchQuery]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    params.set('page', '1'); // Reset to page 1
    
    router.push(`/blog?${params.toString()}`);
  };

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    params.set('page', '1'); // Reset to page 1
    router.push(`/blog?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/blog?${params.toString()}`);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-4xl mx-auto mb-16">
        <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 animate-fadeIn text-gray-900">
          Our Blog
        </h1>
        <p className="text-xl text-gray-600 mb-12 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          Discover the latest stories, ideas, and expertise from our team using a health-focused approach.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-12 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <FiSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Search articles..."
            className="w-full pl-16 pr-6 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E1E] focus:ring-2 focus:ring-[#8B1E1E]/20 outline-none shadow-lg shadow-gray-100 transition-all text-lg"
          />
        </form>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Category Filter */}
        <div className="glass-strong rounded-xl shadow-xl p-6 mb-12 overflow-x-auto">
          <div className="flex flex-nowrap md:flex-wrap gap-4 items-center justify-start md:justify-center min-w-max md:min-w-0">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                  (category === cat.slug)
                    ? 'bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-[#8B1E1E] border border-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-premium h-[30rem] animate-pulse">
                <div className="h-64 bg-gray-200 animate-shimmer" />
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-shimmer" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 animate-shimmer" />
                  <div className="h-4 bg-gray-200 rounded w-full animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
              <FiSearch className="w-12 h-12 text-pink-600" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-2">No posts found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                router.push('/blog');
              }}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] text-white hover:shadow-xl hover:shadow-[#8B1E1E]/30 transition-all duration-300 font-medium transform hover:-translate-y-0.5"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Posts Grid */}
        {!loading && posts.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {posts.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group card-premium animate-fadeIn flex flex-col h-full"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="aspect-video overflow-hidden relative image-overlay">
                  <img
                    src={post.featured_image || '/images/placeholder.jpg'}
                    alt={post.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center space-x-2 mb-4">
                    {post.category && (
                      <span className="badge-premium">
                        {post.category.name}
                      </span>
                    )}
                    <span className="text-gray-400 text-sm flex items-center">
                      <FiClock className="w-3 h-3 mr-1" />
                      {Math.ceil(post.content.length / 1000)} min
                    </span>
                  </div>

                  <h3 className="text-xl font-display font-bold text-gray-900 mb-3 group-hover:text-[#8B1E1E] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                    <div className="flex items-center space-x-2">
                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B1E1E] to-[#C74D4D] flex items-center justify-center text-white text-xs font-bold">
                        {post.author.name[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{post.author.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDate(new Date(post.publish_date), 'MMM d')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-12 pb-8">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`p-3 rounded-xl border ${
                page === 1
                  ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                  : 'border-gray-200 text-gray-600 hover:border-[#8B1E1E] hover:text-[#8B1E1E] shadow-sm hover:shadow-md'
              } transition-all`}
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2 px-4">
              <span className="text-gray-900 font-semibold">{page}</span>
              <span className="text-gray-400">of</span>
              <span className="text-gray-600">{totalPages}</span>
            </div>

            <button
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`p-3 rounded-xl border ${
                page === totalPages
                  ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                  : 'border-gray-200 text-gray-600 hover:border-[#8B1E1E] hover:text-[#8B1E1E] shadow-sm hover:shadow-md'
              } transition-all`}
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
