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
    <div className="min-h-screen pt-8 pb-16 bg-[var(--background)]">
      {/* ── HERO ── */}
      <section className="
        relative overflow-hidden
        mx-4 sm:mx-6 lg:mx-8
        rounded-3xl
        bg-gradient-to-br from-[#00b4d8] via-[#0096c7] to-[#0077b6]
        text-white py-20 px-4
        shadow-2xl shadow-[#00b4d8]/20 dark:shadow-[#000B18]/60
        border border-[#00b4d8]/20 dark:border-cyan-800/40
      ">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-40 h-40 bg-[#ffffff] rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#ffffff] rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Inner card — icon + text + search bar */}
          <div className="mx-auto max-w-2xl bg-white/90 dark:bg-[#000B18]/70 backdrop-blur-md rounded-2xl px-6 sm:px-8 py-10 border border-white/20 dark:border-white/10 shadow-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00b4d8]/10 dark:bg-white/20 rounded-2xl mb-6 backdrop-blur-sm">
              <FiSearch className="w-10 h-10 text-[#00b4d8] dark:text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-4 text-gray-900 dark:text-white">
              Search Articles
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-white/85 leading-relaxed mb-10">
              Find exactly what you're looking for across all our content
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative mx-auto group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00b4d8]/20 to-[#0077b6]/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition duration-500 dark:group-hover:opacity-40" />
              <div className="relative flex flex-col sm:flex-row items-center bg-white dark:bg-[#0f2040] rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-[#00b4d8]/50 focus-within:ring-4 focus-within:ring-[#00b4d8]/10 transition-all shadow-lg shadow-gray-100 dark:shadow-none p-1.5 overflow-hidden">
                <FiSearch className="hidden sm:block ml-5 text-gray-400 dark:text-gray-500 w-6 h-6 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, topics..."
                  className="flex-1 w-full bg-transparent border-0 focus:ring-0 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg px-4 py-3 text-center sm:text-left"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto mt-2 sm:mt-0 px-6 py-3 bg-[#00b4d8] hover:bg-[#023e8a] text-white font-medium rounded-xl transition-colors duration-300 shadow-md shrink-0"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
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
                Found <span className="font-bold text-[#00b4d8]">{results.length}</span> results for "{searchQuery}"
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
                <h3 className="text-2xl font-display font-bold mb-2 group-hover:text-[#00b4d8] transition-colors">
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
              className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white hover:shadow-xl hover:shadow-[#00b4d8]/30 transition-all duration-300 font-medium transform hover:-translate-y-0.5"
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
