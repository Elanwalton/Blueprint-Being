'use client';

import { useState } from 'react';
import { FiShare2, FiCopy, FiCheck, FiTwitter, FiFacebook, FiLink } from 'react-icons/fi';

interface ShareButtonProps {
  title: string;
  url?: string;
}

export default function ShareButton({ title, url }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch (_) {}
    }
    setOpen(!open);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platforms = [
    {
      name: 'Twitter / X',
      icon: FiTwitter,
      color: 'hover:bg-black hover:text-white',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: 'Facebook',
      icon: FiFacebook,
      color: 'hover:bg-[#1877f2] hover:text-white',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'WhatsApp',
      icon: FiLink,
      color: 'hover:bg-[#25d366] hover:text-white',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: 'LinkedIn',
      icon: FiLink,
      color: 'hover:bg-[#0077b5] hover:text-white',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  return (
    <div className="relative inline-block">
      <button
        onClick={handleShare}
        className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:border-[#00b4d8] hover:text-[#00b4d8] transition-all font-medium text-sm"
      >
        <FiShare2 className="w-4 h-4" />
        <span>Share</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fadeIn">
          {/* Copy Link */}
          <button
            onClick={handleCopy}
            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {copied ? <FiCheck className="w-4 h-4 text-green-500" /> : <FiCopy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>

          <div className="border-t border-gray-100" />

          {platforms.map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className={`flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 transition-colors ${p.color}`}
            >
              <p.icon className="w-4 h-4" />
              <span>{p.name}</span>
            </a>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
