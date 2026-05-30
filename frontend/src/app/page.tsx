'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiClock, FiUser, FiCalendar, FiBookOpen } from 'react-icons/fi';
import { getPosts, Post } from '@/lib/api';

export default function Home() {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const featuredData = await getPosts({ limit: 4 }); // Get 4 for the editorial grid
        setFeaturedPosts(featuredData.posts);
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

  // Use the first featured post as the main hero if available
  const mainFeatured = featuredPosts.length > 0 ? featuredPosts[0] : null;
  const secondaryFeatured = featuredPosts.slice(1, 4);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-gray-900 font-sans selection:bg-[#8B1E1E] selection:text-white">
      {/* ─── EDITORIAL HERO ─── */}
      <section className="pt-12 md:pt-20 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 animate-fadeIn">
          <p className="text-[#8B1E1E] font-medium tracking-widest uppercase text-xs md:text-sm mb-3 md:mb-4">Blueprint Being</p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black tracking-tight text-gray-900 mb-4 md:mb-6 leading-[1.1] md:leading-tight">
            Ideas that <span className="italic font-light text-gray-600">shape</span> the future.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-light px-4 sm:px-0">
            A curated space for deep thinkers, creators, and leaders. Explore perspectives on life, business, and continuous growth.
          </p>
        </div>

        {/* Editorial Grid */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          {/* Main Hero Post or Generic Hero Image if loading/no posts */}
          <div className="lg:col-span-8 group relative flex flex-col justify-end min-h-[500px] rounded-xl overflow-hidden">
            {loading ? (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            ) : mainFeatured ? (
              <Link href={`/blog/${mainFeatured.slug}`} className="absolute inset-0 block">
                <Image
                  src={mainFeatured.featured_image || '/images/hero-blog.png'}
                  alt={mainFeatured.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-widest rounded-sm mb-4">
                    {mainFeatured.category?.name || 'Featured'}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 leading-tight group-hover:text-gray-200 transition-colors">
                    {mainFeatured.title}
                  </h2>
                  <div className="flex items-center text-gray-300 text-sm font-medium space-x-4">
                    <span className="flex items-center gap-1.5"><FiUser /> {mainFeatured.author.name}</span>
                    <span className="flex items-center gap-1.5"><FiCalendar /> {new Date(mainFeatured.publish_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="absolute inset-0 block">
                <Image
                  src="/images/hero-blog.png"
                  alt="Writing workspace"
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                  <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
                    The Art of Intentional Living and Designing Your Blueprint
                  </h2>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Posts */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="border-b border-gray-200 pb-2">
              <h3 className="font-display font-bold text-2xl text-gray-900">Trending Now</h3>
            </div>
            
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 w-full" />
                    <div className="h-4 bg-gray-200 w-3/4" />
                  </div>
                </div>
              ))
            ) : (
              secondaryFeatured.map((post, i) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group flex gap-5 items-start">
                  <div className="relative w-28 h-28 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={post.featured_image || '/images/hero-blog.png'}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#8B1E1E] text-xs font-bold uppercase tracking-wider mb-1">
                      {post.category?.name || 'Article'}
                    </span>
                    <h4 className="font-display font-bold text-lg leading-snug group-hover:text-[#8B1E1E] transition-colors line-clamp-3">
                      {post.title}
                    </h4>
                    <span className="text-gray-500 text-xs mt-2 font-medium">
                      {new Date(post.publish_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ─── DIVIDER ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gray-200 w-full" />
      </div>

      {/* ─── LATEST READS (MAGAZINE STYLE) ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-display font-bold text-gray-900">Latest Reads</h2>
          <Link href="/blog" className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#8B1E1E] transition-colors group">
            All Articles <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="h-64 bg-gray-200 rounded-xl" />
                <div className="h-4 bg-gray-200 w-1/4" />
                <div className="h-6 bg-gray-200 w-full" />
                <div className="h-6 bg-gray-200 w-5/6" />
              </div>
            ))
          ) : (
            recentPosts.map((post, i) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col">
                <div className="relative h-64 mb-6 rounded-xl overflow-hidden">
                  <Image
                    src={post.featured_image || '/images/hero-blog.png'}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                  <span className="text-[#8B1E1E]">{post.category?.name || 'Editorial'}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>{new Date(post.publish_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-3 leading-snug group-hover:text-[#8B1E1E] transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 font-light leading-relaxed line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
                <div className="mt-auto flex items-center gap-2 text-sm font-medium text-gray-900">
                  <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-xs text-gray-600">
                    {post.author.name[0]}
                  </div>
                  {post.author.name}
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ─── ELEGANT NEWSLETTER ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#FDFBF7] rounded-[2rem] p-8 sm:p-12 md:p-16 border border-gray-100 shadow-sm text-center relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FCE9E9] to-transparent rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#FFE5E5] to-transparent rounded-full blur-3xl opacity-60 translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-sm mb-8 border border-gray-100 transform -rotate-3">
                <FiBookOpen className="w-6 h-6 text-[#8B1E1E]" />
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                The Blueprint Dispatch
              </h2>
              <p className="text-lg text-gray-500 font-light mb-10 leading-relaxed max-w-xl mx-auto">
                Join thousands of readers receiving our finest essays, curation, and insights every Sunday morning.
              </p>

              <form className="max-w-md mx-auto relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#8B1E1E]/20 to-[#C74D4D]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition duration-500" />
                <div className="relative flex flex-col sm:flex-row bg-white rounded-2xl sm:rounded-full shadow-sm border border-gray-200 focus-within:border-[#8B1E1E]/50 focus-within:ring-4 focus-within:ring-[#8B1E1E]/10 transition-all overflow-hidden p-1.5">
                  <input
                    type="email"
                    placeholder="Enter your email address..."
                    className="flex-1 px-6 py-4 sm:py-3 bg-transparent border-0 focus:ring-0 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 text-sm w-full"
                    required
                  />
                  <button
                    type="submit"
                    className="mt-2 sm:mt-0 w-full sm:w-auto px-8 py-4 sm:py-3 bg-[#8B1E1E] hover:bg-[#6B1515] text-white font-medium text-sm rounded-xl sm:rounded-full transition-colors duration-300"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
              <p className="text-xs text-gray-400 mt-6 uppercase tracking-widest font-medium">No spam. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
