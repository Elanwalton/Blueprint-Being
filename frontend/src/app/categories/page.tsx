'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiFolder, FiFileText } from 'react-icons/fi';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock categories data - replace with actual API call
    const mockCategories = [
      { id: 1, name: 'Health', slug: 'health', description: 'Wellness and fitness tips', postCount: 24, color: 'from-teal-500 to-cyan-500' },
      { id: 2, name: 'Lifestyle', slug: 'lifestyle', description: 'Tips for better living', postCount: 18, color: 'from-pink-500 to-rose-500' },
      { id: 3, name: 'Business', slug: 'business', description: 'Business insights and strategies', postCount: 15, color: 'from-purple-500 to-indigo-500' },
      { id: 4, name: 'Travel', slug: 'travel', description: 'Explore the world', postCount: 12, color: 'from-green-500 to-emerald-500' },
      { id: 5, name: 'Food', slug: 'food', description: 'Culinary adventures', postCount: 20, color: 'from-orange-500 to-amber-500' },
    ];
    
    setTimeout(() => {
      setCategories(mockCategories);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <section className="relative bg-gradient-to-br from-[#8B1E1E] via-[#A73030] to-[#C74D4D] text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm">
            <FiFolder className="w-10 h-10" />
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
            Browse Categories
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Explore our diverse collection of topics and find content that interests you
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-premium animate-pulse">
                <div className="p-8 space-y-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-xl animate-shimmer" />
                  <div className="h-6 bg-gray-200 rounded w-2/3 animate-shimmer" />
                  <div className="h-4 bg-gray-200 rounded animate-shimmer" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-shimmer" />
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
                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-2 group-hover:text-[#8B1E1E] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <FiFileText className="w-4 h-4 mr-1" />
                    <span>{category.postCount} articles</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="glass-strong rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-gray-600 mb-6">
            Use our search feature to find specific articles across all categories
          </p>
          <Link
            href="/search"
            className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] text-white hover:shadow-2xl hover:shadow-[#8B1E1E]/40 transition-all duration-300 font-medium transform hover:-translate-y-1 hover:scale-105"
          >
            Search Articles
          </Link>
        </div>
      </section>
    </div>
  );
}
