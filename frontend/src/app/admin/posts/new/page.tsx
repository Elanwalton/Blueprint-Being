'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiSave, FiX, FiEye, FiAlertCircle, FiCheckCircle, FiLink } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';
import RichTextEditor from '@/components/RichTextEditor';
import SocialEmbed from '@/components/SocialEmbed';
import api from '@/lib/api';

// ── Rank Math-style SEO helpers ──────────────────────────────────────────────
function calcSeoScore(title: string, slug: string, metaDesc: string, content: string, focusKw: string, wordCount: number) {
  const kw = focusKw.toLowerCase().trim();
  const plain = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const first10pct = plain.substring(0, Math.max(150, Math.floor(plain.length * 0.1))).toLowerCase();

  const imgRegex = /<img[^>]+alt=["']([^"']*)["']/gi;
  let kwInAlt = false, hasImage = false, m;
  while ((m = imgRegex.exec(content)) !== null) {
    hasImage = true;
    if (kw && m[1].toLowerCase().includes(kw)) { kwInAlt = true; break; }
  }

  const hasH2 = /<h[2-6][^>]*>/i.test(content);
  const hasInternal = /href=["']\/[^"']*/i.test(content);
  const hasExternal = /href=["']https?:\/\/(?!localhost)/i.test(content);

  const checks = {
    hasTitle:      title.length > 10,
    kwInTitle:     kw ? title.toLowerCase().includes(kw) : false,
    kwInSlug:      kw ? slug.toLowerCase().includes(kw.replace(/\s+/g, '-')) || slug.toLowerCase().includes(kw) : false,
    slugLength:    slug.length > 0 && slug.length <= 75,
    kwInMeta:      kw ? metaDesc.toLowerCase().includes(kw) : false,
    kwInFirstLine: kw ? first10pct.includes(kw) : false,
    kwInContent:   kw ? content.toLowerCase().includes(kw) : false,
    kwInAlt:       hasImage ? kwInAlt : true, // no image = don't penalize this check
    metaLength:    metaDesc.length >= 120 && metaDesc.length <= 160,
    wordCount:     wordCount >= 300,
    hasHeadings:   hasH2,
    hasInternalLink: hasInternal,
    hasExternalLink: hasExternal,
  };
  if (!hasImage && kw) checks.kwInAlt = true; // can't add alt text if there's no image

  const score = Object.values(checks).filter(Boolean).length;
  return { score, max: Object.keys(checks).length, checks };
}

function calcReadability(content: string) {
  const plain = content.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
  const sentences = plain.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const paragraphs = content.split(/<\/p>/i).filter(p => p.replace(/<[^>]*>/g, '').trim().length > 0);
  const words = plain.split(/\s+/).filter(Boolean);
  const syllableCount = words.reduce((acc, w) => acc + Math.max(1, w.replace(/[^aeiou]/gi, '').length), 0);

  const avgSentenceLen = sentences.length ? words.length / sentences.length : 0;
  const avgParaLen = paragraphs.length ? words.length / paragraphs.length : 0;

  const passivePatterns = /\b(am|is|are|was|were|be|been|being)\s+\w+ed\b/gi;
  const passiveCount = (plain.match(passivePatterns) || []).length;
  const passiveRatio = sentences.length ? passiveCount / sentences.length : 0;

  const transitionWords = ['however','therefore','furthermore','moreover','additionally','consequently','nevertheless','although','whereas','meanwhile','subsequently','accordingly','indeed','specifically','similarly','likewise','instead','otherwise','thus','hence','first','second','finally','in conclusion','in summary','for example','for instance','in addition','as a result','on the other hand','in contrast','at the same time'];
  const transitionMatches = transitionWords.filter(tw => plain.toLowerCase().includes(tw)).length;
  const transitionRatio = sentences.length ? transitionMatches / sentences.length : 0;

  // Simplified Flesch Reading Ease (0-100, higher = easier)
  const flesch = sentences.length && words.length
    ? Math.round(206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllableCount / words.length))
    : 0;
  const fleschClamped = Math.max(0, Math.min(100, flesch));

  const fleschLabel = fleschClamped >= 70 ? 'Easy' : fleschClamped >= 50 ? 'Standard' : fleschClamped >= 30 ? 'Difficult' : 'Very Difficult';
  const fleschColor = fleschClamped >= 70 ? 'text-green-600' : fleschClamped >= 50 ? 'text-yellow-600' : 'text-red-600';

  return {
    avgSentenceLen: Math.round(avgSentenceLen * 10) / 10,
    avgParaLen: Math.round(avgParaLen * 10) / 10,
    passiveRatio: Math.round(passiveRatio * 100),
    transitionRatio: Math.round(transitionRatio * 100),
    flesch: fleschClamped,
    fleschLabel,
    fleschColor,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
  };
}

function ScoreRing({ score, max }: { score: number; max: number }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 75 ? '#16a34a' : pct >= 50 ? '#ca8a04' : '#dc2626';
  const label = pct >= 75 ? 'Good' : pct >= 50 ? 'Improve' : 'Poor';
  const r = 20, circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <div className="flex items-center space-x-3">
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
        <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 26 26)" style={{ transition: 'stroke-dasharray 0.5s' }} />
        <text x="26" y="31" textAnchor="middle" fontSize="12" fontWeight="700" fill={color}>{pct}</text>
      </svg>
      <div>
        <p className="text-sm font-bold" style={{ color }}>SEO · {label}</p>
        <p className="text-xs text-gray-400">{score} / {max} checks</p>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

const AUTO_SAVE_KEY = 'autosave_new_post';
const AUTO_SAVE_INTERVAL = 5000;

export default function NewPost() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [autoSaveMsg, setAutoSaveMsg] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [showEmbedInput, setShowEmbedInput] = useState(false);
  const [embeds, setEmbeds] = useState<string[]>([]);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [seoTab, setSeoTab] = useState<'seo' | 'readability' | 'social'>('seo');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category_id: '',
    status: 'draft',
    publish_date: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    focus_keyword: '',
    og_title: '',
    og_description: '',
    og_image: '',
    tags: [] as string[],
  });

  const wordCount = formData.content ? formData.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length : 0;
  const seo = calcSeoScore(formData.title, formData.slug, formData.meta_description, formData.content, formData.focus_keyword, wordCount);
  const readability = calcReadability(formData.content);
  const kwDensity = formData.focus_keyword && wordCount
    ? Math.round((formData.content.toLowerCase().split(formData.focus_keyword.toLowerCase()).length - 1) / wordCount * 100 * 10) / 10
    : 0;

  // Load user role
  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      try { const parsed = JSON.parse(u); setUserRole(parsed.role); } catch {}
    }
    // Restore from auto-save
    const saved = localStorage.getItem(AUTO_SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.formData || formData);
        setAutoSaveMsg(`Draft restored from ${new Date(parsed.ts).toLocaleTimeString()}`);
      } catch {}
    }
    fetchCategories();
  }, []);

  // Auto-save every 5 seconds
  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (formData.title || formData.content) {
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify({ formData, ts: Date.now() }));
        setAutoSaveMsg(`Auto-saved at ${new Date().toLocaleTimeString()}`);
      }
    }, AUTO_SAVE_INTERVAL);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [formData]);

  const fetchCategories = async () => {
    try {
      const r = await api.get('/categories');
      setCategories(r.data.categories || []);
    } catch {}
  };

  const generateSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
      meta_title: prev.meta_title || title,
    }));
  };

  const addEmbed = () => {
    if (embedUrl.trim()) {
      setEmbeds(prev => [...prev, embedUrl.trim()]);
      setEmbedUrl('');
      setShowEmbedInput(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const status = userRole === 'contributor' ? 'pending' : formData.status;
      await api.post('/posts/manage.php', { ...formData, status, word_count: wordCount }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem(AUTO_SAVE_KEY);
      router.push('/admin/posts');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = userRole === 'contributor'
    ? [{ value: 'pending', label: 'Pending Review' }]
    : [
        { value: 'draft', label: 'Draft' },
        { value: 'pending', label: 'Pending Review' },
        { value: 'published', label: 'Published' },
        { value: 'scheduled', label: 'Scheduled' },
      ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-1">Create New Post</h1>
          {autoSaveMsg && (
            <p className="text-xs text-gray-400 flex items-center">
              <FiCheckCircle className="w-3 h-3 mr-1 text-green-500" />
              {autoSaveMsg}
            </p>
          )}
        </div>
        <button onClick={() => router.back()} className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
          <FiX className="w-5 h-5 mr-2" />Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none text-lg font-semibold text-gray-900 bg-white"
            placeholder="Enter post title..."
          />
        </div>

        {/* Excerpt */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none resize-none text-gray-900 bg-white"
            placeholder="Brief description of your post..."
          />
        </div>

        {/* Content + Word Count */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Content *</label>
            <span className="text-sm text-gray-500">{wordCount.toLocaleString()} words</span>
          </div>
          <RichTextEditor
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
          />

          {/* Social Embed toolbar */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowEmbedInput(!showEmbedInput)}
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:border-[#00b4d8] hover:text-[#00b4d8] transition-colors"
            >
              <FiLink className="w-4 h-4 mr-1.5" />
              Embed Social / Video
            </button>
            {showEmbedInput && (
              <div className="mt-3 flex gap-2">
                <input
                  type="url"
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                  placeholder="Paste YouTube, Twitter, Instagram, TikTok or Facebook URL..."
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-[#00b4d8] outline-none text-gray-900 bg-white"
                />
                <button type="button" onClick={addEmbed} className="px-4 py-2 rounded-lg bg-[#00b4d8] text-white text-sm hover:bg-[#023e8a]">Add</button>
              </div>
            )}
            {embeds.map((u, i) => <SocialEmbed key={i} url={u} />)}
          </div>
        </div>

        {/* Featured Image */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ImageUpload
            onUploadComplete={(url) => setFormData({ ...formData, featured_image: url })}
            currentImage={formData.featured_image}
            label="Featured Image"
          />
        </div>

        {/* Post Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Post Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] outline-none text-gray-900 bg-white"
              >
                <option value="">Select category</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] outline-none text-gray-900 bg-white"
              >
                {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {formData.status === 'scheduled' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Publish Date</label>
                <input
                  type="datetime-local"
                  value={formData.publish_date}
                  onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] outline-none text-gray-900 bg-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Rank Math SEO Panel ───────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header with score ring */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <ScoreRing score={seo.score} max={seo.max} />
            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1 text-sm">
              {(['seo', 'readability', 'social'] as const).map(tab => (
                <button key={tab} type="button" onClick={() => setSeoTab(tab)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all capitalize ${
                    seoTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {tab === 'seo' ? 'SEO' : tab === 'readability' ? 'Readability' : 'Social'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* ── SEO Tab ── */}
            {seoTab === 'seo' && (
              <>
                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)
                    <span className={`ml-2 text-xs font-normal ${ formData.slug.length > 75 ? 'text-red-500' : 'text-gray-400' }`}>
                      {formData.slug.length}/75
                    </span>
                  </label>
                  <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden focus-within:border-[#00b4d8]">
                    <span className="px-3 py-3 bg-gray-50 text-gray-400 text-sm border-r border-gray-200">/blog/</span>
                    <input type="text" value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                      className="flex-1 px-3 py-3 outline-none text-sm text-gray-900 bg-transparent"
                      placeholder="post-url-slug" />
                  </div>
                </div>

                {/* Focus Keyword */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Focus Keyword</label>
                  <input type="text" value={formData.focus_keyword}
                    onChange={(e) => setFormData({ ...formData, focus_keyword: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] outline-none text-sm text-gray-900 bg-white"
                    placeholder="e.g. healthy lifestyle tips" />
                  {formData.focus_keyword && wordCount > 0 && (
                    <p className={`mt-1 text-xs ${ kwDensity >= 0.5 && kwDensity <= 2.5 ? 'text-green-600' : 'text-yellow-600' }`}>
                      Keyword density: {kwDensity}% {kwDensity < 0.5 ? '(too low, aim for 0.5–2.5%)' : kwDensity > 2.5 ? '(too high, may be over-optimised)' : '(good)'}
                    </p>
                  )}
                </div>

                {/* Meta Title */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Meta Title</label>
                    <span className={`text-xs font-medium ${ formData.meta_title.length > 60 ? 'text-red-500' : formData.meta_title.length >= 40 ? 'text-green-600' : 'text-gray-400' }`}>
                      {formData.meta_title.length}/60
                    </span>
                  </div>
                  <input type="text" value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] outline-none text-sm text-gray-900 bg-white"
                    placeholder="SEO title (defaults to post title)" />
                </div>

                {/* Meta Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                    <span className={`text-xs font-medium ${ formData.meta_description.length > 160 ? 'text-red-500' : formData.meta_description.length >= 120 ? 'text-green-600' : 'text-gray-400' }`}>
                      {formData.meta_description.length}/160
                    </span>
                  </div>
                  <textarea value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] outline-none resize-none text-sm text-gray-900 bg-white"
                    placeholder="Describe your post for search engines (120-160 chars)..." />
                </div>

                {/* Meta Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                  <input type="text" value={formData.meta_keywords}
                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] outline-none text-sm text-gray-900 bg-white"
                    placeholder="keyword1, keyword2, keyword3" />
                </div>

                {/* Google SERP Preview */}
                {(formData.meta_title || formData.title) && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Google Preview</p>
                    <p className="text-[#1a0dab] text-base font-medium truncate hover:underline cursor-pointer">{formData.meta_title || formData.title}</p>
                    <p className="text-[#006621] text-xs">yoursite.com › blog › {formData.slug || 'post-slug'}</p>
                    <p className="text-gray-600 text-sm line-clamp-2 mt-0.5">{formData.meta_description || 'No meta description set.'}</p>
                  </div>
                )}

                {/* SEO Checklist */}
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">SEO Analysis</p>
                  <ul className="space-y-1.5 text-sm">
                    {([
                      [seo.checks.hasTitle,       '✅', '❌', 'Title is set and descriptive (> 10 chars)'],
                      [seo.checks.kwInTitle,      '✅', '❌', 'Focus keyword appears in title'],
                      [seo.checks.kwInSlug,       '✅', '❌', 'Focus keyword appears in URL slug'],
                      [seo.checks.slugLength,     '✅', '❌', 'Slug is 75 characters or less'],
                      [seo.checks.kwInMeta,       '✅', '❌', 'Focus keyword in meta description'],
                      [seo.checks.kwInFirstLine,  '✅', '❌', 'Focus keyword in first 10% of content'],
                      [seo.checks.kwInContent,    '✅', '❌', 'Focus keyword used throughout content'],
                      [seo.checks.kwInAlt,        '✅', '❌', 'Focus keyword used in an image alt text'],
                      [seo.checks.metaLength,     '✅', '❌', 'Meta description is 120–160 chars'],
                      [seo.checks.wordCount,      '✅', '❌', `Content has 300+ words (now: ${wordCount})`],
                      [seo.checks.hasHeadings,    '✅', '❌', 'Content has H2/H3 subheadings'],
                      [seo.checks.hasInternalLink,'✅', '❌', 'Content includes at least one internal link'],
                      [seo.checks.hasExternalLink,'✅', '❌', 'Content includes at least one external link'],
                    ] as [boolean, string, string, string][]).map(([pass, ok, fail, label], i) => (
                      <li key={i} className={`flex items-start space-x-2 ${ pass ? 'text-green-700' : 'text-gray-400' }`}>
                        <span className="mt-0.5 text-base leading-none">{pass ? ok : fail}</span>
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* ── Readability Tab ── */}
            {seoTab === 'readability' && (
              <>
                {/* Flesch Score */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Flesch Reading Ease</p>
                    <p className="text-xs text-gray-500 mt-0.5">Higher score = easier to read</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-bold ${readability.fleschColor}`}>{readability.flesch}</p>
                    <p className={`text-xs font-semibold ${readability.fleschColor}`}>{readability.fleschLabel}</p>
                  </div>
                </div>

                {/* Readability checks */}
                <ul className="space-y-2 text-sm">
                  {([
                    [readability.avgSentenceLen <= 20, `Avg. sentence length: ${readability.avgSentenceLen} words`, 'Keep under 20 words for easy reading'],
                    [readability.avgParaLen <= 150,    `Avg. paragraph length: ${readability.avgParaLen} words`, 'Keep paragraphs under 150 words'],
                    [readability.passiveRatio <= 10,   `Passive voice: ${readability.passiveRatio}% of sentences`, 'Aim for <10% passive voice usage'],
                    [readability.transitionRatio >= 30,`Transition words: ${readability.transitionRatio}% of sentences`, 'Use transitions in 30%+ of sentences'],
                    [readability.sentences >= 5,       `Sentence count: ${readability.sentences}`, 'At least 5 full sentences'],
                    [readability.paragraphs >= 3,      `Paragraph count: ${readability.paragraphs}`, 'Break content into 3+ paragraphs'],
                  ] as [boolean, string, string][]).map(([pass, label, hint], i) => (
                    <li key={i} className={`flex items-start justify-between ${ pass ? 'text-green-700' : 'text-gray-500' }`}>
                      <div className="flex items-start space-x-2">
                        <span className="mt-0.5 text-base">{pass ? '✅' : '❌'}</span>
                        <span className="font-medium">{label}</span>
                      </div>
                      {!pass && <span className="text-xs text-gray-400 ml-2 text-right max-w-[140px]">{hint}</span>}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* ── Social Preview Tab ── */}
            {seoTab === 'social' && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Title
                      <span className="text-xs text-gray-400 font-normal ml-1">(Open Graph / Facebook / LinkedIn)</span>
                    </label>
                    <input type="text" value={formData.og_title}
                      onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] outline-none text-sm text-gray-900 bg-white"
                      placeholder={formData.meta_title || formData.title || 'Social share title...'} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
                    <textarea value={formData.og_description}
                      onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] outline-none resize-none text-sm text-gray-900 bg-white"
                      placeholder={formData.meta_description || 'Description shown when shared on social...'} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Image
                      <span className="text-xs text-gray-400 font-normal ml-1">(defaults to Featured Image)</span>
                    </label>
                    <div className="flex gap-2">
                      <input type="url" value={formData.og_image}
                        onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] outline-none text-sm text-gray-900 bg-white"
                        placeholder="https://... or leave blank to use Featured Image" />
                    </div>
                  </div>
                </div>

                {/* Facebook preview */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Facebook / LinkedIn Preview</p>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="aspect-[1.91/1] bg-gray-100 relative">
                      {(formData.og_image || formData.featured_image) ? (
                        <img src={formData.og_image || formData.featured_image} alt="OG preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-300 text-sm">No image set</div>
                      )}
                    </div>
                    <div className="p-3 bg-gray-50">
                      <p className="text-xs text-gray-400 uppercase">yoursite.com</p>
                      <p className="font-semibold text-gray-900 text-sm truncate">{formData.og_title || formData.meta_title || formData.title || 'Post title'}</p>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{formData.og_description || formData.meta_description || 'Enter a description...'}</p>
                    </div>
                  </div>
                </div>

                {/* Twitter preview */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Twitter / X Preview</p>
                  <div className="border border-gray-200 rounded-2xl overflow-hidden max-w-sm">
                    <div className="aspect-video bg-gray-100 relative">
                      {(formData.og_image || formData.featured_image) ? (
                        <img src={formData.og_image || formData.featured_image} alt="Twitter preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-300 text-sm">No image set</div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-gray-900 text-sm">{formData.og_title || formData.title || 'Post title'}</p>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{formData.og_description || formData.meta_description || 'Enter a description...'}</p>
                      <p className="text-xs text-gray-400 mt-1">yoursite.com</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.title || !formData.content}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />Saving...</> : <><FiSave className="w-5 h-5 mr-2" />Create Post</>}
          </button>
        </div>
      </form>
    </div>
  );
}
