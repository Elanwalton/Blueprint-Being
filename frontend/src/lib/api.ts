/**
 * lib/api.ts
 *
 * Centralised API client that calls Next.js API routes (/api/...) instead of the
 * legacy PHP backend.  Authentication uses Firebase ID tokens obtained from the
 * currently signed-in Firebase Auth user.
 */

import axios from 'axios';
import { auth } from './firebase';

// All calls go to the same Next.js origin — no need for a configurable base URL.
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

/** Attach the Firebase ID token to every outgoing request (if signed in). */
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  publish_date: string;
  view_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    name: string;
    picture: string | null;
    bio?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  tags: {
    id: string;
    name: string;
    slug: string;
  }[];
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface SinglePostResponse extends Post {
  meta: {
    title: string | null;
    description: string | null;
    keywords: string | null;
  };
  related_posts: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string | null;
    publish_date: string;
  }[];
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export const getPosts = async (
  params: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
    status?: string;
    author_id?: string;
  } = {}
): Promise<PostsResponse> => {
  const response = await api.get('/posts', { params });
  return response.data;
};

export const getPostBySlug = async (slug: string): Promise<SinglePostResponse> => {
  const response = await api.get(`/posts/${slug}`);
  return response.data;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
// Login / forgot-password / reset-password are now handled client-side via
// Firebase Auth SDK (see login/page.tsx etc.).  We keep the register call here
// because it also creates the Firestore user document via the API route.

export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
};

// ─── Image upload ─────────────────────────────────────────────────────────────

export const uploadImage = async (file: File): Promise<{ url: string; filename: string }> => {
  const formData = new FormData();
  formData.append('image', file);

  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : '';

  const response = await axios.post('/api/uploads/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

// ─── Comments ─────────────────────────────────────────────────────────────────

export interface CommentData {
  post_id: string;
  content: string;
  parent_id?: string;
}

export const commentAPI = {
  getComments: (postId: string) => api.get(`/comments?post_id=${postId}`),
  createComment: (data: CommentData) => api.post('/comments', data),
  deleteComment: (id: string) => api.delete(`/comments?id=${id}`),
  moderateComment: (id: string, status: string) =>
    api.put('/comments', { comment_id: id, status }),
};

// ─── Newsletter ───────────────────────────────────────────────────────────────

export const newsletterAPI = {
  subscribe: (data: { email: string; name?: string }) => api.post('/newsletter', data),
  unsubscribe: (email: string) =>
    api.delete(`/newsletter?email=${encodeURIComponent(email)}`),
};

export default api;
