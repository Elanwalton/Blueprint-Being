'use client';

import Link from 'next/link';
import { FiTwitter, FiFacebook, FiInstagram, FiLinkedin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-[#f8fafc] dark:bg-[#000B18] border-t border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand & About */}
          <div className="md:col-span-12 lg:col-span-4">
            <Link href="/" className="flex items-center space-x-2 mb-6 group inline-flex">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00b4d8] to-[#0077b6] rounded-lg flex items-center justify-center transform group-hover:-rotate-6 transition-transform duration-300 shadow-md">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-2xl font-display font-bold text-gray-900 dark:text-white">Blueprint Being</span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 mb-8 font-light leading-relaxed max-w-sm">
              A curated space for deep thinkers, creators, and leaders. Explore perspectives on life, business, and continuous growth.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="text-gray-400 hover:text-[#00b4d8] transition-colors transform hover:-translate-y-1 duration-300">
                <span className="sr-only">Twitter</span>
                <FiTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#00b4d8] transition-colors transform hover:-translate-y-1 duration-300">
                <span className="sr-only">Facebook</span>
                <FiFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#00b4d8] transition-colors transform hover:-translate-y-1 duration-300">
                <span className="sr-only">Instagram</span>
                <FiInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#00b4d8] transition-colors transform hover:-translate-y-1 duration-300">
                <span className="sr-only">LinkedIn</span>
                <FiLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-2"></div>

          {/* Quick Links */}
          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="font-display font-bold text-gray-900 dark:text-white text-lg mb-6">Explore</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-[#00b4d8] dark:hover:text-[#00E5FF] transition-colors">Home</Link></li>
              <li><Link href="/blog" className="text-gray-500 dark:text-gray-400 hover:text-[#00b4d8] dark:hover:text-[#00E5FF] transition-colors">All Articles</Link></li>
              <li><Link href="/categories" className="text-gray-500 dark:text-gray-400 hover:text-[#00b4d8] dark:hover:text-[#00E5FF] transition-colors">Topics</Link></li>
              <li><Link href="/about" className="text-gray-500 dark:text-gray-400 hover:text-[#00b4d8] dark:hover:text-[#00E5FF] transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="font-display font-bold text-gray-900 dark:text-white text-lg mb-6">Topics</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/category/health" className="text-gray-500 dark:text-gray-400 hover:text-[#00b4d8] dark:hover:text-[#00E5FF] transition-colors">Health &amp; Wellness</Link></li>
              <li><Link href="/category/lifestyle" className="text-gray-500 dark:text-gray-400 hover:text-[#00b4d8] dark:hover:text-[#00E5FF] transition-colors">Lifestyle Design</Link></li>
              <li><Link href="/category/business" className="text-gray-500 dark:text-gray-400 hover:text-[#00b4d8] dark:hover:text-[#00E5FF] transition-colors">Business &amp; Strategy</Link></li>
              <li><Link href="/category/travel" className="text-gray-500 dark:text-gray-400 hover:text-[#00b4d8] dark:hover:text-[#00E5FF] transition-colors">Travel Guides</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="font-display font-bold text-gray-900 dark:text-white text-lg mb-6">Legal</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-[#00b4d8] dark:hover:text-[#00E5FF] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-500 dark:text-gray-400 hover:text-[#00b4d8] dark:hover:text-[#00E5FF] transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="text-gray-500 dark:text-gray-400 hover:text-[#00b4d8] dark:hover:text-[#00E5FF] transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#000B18] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 dark:text-gray-500 text-sm font-medium">
              © {new Date().getFullYear()} Blueprint Being. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm font-medium text-gray-400 dark:text-gray-600">
              <span>Powered by Next.js &amp; Firebase</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
