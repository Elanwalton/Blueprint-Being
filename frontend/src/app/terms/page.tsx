'use client';

import { FiFileText } from 'react-icons/fi';

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <section className="relative bg-gradient-to-br from-[#00b4d8] via-[#0096c7] to-[#0077b6] text-white py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-[#ffffff] rounded-full blur-3xl animate-float" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
            <FiFileText className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Terms of Service
          </h1>
          <p className="text-white/90">Last updated: February 10, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="glass-strong rounded-3xl p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-display font-bold mb-4">Agreement to Terms</h2>
            <p className="text-gray-700 mb-6">
              By accessing and using this blog, you accept and agree to be bound by the terms and provisions 
              of this agreement. If you do not agree to these terms, please do not use our service.
            </p>

            <h2 className="text-2xl font-display font-bold mb-4 mt-8">Use License</h2>
            <p className="text-gray-700 mb-4">
              Permission is granted to temporarily access the materials on our blog for personal, 
              non-commercial use only. This is the grant of a license, not a transfer of title, and under 
              this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Modify or copy the materials</li>
              <li>Use the materials for commercial purposes</li>
              <li>Attempt to reverse engineer any software</li>
              <li>Remove any copyright or proprietary notations</li>
              <li>Transfer the materials to another person</li>
            </ul>

            <h2 className="text-2xl font-display font-bold mb-4 mt-8">User Accounts</h2>
            <p className="text-gray-700 mb-4">When you create an account, you must provide accurate information. You are responsible for:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Maintaining the security of your account</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>

            <h2 className="text-2xl font-display font-bold mb-4 mt-8">Content Guidelines</h2>
            <p className="text-gray-700 mb-4">When posting comments or content, you agree not to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Post offensive, abusive, or hateful content</li>
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Spam or post unsolicited advertisements</li>
              <li>Impersonate others or misrepresent your affiliation</li>
            </ul>

            <h2 className="text-2xl font-display font-bold mb-4 mt-8">Intellectual Property</h2>
            <p className="text-gray-700 mb-6">
              All content on this blog, including text, graphics, logos, and images, is the property of the 
              blog owner or its content suppliers and is protected by copyright laws.
            </p>

            <h2 className="text-2xl font-display font-bold mb-4 mt-8">Disclaimer</h2>
            <p className="text-gray-700 mb-6">
              The materials on our blog are provided on an 'as is' basis. We make no warranties, expressed 
              or implied, and hereby disclaim all other warranties including, without limitation, implied 
              warranties of merchantability or fitness for a particular purpose.
            </p>

            <h2 className="text-2xl font-display font-bold mb-4 mt-8">Limitations</h2>
            <p className="text-gray-700 mb-6">
              In no event shall we or our suppliers be liable for any damages arising out of the use or 
              inability to use the materials on our blog.
            </p>

            <h2 className="text-2xl font-display font-bold mb-4 mt-8">Revisions</h2>
            <p className="text-gray-700 mb-6">
              We may revise these terms of service at any time without notice. By using this blog, you 
              agree to be bound by the current version of these terms.
            </p>

            <h2 className="text-2xl font-display font-bold mb-4 mt-8">Governing Law</h2>
            <p className="text-gray-700 mb-6">
              These terms shall be governed by and construed in accordance with the laws of Kenya, and you 
              irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>

            <h2 className="text-2xl font-display font-bold mb-4 mt-8">Contact Information</h2>
            <p className="text-gray-700">
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@blog.com" className="text-[#00b4d8] hover:text-[#0077b6] font-medium">
                legal@blog.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
