'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiSearch, FiUser, FiLogOut, FiEdit, FiHome,
  FiBookOpen, FiGrid, FiInfo, FiArrowRight, FiX,
} from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { name: 'Home',       path: '/',           icon: <FiHome /> },
  { name: 'Blog',       path: '/blog',        icon: <FiBookOpen /> },
  { name: 'Categories', path: '/categories',  icon: <FiGrid /> },
  { name: 'About',      path: '/about',       icon: <FiInfo /> },
];

export default function Navbar() {
  const [isOpen, setIsOpen]       = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser]           = useState<any>(null);
  const [dropOpen, setDropOpen]   = useState(false);
  const pathname = usePathname();
  const dropRef  = useRef<HTMLDivElement>(null);

  /* ── scroll listener ── */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── user from localStorage ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  /* ── close dropdown when clicking outside ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── lock body scroll when sidebar open ── */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsOpen(false);
    window.location.href = '/';
  };

  /* ─────────────────────────────────────────
     FLOATING PILL SHAPE & GLASSMORPHISM
  ───────────────────────────────────────── */
  const navBase = [
    'fixed z-50 transition-all duration-500',
    /* floating pill geometry */
    isScrolled
      ? 'top-3 left-3 right-3 rounded-2xl'
      : 'top-4 left-4 right-4 rounded-3xl',
    /* glass bg */
    isScrolled
      ? 'bg-white/90 dark:bg-[#000B18]/95 shadow-2xl shadow-black/10 dark:shadow-black/40 border border-slate-200/80 dark:border-cyan-900/40'
      : 'bg-white/70 dark:bg-[#000B18]/75 border border-white/40 dark:border-white/10',
    'backdrop-blur-xl',
  ].join(' ');

  return (
    <>
      {/* ═══════════════ NAVBAR PILL ═══════════════ */}
      <nav className={navBase} aria-label="Main navigation">
        {/* Cyan glow underline on scroll */}
        {isScrolled && (
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-[15%] right-[15%] h-px rounded-full
                       bg-gradient-to-r from-transparent via-[#00b4d8]/50 to-transparent"
          />
        )}

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-[72px]'}`}>

            {/* ── LOGO + BRAND BLOCK ── */}
            <Link href="/" className="flex items-center gap-3 group shrink-0" aria-label="Blueprint Being home">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00b4d8] to-[#0077b6]
                              flex items-center justify-center shadow-lg shadow-[#00b4d8]/30
                              group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
                <span className="text-white font-black text-lg select-none">B</span>
              </div>
              <div className="hidden sm:flex flex-col justify-center leading-none">
                <span className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight
                                 group-hover:text-[#00b4d8] dark:group-hover:text-[#00E5FF] transition-colors duration-300">
                  Blueprint Being
                </span>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium tracking-widest uppercase mt-0.5">
                  Ideas · Stories · Growth
                </span>
              </div>
            </Link>

            {/* ── DESKTOP NAV LINKS ── */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={[
                      'relative px-4 py-2 rounded-xl text-[14px] font-semibold transition-all duration-300 group',
                      active
                        ? 'text-[#00b4d8] dark:text-[#00E5FF] bg-[#00b4d8]/10 dark:bg-[#00b4d8]/15'
                        : 'text-slate-600 dark:text-slate-300 hover:text-[#00b4d8] dark:hover:text-[#00E5FF] hover:bg-[#00b4d8]/8 dark:hover:bg-[#00b4d8]/10',
                    ].join(' ')}
                  >
                    {link.name}
                    {/* active dot */}
                    {active && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00b4d8] dark:bg-[#00E5FF]" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* ── DESKTOP RIGHT CONTROLS ── */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Search */}
              <Link
                href="/search"
                aria-label="Search"
                className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400
                           hover:text-[#00b4d8] dark:hover:text-[#00E5FF]
                           hover:bg-[#00b4d8]/10 dark:hover:bg-[#00b4d8]/15
                           transition-all duration-300 hover:scale-110"
              >
                <FiSearch className="w-5 h-5" />
              </Link>

              {/* Theme toggle */}
              <ThemeToggle />

              {user ? (
                /* ── USER AVATAR + DROPDOWN ── */
                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => setDropOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl
                               hover:bg-[#00b4d8]/10 dark:hover:bg-[#00b4d8]/15 transition-all duration-200"
                    aria-expanded={dropOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00b4d8] to-[#0077b6]
                                    flex items-center justify-center shadow text-white text-sm font-bold">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 max-w-[80px] truncate">
                      {user.username}
                    </span>
                  </button>

                  {/* Dropdown */}
                  {dropOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-gray-100 dark:border-gray-800
                                    bg-white dark:bg-[#0a1628] shadow-2xl shadow-black/10 dark:shadow-black/40
                                    overflow-hidden animate-fadeIn z-50">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Signed in as</p>
                        <p className="text-sm font-bold text-gray-800 dark:text-white truncate mt-0.5">{user.username}</p>
                      </div>
                      <div className="py-1.5">
                        {(user.role === 'admin' || user.role === 'author') && (
                          <Link href="/dashboard" onClick={() => setDropOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300
                                       hover:bg-[#00b4d8]/10 dark:hover:bg-[#00b4d8]/15 hover:text-[#00b4d8] dark:hover:text-[#00E5FF] transition-colors">
                            <FiEdit className="w-4 h-4" /> Dashboard
                          </Link>
                        )}
                        <Link href="/profile" onClick={() => setDropOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300
                                     hover:bg-[#00b4d8]/10 dark:hover:bg-[#00b4d8]/15 hover:text-[#00b4d8] dark:hover:text-[#00E5FF] transition-colors">
                          <FiUser className="w-4 h-4" /> Profile
                        </Link>
                        <button onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500
                                     hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left">
                          <FiLogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* ── AUTH BUTTONS ── */
                <div className="flex items-center gap-2 ml-1">
                  <Link href="/login"
                    className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300
                               hover:text-[#00b4d8] dark:hover:text-[#00E5FF] transition-colors duration-200">
                    Login
                  </Link>
                  <Link href="/register"
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold text-white
                               bg-gradient-to-r from-[#00b4d8] to-[#0077b6]
                               hover:shadow-lg hover:shadow-[#00b4d8]/40 hover:-translate-y-0.5 hover:scale-105
                               transition-all duration-300">
                    Get Started <FiArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>

            {/* ── MOBILE RIGHT: THEME + HAMBURGER ── */}
            <div className="flex lg:hidden items-center gap-2">
              <ThemeToggle />
              <button
                id="mobile-menu-btn"
                onClick={() => setIsOpen((v) => !v)}
                aria-expanded={isOpen}
                aria-controls="mobile-sidebar"
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                className={[
                  'relative w-11 h-11 rounded-xl border-2 transition-all duration-350',
                  'flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00b4d8]',
                  isOpen
                    ? 'bg-[#00b4d8]/15 border-[#00b4d8] dark:border-[#00E5FF]'
                    : 'bg-[#00b4d8]/8 border-[#00b4d8]/20 dark:border-[#00b4d8]/30 hover:bg-[#00b4d8]/15 hover:border-[#00b4d8]/40',
                ].join(' ')}
              >
                {/* Animated three-line hamburger → X */}
                <span className="absolute w-5 h-[2px] rounded-full bg-[#00b4d8] dark:bg-[#00E5FF]
                                 transition-all duration-350 origin-center"
                      style={{ transform: isOpen ? 'translateY(0) rotate(45deg)' : 'translateY(-6px)' }} />
                <span className="absolute w-5 h-[2px] rounded-full bg-[#00b4d8] dark:bg-[#00E5FF]
                                 transition-all duration-350"
                      style={{ opacity: isOpen ? 0 : 1, transform: isOpen ? 'scaleX(0)' : 'scaleX(1)' }} />
                <span className="absolute w-5 h-[2px] rounded-full bg-[#00b4d8] dark:bg-[#00E5FF]
                                 transition-all duration-350 origin-center"
                      style={{ transform: isOpen ? 'translateY(0) rotate(-45deg)' : 'translateY(6px)' }} />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* ═══════════════ MOBILE OVERLAY ═══════════════ */}
      {isOpen && (
        <div
          aria-hidden
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fadeIn lg:hidden"
        />
      )}

      {/* ═══════════════ MOBILE SIDEBAR ═══════════════ */}
      <aside
        id="mobile-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={[
          'fixed top-0 right-0 z-50 h-full w-[320px] max-w-[85vw] lg:hidden',
          'bg-white dark:bg-[#04101f]',
          'shadow-2xl shadow-black/20 dark:shadow-black/60',
          'transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00b4d8] to-[#0077b6]
                            flex items-center justify-center shadow text-white font-black text-base">
              B
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-bold text-gray-900 dark:text-white">Blueprint Being</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">Ideas · Stories · Growth</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                       hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar nav links */}
        <nav className="px-4 pt-4 flex flex-col gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={[
                  'flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-semibold',
                  'transition-all duration-300 group',
                  active
                    ? 'bg-[#00b4d8]/12 dark:bg-[#00b4d8]/15 text-[#00b4d8] dark:text-[#00E5FF]'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-[#00b4d8]/8 dark:hover:bg-[#00b4d8]/12 hover:text-[#00b4d8] dark:hover:text-[#00E5FF] hover:translate-x-1',
                ].join(' ')}
              >
                <span className={`text-xl transition-transform duration-300 ${active ? 'text-[#00b4d8] dark:text-[#00E5FF]' : 'text-[#00b4d8]/60 dark:text-[#00b4d8]/50 group-hover:scale-115'}`}>
                  {link.icon}
                </span>
                {link.name}
                {active && <span className="ml-auto w-2 h-2 rounded-full bg-[#00b4d8] dark:bg-[#00E5FF]" />}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 mt-4 border-t border-gray-100 dark:border-gray-800" />

        {/* Sidebar user/auth section */}
        <div className="px-4 pt-4 flex flex-col gap-2">
          {user ? (
            <>
              {/* User info */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#0a1628]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00b4d8] to-[#0077b6]
                                flex items-center justify-center shadow text-white font-bold text-base shrink-0">
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{user.username}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>

              {(user.role === 'admin' || user.role === 'author') && (
                <Link href="/dashboard" onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-semibold text-slate-600 dark:text-slate-300
                             hover:bg-[#00b4d8]/8 dark:hover:bg-[#00b4d8]/12 hover:text-[#00b4d8] dark:hover:text-[#00E5FF] transition-all duration-300 hover:translate-x-1">
                  <FiEdit className="text-xl text-[#00b4d8]/60 dark:text-[#00b4d8]/50" /> Dashboard
                </Link>
              )}
              <Link href="/profile" onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-semibold text-slate-600 dark:text-slate-300
                           hover:bg-[#00b4d8]/8 dark:hover:bg-[#00b4d8]/12 hover:text-[#00b4d8] dark:hover:text-[#00E5FF] transition-all duration-300 hover:translate-x-1">
                <FiUser className="text-xl text-[#00b4d8]/60 dark:text-[#00b4d8]/50" /> Profile
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-semibold text-red-500
                           hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:translate-x-1 w-full text-left">
                <FiLogOut className="text-xl" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border-2 border-[#00b4d8]/30 dark:border-[#00b4d8]/40
                           text-[15px] font-bold text-[#00b4d8] dark:text-[#00E5FF] hover:bg-[#00b4d8]/10 transition-all duration-300">
                Login
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl
                           bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white text-[15px] font-bold
                           hover:shadow-xl hover:shadow-[#00b4d8]/40 hover:-translate-y-0.5
                           transition-all duration-300">
                Get Started <FiArrowRight />
              </Link>
            </>
          )}
        </div>

        {/* Sidebar search */}
        <div className="px-4 mt-4">
          <Link href="/search" onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-[#0a1628]
                       text-gray-400 dark:text-gray-500 hover:text-[#00b4d8] dark:hover:text-[#00E5FF]
                       hover:bg-[#00b4d8]/10 dark:hover:bg-[#00b4d8]/12 transition-all duration-300 text-sm font-medium">
            <FiSearch className="w-4 h-4 shrink-0" />
            <span>Search articles…</span>
          </Link>
        </div>

        {/* Bottom brand strip */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-5 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
            © {new Date().getFullYear()} Blueprint Being
          </p>
        </div>
      </aside>
    </>
  );
}
