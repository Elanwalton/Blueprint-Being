'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiSave, FiX } from 'react-icons/fi';
import ImageUpload from '@/components/ImageUpload';
import RichTextEditor from '@/components/RichTextEditor';
import api from '@/lib/api';

// ── SEO Score helpers ─────────────────────────────────────────────────────────
function calcSeoScore(title: string, slug: string, metaDesc: string, content: string, focusKw: string, wordCount: number) {
  let score = 0;
  const kw = focusKw.toLowerCase().trim();
  
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const first150Chars = plainText.substring(0, 150).toLowerCase();
  
  const imgRegex = /<img[^>]+alt=["']([^"']*)["']/gi;
  let kwInAlt = false;
  let hasImage = false;
  let matches;
  while ((matches = imgRegex.exec(content)) !== null) {
    hasImage = true;
    if (kw && matches[1].toLowerCase().includes(kw)) {
      kwInAlt = true;
      break;
    }
  }

  const checks = {
    hasTitle: title.length > 10,
    kwInTitle: kw ? title.toLowerCase().includes(kw) : false,
    kwInSlug: kw ? slug.toLowerCase().includes(kw.replace(/\s+/g, '-')) || slug.toLowerCase().includes(kw) : false,
    slugLength: slug.length > 0 && slug.length <= 75,
    kwInMeta: kw ? metaDesc.toLowerCase().includes(kw) : false,
    kwInContent: kw ? content.toLowerCase().includes(kw) : false,
    kwInFirstLine: kw ? first150Chars.includes(kw) : false,
    kwInAlt: hasImage ? kwInAlt : true,
    metaLength: metaDesc.length >= 120 && metaDesc.length <= 160,
    wordCount: wordCount >= 300,
  };
  
  if (!hasImage && kw) checks.kwInAlt = true; // can't add alt text if there's no image

  Object.values(checks).forEach((v) => { if (v) score += 1; });
  return { score, max: Object.keys(checks).length, checks };
}

function SeoScoreIndicator({ score, max }: { score: number; max: number }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600';
  const bg = pct >= 75 ? 'bg-green-100' : pct >= 50 ? 'bg-yellow-100' : 'bg-red-100';
  const label = pct >= 75 ? 'Good' : pct >= 50 ? 'Needs Improvement' : 'Poor';
  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-semibold ${bg} ${color}`}>
      <span>{pct}%</span>
      <span>SEO · {label}</span>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function EditPost() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
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
  });

  const wordCount = formData.content ? formData.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length : 0;
  const seo = calcSeoScore(formData.title, formData.slug, formData.meta_description, formData.content, formData.focus_keyword, wordCount);

  const generateSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  useEffect(() => {
    fetchPost();
    fetchCategories();
  }, [id]);

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/posts/manage.php?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const post = response.data.post;
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        featured_image: post.featured_image || '',
        category_id: post.category_id || '',
        status: post.status || 'draft',
        publish_date: post.publish_date || '',
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        meta_keywords: post.meta_keywords || '',
        focus_keyword: post.focus_keyword || '',
      });
    } catch (err) {
      console.error('Error fetching post:', err);
      alert('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/index.php');
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      await api.put('/posts/manage.php', { ...formData, id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      router.push('/admin/posts');
    } catch (err: any) {
      console.error('Error updating post:', err);
      alert(err.response?.data?.message || 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b4d8]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Edit Post</h1>
          <p className="text-gray-600">Update your blog post</p>
        </div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FiX className="w-5 h-5 mr-2" />
          Cancel
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none text-lg font-semibold text-gray-900 bg-white"
          />
        </div>

        {/* Excerpt */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none resize-none text-gray-900 bg-white"
          />
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <RichTextEditor
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
          />
        </div>

        {/* Featured Image */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ImageUpload
            onUploadComplete={(url) => setFormData({ ...formData, featured_image: url })}
            currentImage={formData.featured_image}
            label="Featured Image"
          />
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Post Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none text-gray-900 bg-white"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 outline-none text-gray-900 bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>
        </div>

        {/* SEO Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">SEO Settings</h3>
            <SeoScoreIndicator score={seo.score} max={seo.max} />
          </div>

          <div className="space-y-5">
            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
              <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden focus-within:border-[#00b4d8]">
                <span className="px-3 py-3 bg-gray-50 text-gray-400 text-sm border-r border-gray-200">/blog/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                  className="flex-1 px-3 py-3 outline-none text-sm text-gray-900 bg-transparent"
                  placeholder="post-url-slug"
                />
              </div>
            </div>

            {/* Focus Keyword */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Focus Keyword</label>
              <input
                type="text"
                value={formData.focus_keyword}
                onChange={(e) => setFormData({ ...formData, focus_keyword: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] outline-none text-sm text-gray-900 bg-white"
                placeholder="e.g. healthy lifestyle tips"
              />
              {formData.focus_keyword && formData.content && (
                <p className="mt-1 text-xs text-gray-500">
                  Keyword density: {
                    Math.round(
                      (formData.content.toLowerCase().split(formData.focus_keyword.toLowerCase()).length - 1) /
                      Math.max(wordCount, 1) * 100 * 10
                    ) / 10
                  }%
                </p>
              )}
            </div>

            {/* Meta Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] outline-none text-sm text-gray-900 bg-white"
                placeholder="SEO title (defaults to post title)"
              />
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Meta Description</label>
                <span className={`text-xs font-medium ${
                  formData.meta_description.length > 160 ? 'text-red-500' :
                  formData.meta_description.length >= 120 ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {formData.meta_description.length} / 160
                </span>
              </div>
              <textarea
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] outline-none resize-none text-sm text-gray-900 bg-white"
                placeholder="Describe your post for search engines (120-160 chars)..."
              />
              {/* Preview */}
              {(formData.meta_title || formData.title) && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-1">
                  <p className="text-[#1a0dab] text-base font-medium truncate">{formData.meta_title || formData.title}</p>
                  <p className="text-[#006621] text-xs">yoursite.com/blog/{formData.slug || 'post-slug'}</p>
                  <p className="text-gray-600 text-sm line-clamp-2">{formData.meta_description || 'No meta description set.'}</p>
                </div>
              )}
            </div>

            {/* Meta Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
              <input
                type="text"
                value={formData.meta_keywords}
                onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00b4d8] outline-none text-sm text-gray-900 bg-white"
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>

            {/* SEO Checklist */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">SEO Checklist</p>
              <ul className="space-y-2 text-sm">
                {[
                  [seo.checks.hasTitle, 'Title is set and descriptive'],
                  [seo.checks.kwInTitle, `Focus keyword in title`],
                  [seo.checks.kwInSlug, `Focus keyword in slug`],
                  [seo.checks.slugLength, `Slug length is 75 chars or less`],
                  [seo.checks.kwInMeta, `Focus keyword in meta description`],
                  [seo.checks.kwInFirstLine, `Focus keyword used in the first line/paragraph`],
                  [seo.checks.kwInContent, `Focus keyword used in content`],
                  [seo.checks.kwInAlt, `Focus keyword used in image alternative text`],
                  [seo.checks.metaLength, `Meta description length (120–160 chars)`],
                  [seo.checks.wordCount, `Content has 300+ words (currently ${wordCount})`],
                ].map(([pass, label], i) => (
                  <li key={i} className={`flex items-center space-x-2 ${pass ? 'text-green-700' : 'text-gray-400'}`}>
                    <span>{pass ? '✅' : '⬜'}</span>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5 mr-2" />
                Update Post
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
