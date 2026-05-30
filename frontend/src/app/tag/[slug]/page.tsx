'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiCalendar, FiUser, FiArrowRight, FiTag } from 'react-icons/fi';
import { getPosts } from '@/lib/api';
const formatDate = (date: Date, pattern: string) => {
  if (pattern === 'MMM d, yyyy') return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  return date.toLocaleDateString();
};

export default function TagArchive() {
  const { slug } = useParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [tagName, setTagName] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [slug, currentPage]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await getPosts({
        tag: slug as string,
        page: currentPage,
        limit: 12,
      });
      
      setPosts(response.posts);
      setTotalPages(response.pagination.total_pages);
      
      // Extract tag name from first post
      if (response.posts.length > 0) {
        const tag = response.posts[0].tags?.find((t: any) => t.slug === slug);
        if (tag) {
          setTagName(tag.name);
        }
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 mb-6">
            <FiTag className="w-4 h-4 text-[#8B1E1E]" />
            <span className="text-sm font-medium text-gray-700">Tag</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] bg-clip-text text-transparent">
            #{tagName || slug}
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore posts tagged with this topic
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1E1E]"></div>
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    {post.featured_image && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          <FiCalendar className="w-4 h-4 mr-1" />
                          {formatDate(new Date(post.publish_date), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center">
                          <FiUser className="w-4 h-4 mr-1" />
                          {post.author.name}
                        </span>
                      </div>

                      <h2 className="text-xl font-display font-bold text-gray-900 mb-3 group-hover:text-[#8B1E1E] transition-colors">
                        {post.title}
                      </h2>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center text-[#8B1E1E] font-medium hover:gap-2 transition-all"
                      >
                        Read More
                        <FiArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-12">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">No posts found with this tag</p>
              <Link
                href="/blog"
                className="inline-block mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] text-white font-medium hover:shadow-lg transition-all"
              >
                Browse All Posts
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
