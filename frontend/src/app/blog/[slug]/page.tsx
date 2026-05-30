'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getPostBySlug, SinglePostResponse } from '@/lib/api';
import { FiCalendar, FiClock, FiUser, FiArrowLeft, FiTag, FiChevronRight } from 'react-icons/fi';
import ShareButton from '@/components/ShareButton';
import Head from 'next/head';
const formatDate = (date: Date, pattern: string) => {
  if (pattern === 'MMMM d, yyyy') {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  if (pattern === 'MMM d, yyyy') {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString();
};
import CommentList from '@/components/CommentList';

export default function SinglePostWithSlug() {
  const { slug } = useParams();
  const [post, setPost] = useState<SinglePostResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const data = await getPostBySlug(slug as string);
        setPost(data);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post. It might not exist or the server is down.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-8"></div>
          <div className="h-64 sm:h-96 bg-gray-200 rounded-3xl mb-8"></div>
          <div className="h-12 w-3/4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">Post Not Found</h1>
        <p className="text-gray-600 mb-8">{error || "The article you're looking for doesn't exist."}</p>
        <Link
          href="/blog"
          className="px-8 py-3 rounded-lg bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] text-white hover:shadow-lg transition-all font-medium flex items-center space-x-2"
        >
          <FiArrowLeft />
          <span>Back to Blog</span>
        </Link>
      </div>
    );
  }

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://yoursite.com';
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const ogTitle = (post as any).og_title || post.meta?.title || post.title;
  const ogDesc = (post as any).og_description || post.meta?.description || post.excerpt;
  const ogImage = (post as any).og_image || post.featured_image || '';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featured_image ? [post.featured_image] : [],
    datePublished: post.publish_date,
    dateModified: post.updated_at || post.publish_date,
    author: { '@type': 'Person', name: post.author.name },
    publisher: { '@type': 'Organization', name: 'Blueprint Being' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
      ...(post.category ? [{ '@type': 'ListItem', position: 3, name: post.category.name, item: `${siteUrl}/blog?category=${post.category.slug}` }] : []),
      { '@type': 'ListItem', position: post.category ? 4 : 3, name: post.title, item: postUrl },
    ],
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      {/* JSON-LD + OG Meta Tags */}
      <Head>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDesc || ''} />
        {post.meta?.keywords && <meta name="keywords" content={post.meta.keywords} />}
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDesc || ''} />
        <meta property="og:url" content={postUrl} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDesc || ''} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
      </Head>

      {/* Article JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 mb-12">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb UI */}
          <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-[#8B1E1E] transition-colors">Home</Link>
            <FiChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <Link href="/blog" className="hover:text-[#8B1E1E] transition-colors">Blog</Link>
            {post.category && (
              <>
                <FiChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                <Link href={`/blog?category=${post.category.slug}`} className="hover:text-[#8B1E1E] transition-colors">
                  {post.category.name}
                </Link>
              </>
            )}
            <FiChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-gray-600 truncate max-w-[180px] sm:max-w-xs" title={post.title}>{post.title}</span>
          </nav>

          {post.category && (
            <span className="badge-premium mb-6">
              {post.category.name}
            </span>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-8 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-6 text-gray-500 mb-12">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B1E1E] to-[#C74D4D] flex items-center justify-center text-white font-bold">
                  {post.author.name[0]}
                </div>
                <span className="font-medium text-gray-900">{post.author.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiCalendar className="w-5 h-5" />
                <span>{formatDate(new Date(post.publish_date), 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiClock className="w-5 h-5" />
                <span>{Math.ceil(post.content.length / 1000)} min read</span>
              </div>
            </div>
            <ShareButton title={post.title} />
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {post.featured_image && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl relative">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
             <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl" />
          </div>
        </div>
      )}

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="prose prose-lg md:prose-xl max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-[#8B1E1E] prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {/* Tags + Share */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap items-start justify-between gap-6">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag.id} className="inline-flex items-center px-4 py-2 rounded-full bg-gray-50 text-gray-600 text-sm hover:bg-gray-100 transition-colors cursor-default">
                  <FiTag className="w-4 h-4 mr-2 text-[#8B1E1E]" />
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          <ShareButton title={post.title} />
        </div>
      </article>

      {/* Comments Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <CommentList postId={post.id} />
      </section>

      {/* Related Posts */}
      {post.related_posts && post.related_posts.length > 0 && (
        <section className="mt-20 pt-20 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-12 text-center">
              Read Next
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {post.related_posts.map((relatedPost, index) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group card-premium animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {relatedPost.featured_image && (
                    <div className="aspect-video overflow-hidden relative image-overlay">
                      <img
                        src={relatedPost.featured_image}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-display font-bold mb-2 group-hover:text-[#8B1E1E] transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">{relatedPost.excerpt}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <FiCalendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(new Date(relatedPost.publish_date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
