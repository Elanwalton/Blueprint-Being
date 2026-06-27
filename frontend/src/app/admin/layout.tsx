'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { auth } from '@/lib/firebase';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication using Firebase Auth
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        router.replace('/login');
        return;
      }

      // Check role from localStorage (stored during login/register)
      // Alternatively we could fetch it from our /api/auth/me endpoint here to be safe
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        router.replace('/login');
        return;
      }

      try {
        const user = JSON.parse(userStr);
        if (user.role !== 'admin' && user.role !== 'editor' && user.role !== 'author') {
          router.replace('/');
          return;
        }
        setLoading(false);
      } catch (err) {
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#000B18]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b4d8]"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] dark:bg-[#000B18] text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
