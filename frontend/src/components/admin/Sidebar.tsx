'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiFileText, FiMessageCircle, FiMail, FiBarChart2, FiLogOut, FiUser, FiTrash2 } from 'react-icons/fi';

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>('');
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUserRole(u.role);
        setUsername(u.username || u.email || '');
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: FiHome, roles: ['admin', 'author', 'editor', 'contributor'] },
    { name: 'Posts', href: '/admin/posts', icon: FiFileText, roles: ['admin', 'author', 'editor', 'contributor'] },
    { name: 'Media', href: '/admin/media', icon: require('react-icons/fi').FiImage, roles: ['admin', 'author', 'editor', 'contributor'] },
    { name: 'Trash', href: '/admin/posts/trash', icon: FiTrash2, roles: ['admin', 'editor', 'author'] },
    { name: 'Comments', href: '/admin/comments', icon: FiMessageCircle, roles: ['admin', 'editor'] },
    { name: 'Subscribers', href: '/admin/subscribers', icon: FiMail, roles: ['admin', 'editor'] },
    { name: 'Users', href: '/admin/users', icon: FiUser, roles: ['admin', 'editor'] },
    { name: 'Analytics', href: '/admin/analytics', icon: FiBarChart2, roles: ['admin'] },
  ];

  const roleLabel: Record<string, string> = {
    admin: 'Administrator',
    editor: 'Editor',
    author: 'Author',
    contributor: 'Contributor',
    subscriber: 'Subscriber',
  };

  return (
    <aside className="w-64 bg-white dark:bg-[#000B18] border-r border-gray-200 dark:border-gray-800 min-h-screen flex flex-col transition-colors duration-300">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00b4d8] to-[#0077b6]" />
          <span className="text-xl font-display font-bold bg-gradient-to-r from-[#00b4d8] to-[#0077b6] bg-clip-text text-transparent">
            Admin Panel
          </span>
        </Link>
        {username && (
          <div className="mt-3 flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00b4d8] to-[#0077b6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {username[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{roleLabel[userRole] ?? userRole}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          if (userRole && !item.roles.includes(userRole)) return null;
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#0f2040]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-full"
        >
          <FiLogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
