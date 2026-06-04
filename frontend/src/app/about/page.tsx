'use client';

import { FiMail, FiMapPin, FiPhone, FiSend } from 'react-icons/fi';
import { useState } from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-8 pb-16 bg-[var(--background)]">
      {/* ── HERO ── */}
      <section className="
        relative overflow-hidden
        mx-4 sm:mx-6 lg:mx-8
        rounded-3xl
        bg-gradient-to-br from-[#00b4d8] via-[#0096c7] to-[#0077b6]
        text-white py-20 px-4
        shadow-2xl shadow-[#00b4d8]/20 dark:shadow-[#000B18]/60
        border border-[#00b4d8]/20 dark:border-cyan-800/40
      ">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-60 h-60 bg-[#ffffff] rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#ffffff] rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Inner text card */}
          <div className="mx-auto max-w-xl bg-white/90 dark:bg-[#000B18]/70 backdrop-blur-md rounded-2xl px-8 py-8 border border-white/20 dark:border-white/10 shadow-2xl">
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-4 text-gray-900 dark:text-white">
              About Us
            </h1>
            <p className="text-xl text-gray-600 dark:text-white/85 leading-relaxed">
              Sharing stories, insights, and ideas that inspire and inform
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="glass-strong rounded-3xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="prose prose-lg max-w-none space-y-4 text-gray-700">
            <p>
              Welcome to our blog, where passion meets purpose. We started this journey with a simple mission: 
              to create a space where ideas flourish, knowledge is shared, and communities are built.
            </p>
            <p>
              Our team of dedicated writers and contributors brings diverse perspectives from health, 
              lifestyle, business, and beyond. We believe in the power of storytelling to educate, inspire, 
              and connect people across the globe.
            </p>
            <p>
              Every article we publish is crafted with care, backed by research, and designed to provide 
              real value to our readers. Whether you're here to learn something new, find inspiration, or 
              simply enjoy a good read, we're glad you're here.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { title: 'Quality Content', description: 'Every article is thoroughly researched and expertly written', icon: '✍️' },
            { title: 'Community First', description: 'We value our readers and foster meaningful discussions', icon: '🤝' },
            { title: 'Innovation', description: 'Staying ahead with the latest trends and insights', icon: '💡' },
          ].map((value, index) => (
            <div key={index} className="card-premium p-6 text-center animate-fadeIn" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="text-4xl mb-4">{value.icon}</div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>

        {/* Team Section */}
        <div className="glass-strong rounded-3xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-8 text-center">Meet the Team</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { name: 'Carson A.', role: 'Founder & Editor', bio: 'Passionate about health and storytelling' },
              { name: 'Neema', role: 'Content Strategist', bio: 'Bringing creative ideas to life' },
            ].map((member, index) => (
              <div key={index} className="flex items-start space-x-4 animate-fadeIn" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00b4d8] to-[#0077b6] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl font-bold">{member.name[0]}</span>
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-gray-900">{member.name}</h3>
                  <p className="text-[#00b4d8] text-sm mb-2">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="glass-strong rounded-3xl p-8 md:p-12">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-6 text-center">Get in Touch</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#00b4d8] to-[#0077b6] rounded-xl mb-3">
                <FiMail className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Email</h3>
              <p className="text-gray-600 text-sm">hello@blog.com</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#00b4d8] to-[#0077b6] rounded-xl mb-3">
                <FiMapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Location</h3>
              <p className="text-gray-600 text-sm">Nairobi, Kenya</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#00b4d8] to-[#0077b6] rounded-xl mb-3">
                <FiSend className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Social</h3>
              <p className="text-gray-600 text-sm">@modernblog</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
