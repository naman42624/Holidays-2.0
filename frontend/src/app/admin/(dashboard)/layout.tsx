'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading: isLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Redirect to simple admin login page
        router.push('/simple-admin-login');
      } else if (!['admin', 'super-admin', 'website-editor'].includes(user.role)) {
        // User is logged in but doesn't have admin permissions
        console.log('Unauthorized access attempt:', user.role);
        router.push('/');
      } else {
        console.log('Admin authorized:', user.role);
        setIsAuthorized(true);
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="bg-gray-800 text-white w-full md:w-64 md:min-h-screen p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <p className="text-gray-300 text-sm">Welcome, {user?.firstName}</p>
          <p className="text-gray-400 text-xs capitalize">Role: {user?.role}</p>
        </div>

        <nav className="space-y-2">
          <Link
            href="/admin/dashboard"
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
          >
            Dashboard
          </Link>

          <div className="py-2">
            <p className="px-4 text-xs text-gray-400 uppercase font-semibold mb-2">Content Management</p>
            <Link
              href="/admin/tour-packages"
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
            >
              Tour Packages
            </Link>
          </div>

          {(user?.role === 'admin' || user?.role === 'super-admin') && (
            <div className="py-2">
              <p className="px-4 text-xs text-gray-400 uppercase font-semibold mb-2">Administration</p>
              {user?.role === 'super-admin' && (
                <Link
                  href="/admin/users"
                  className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
                >
                  User Management
                </Link>
              )}
              <Link
                href="/admin/settings"
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
              >
                Settings
              </Link>
            </div>
          )}
        </nav>

        <div className="absolute bottom-4 left-4 md:static md:mt-8">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-white"
          >
            Return to Website
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-grow p-4 md:p-8 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
