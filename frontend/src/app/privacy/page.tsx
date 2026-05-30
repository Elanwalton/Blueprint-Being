'use client';

import { FiShield } from 'react-icons/fi';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <section className="relative bg-gradient-to-br from-[#8B1E1E] via-[#A73030] to-[#C74D4D] text-white py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-float" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
            <FiShield className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Privacy Policy
          </h1>
          <p className="text-white/90">Last updated: February 10, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="glass-strong rounded-3xl p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-display font-bold mb-4">Introduction</h2>
            <p className="text-gray-700 mb-6">
              We respect your privacy and are committed to protecting your personal data. This privacy policy 
              explains how we collect, use, and safeguard your information when you visit our blog.
            </p>

            <h2 className="text-2xl font-display font-bold mb-4 mt-8">Information We Collect</h2>
            <p className="text-gray-700 mb-4">We may collect the following types of information:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Personal identification information (name, email address)</li>
              <li>Usage data (pages visited, time spent on site)</li>
              <li>Technical data (IP address, browser type, device information)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h2 className="text-2xl font-display font-bold mb-4 mt-8">How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use the collected information for:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Providing and maintaining our service</li>
              <li>Notifying you about changes to our service</li>
              <li>Providing customer support</li>
              <li>Analyzing usage patterns to improve our content</li>
              <li>Sending newsletters and marketing communications (with your consent)</li>
            </ul>

            <h2 className="text-2xl font-display font-bold mb-4 mt-8">Data Security</h2>
            <p className="text-gray-700 mb-6">
              We implement appropriate security measures to protect your personal information. However, no method 
              of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>

            <h2 className="text-2xl font-display font-bold mb-4 mt-8">Your Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Withdraw consent at any time</li>
            </ul>

            <h2 className="text-2xl font-display font-bold mb-4 mt-8">Cookies</h2>
            <p className="text-gray-700 mb-6">
              We use cookies to enhance your browsing experience. You can control cookie settings through your 
              browser preferences. Disabling cookies may affect the functionality of our website.
            </p>

            <h2 className="text-2xl font-display font-bold mb-4 mt-8">Third-Party Services</h2>
            <p className="text-gray-700 mb-6">
              We may use third-party services for analytics and advertising. These services have their own 
              privacy policies, and we encourage you to review them.
            </p>

            <h2 className="text-2xl font-display font-bold mb-4 mt-8">Changes to This Policy</h2>
            <p className="text-gray-700 mb-6">
              We may update this privacy policy from time to time. We will notify you of any changes by posting 
              the new policy on this page and updating the "Last updated" date.
            </p>

            <h2 className="text-2xl font-display font-bold mb-4 mt-8">Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this privacy policy, please contact us at{' '}
              <a href="mailto:privacy@blog.com" className="text-[#8B1E1E] hover:text-[#C74D4D] font-medium">
                privacy@blog.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
