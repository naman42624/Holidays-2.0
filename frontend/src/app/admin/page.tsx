'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminRootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to admin login page
        router.push('/admin/login');
      } else if (['admin', 'super-admin', 'website-editor'].includes(user.role)) {
        // Logged in as admin, redirect to dashboard
        router.push('/admin/dashboard');
      } else {
        // Logged in but not admin, redirect to home
        router.push('/');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}
