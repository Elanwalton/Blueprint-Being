'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiTwitter, FiFacebook, FiInstagram, FiLinkedin, FiMail } from 'react-icons/fi';
import { newsletterAPI } from '@/lib/api';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await newsletterAPI.subscribe({ email });
      setMessage('Successfully subscribed! Check your email to verify.');
      setEmail('');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-display font-bold mb-2 bg-gradient-to-r from-[#C74D4D] to-[#8B1E1E] bg-clip-text text-transparent">
                Stay Updated
              </h3>
              <p className="text-gray-400">
                Get the latest articles and updates delivered straight to your inbox.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-[#8B1E1E] focus:ring-2 focus:ring-[#8B1E1E]/20 transition-all outline-none"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] hover:shadow-xl hover:shadow-[#8B1E1E]/30 transition-all duration-300 font-medium transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
          {message && (
            <p className={`mt-4 text-sm ${message.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#8B1E1E] to-[#C74D4D] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-xl font-display font-bold">ModernBlog</span>
            </Link>
            <p className="text-gray-400 mb-6">
              Your source for inspiration, innovation, and insightful content across health, lifestyle, and business.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-br hover:from-[#8B1E1E] hover:to-[#C74D4D] flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              >
                <FiTwitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-br hover:from-[#8B1E1E] hover:to-[#C74D4D] flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              >
                <FiFacebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-br hover:from-[#8B1E1E] hover:to-[#C74D4D] flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              >
                <FiInstagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gradient-to-br hover:from-[#8B1E1E] hover:to-[#C74D4D] flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
              >
                <FiLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-pink-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-pink-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-400 hover:text-pink-400 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-pink-400 transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-lg mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/category/health" className="text-gray-400 hover:text-pink-400 transition-colors">
                  Health
                </Link>
              </li>
              <li>
                <Link href="/category/lifestyle" className="text-gray-400 hover:text-pink-400 transition-colors">
                  Lifestyle
                </Link>
              </li>
              <li>
                <Link href="/category/business" className="text-gray-400 hover:text-pink-400 transition-colors">
                  Business
                </Link>
              </li>
              <li>
                <Link href="/category/travel" className="text-gray-400 hover:text-pink-400 transition-colors">
                  Travel
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-pink-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-pink-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-[#8B1E1E] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} ModernBlog. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Built with Next.js & PHP
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
