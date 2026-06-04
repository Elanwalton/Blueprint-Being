'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiFolder, FiFileText } from 'react-icons/fi';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockCategories = [
      { id: 1, name: 'Health',    slug: 'health',    description: 'Wellness and fitness tips',          postCount: 24, color: 'from-teal-500 to-cyan-500' },
      { id: 2, name: 'Lifestyle', slug: 'lifestyle', description: 'Tips for better living',             postCount: 18, color: 'from-cyan-500 to-blue-600' },
      { id: 3, name: 'Business',  slug: 'business',  description: 'Business insights and strategies',   postCount: 15, color: 'from-blue-500 to-indigo-500' },
      { id: 4, name: 'Travel',    slug: 'travel',    description: 'Explore the world',                  postCount: 12, color: 'from-green-500 to-emerald-500' },
      { id: 5, name: 'Food',      slug: 'food',      description: 'Culinary adventures',                postCount: 20, color: 'from-orange-500 to-amber-500' },
    ];
    setTimeout(() => {
      setCategories(mockCategories);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen pt-8 pb-16 bg-[var(--background)]">

      {/* ── HERO HEADER — rounded pill card ── */}
      <section className="
        relative overflow-hidden
        mx-4 sm:mx-6 lg:mx-8
        rounded-3xl
        bg-gradient-to-br from-[#00b4d8] via-[#0096c7] to-[#0077b6]
        text-white py-20 px-4
        shadow-2xl shadow-[#00b4d8]/20 dark:shadow-[#000B18]/60
        border border-[#00b4d8]/20 dark:border-cyan-800/40
      ">
        {/* floating blobs — use bg-[#ffffff] to bypass global dark:bg-white override */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-40 h-40 bg-[#ffffff] rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#ffffff] rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Inner card — icon + text all together */}
          <div className="mx-auto max-w-2xl bg-white/90 dark:bg-[#000B18]/70 backdrop-blur-md rounded-2xl px-8 py-10 border border-white/20 dark:border-white/10 shadow-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00b4d8]/10 dark:bg-white/20 rounded-2xl mb-6 backdrop-blur-sm">
              <FiFolder className="w-10 h-10 text-[#00b4d8] dark:text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-4 text-gray-900 dark:text-white">
              Browse Categories
            </h1>
            <p className="text-xl text-gray-600 dark:text-white/85 leading-relaxed">
              Explore our diverse collection of topics and find content that interests you
            </p>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES GRID ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-premium animate-pulse">
                <div className="p-8 space-y-4">
                  <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group card-premium animate-fadeIn hover-glow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-8">
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <FiFolder className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#00b4d8] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                    <FiFileText className="w-4 h-4 mr-1" />
                    <span>{category.postCount} articles</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="glass-strong dark:bg-[#0a1628] rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800">
          <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Use our search feature to find specific articles across all categories
          </p>
          <Link
            href="/search"
            className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white hover:shadow-2xl hover:shadow-[#00b4d8]/40 transition-all duration-300 font-medium transform hover:-translate-y-1 hover:scale-105"
          >
            Search Articles
          </Link>
        </div>
      </section>
    </div>
  );
}
