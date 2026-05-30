'use client';

import { useState } from 'react';
import { FiSearch, FiClock, FiEye } from 'react-icons/fi';
import Link from 'next/link';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);

    // Simulate API call - replace with actual search API
    setTimeout(() => {
      const mockResults = [
        {
          id: 1,
          title: 'Getting Started with Modern Web Development',
          excerpt: 'Learn the fundamentals of modern web development with React and Next.js',
          slug: 'getting-started-web-dev',
          category: { name: 'Health' },
          created_at: '2024-01-15',
          view_count: 1234,
        },
        {
          id: 2,
          title: 'The Future of AI in Business',
          excerpt: 'Exploring how artificial intelligence is transforming the business landscape',
          slug: 'future-of-ai-business',
          category: { name: 'Business' },
          created_at: '2024-01-10',
          view_count: 856,
        },
      ];
      setResults(mockResults);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <section className="relative bg-gradient-to-br from-[#8B1E1E] via-[#A73030] to-[#C74D4D] text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm">
            <FiSearch className="w-10 h-10" />
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
            Search Articles
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Find exactly what you're looking for across all our content
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for articles, topics, or keywords..."
                className="w-full px-6 py-4 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 pr-14"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-[#8B1E1E] rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105"
              >
                <FiSearch className="w-5 h-5 text-white" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card-premium p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-shimmer" />
                <div className="h-4 bg-gray-200 rounded mb-2 animate-shimmer" />
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-shimmer" />
              </div>
            ))}
          </div>
        )}

        {!loading && searched && results.length > 0 && (
          <div className="space-y-4">
            <div className="glass-strong rounded-xl p-4 mb-6">
              <p className="text-gray-700">
                Found <span className="font-bold text-[#8B1E1E]">{results.length}</span> results for "{searchQuery}"
              </p>
            </div>
            {results.map((result, index) => (
              <Link
                key={result.id}
                href={`/blog/${result.slug}`}
                className="block card-premium p-6 hover-glow animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="badge-premium">
                    {result.category.name}
                  </span>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <div className="flex items-center space-x-1">
                      <FiClock className="w-4 h-4" />
                      <span>{new Date(result.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiEye className="w-4 h-4" />
                      <span>{result.view_count}</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-display font-bold mb-2 group-hover:text-[#8B1E1E] transition-colors">
                  {result.title}
                </h3>
                <p className="text-gray-600">{result.excerpt}</p>
              </Link>
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="glass-strong rounded-3xl p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <FiSearch className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any articles matching "{searchQuery}". Try different keywords or browse our categories.
            </p>
            <Link
              href="/categories"
              className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] text-white hover:shadow-xl hover:shadow-[#8B1E1E]/30 transition-all duration-300 font-medium transform hover:-translate-y-0.5"
            >
              Browse Categories
            </Link>
          </div>
        )}

        {!searched && (
          <div className="glass-strong rounded-3xl p-12 text-center">
            <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">Start Searching</h3>
            <p className="text-gray-600">
              Enter keywords above to search through our entire collection of articles
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
