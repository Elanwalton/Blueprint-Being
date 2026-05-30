'use client';

import { useState } from 'react';
import { FiMail, FiMapPin, FiPhone, FiSend } from 'react-icons/fi';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Header */}
      <section className="relative bg-gradient-to-br from-[#8B1E1E] via-[#A73030] to-[#C74D4D] text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm">
            <FiMail className="w-10 h-10" />
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-white/90">
            Have a question or feedback? We'd love to hear from you
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <div className="card-premium p-6 text-center animate-fadeIn">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#8B1E1E] to-[#C74D4D] rounded-xl mb-4">
              <FiMail className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-display font-bold text-gray-900 mb-2">Email Us</h3>
            <p className="text-gray-600">hello@blog.com</p>
          </div>

          <div className="card-premium p-6 text-center animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#8B1E1E] to-[#C74D4D] rounded-xl mb-4">
              <FiMapPin className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-display font-bold text-gray-900 mb-2">Visit Us</h3>
            <p className="text-gray-600">Nairobi, Kenya</p>
          </div>

          <div className="card-premium p-6 text-center animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#8B1E1E] to-[#C74D4D] rounded-xl mb-4">
              <FiPhone className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-display font-bold text-gray-900 mb-2">Call Us</h3>
            <p className="text-gray-600">+254 XXX XXX XXX</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass-strong rounded-3xl p-8 md:p-12">
          {submitted ? (
            <div className="text-center py-12 animate-fadeIn">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-6">
                <FiSend className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-display font-bold text-gray-900 mb-4">Message Sent!</h3>
              <p className="text-gray-600 mb-6">
                Thank you for reaching out. We'll get back to you as soon as possible.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] text-white hover:shadow-xl hover:shadow-[#8B1E1E]/30 transition-all duration-300 font-medium transform hover:-translate-y-0.5"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-6 text-center">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="pato boy wa mamaa"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="input-field resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-4 rounded-lg bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] text-white hover:shadow-2xl hover:shadow-[#8B1E1E]/40 transition-all duration-300 font-medium transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <span>{loading ? 'Sending...' : 'Send Message'}</span>
                  <FiSend className="w-5 h-5" />
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
