'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiSearch, FiUser, FiLogOut, FiEdit } from 'react-icons/fi';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Check for user in localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: 'Categories', path: '/categories' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'glass-strong shadow-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#8B1E1E] to-[#C74D4D] rounded-lg flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] bg-clip-text text-transparent hidden sm:block">
              Blueprint Being
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`relative font-medium transition-all duration-300 group ${
                  pathname === link.path
                    ? 'text-[#8B1E1E]'
                    : 'text-gray-700 hover:text-[#8B1E1E]'
                }`}
              >
                {link.name}
                <span
                  className={`absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] transform origin-left transition-all duration-300 ${
                    pathname === link.path ? 'scale-x-100 shadow-lg shadow-[#8B1E1E]/50' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/search"
              className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-110"
            >
              <FiSearch className="w-5 h-5 text-gray-700" />
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                {(user.role === 'admin' || user.role === 'author') && (
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] text-white hover:shadow-xl hover:shadow-[#8B1E1E]/30 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <FiEdit className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B1E1E] to-[#C74D4D] flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300">
                      <span className="text-white text-sm font-medium">
                        {user.username[0].toUpperCase()}
                      </span>
                    </div>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <FiUser className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left text-red-600"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-gray-700 hover:text-[#8B1E1E] hover:bg-gray-100 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] text-white hover:shadow-2xl hover:shadow-[#8B1E1E]/30 transition-all duration-300 font-medium transform hover:-translate-y-1 hover:scale-105"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isOpen ? (
              <FiX className="w-6 h-6 text-gray-700" />
            ) : (
              <FiMenu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden glass-strong border-t border-gray-100 shadow-xl animate-slideIn">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  pathname === link.path
                    ? 'bg-[#8B1E1E] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                {(user.role === 'admin' || user.role === 'author') && (
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 rounded-lg bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="block px-4 py-2 rounded-lg hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-2 rounded-lg hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 rounded-lg bg-gradient-to-r from-[#8B1E1E] to-[#C74D4D] text-white text-center shadow-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
