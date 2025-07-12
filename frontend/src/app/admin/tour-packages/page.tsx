'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import api, { endpoints } from '../../../lib/api';
import Link from 'next/link';
import Image from 'next/image';

interface TourPackage {
  _id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  imageUrl: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TourPackagesAdmin() {
  const { user } = useAuth();
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Quick auth check
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    console.log('Auth Check - Token:', token ? 'Present' : 'Missing');
    console.log('Auth Check - User:', userData ? JSON.parse(userData) : 'Missing');
    console.log('Auth Check - User from context:', user);
  }, [user]);

  // Helper function to validate image URLs
  const isValidImageUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      // Check if it's a valid domain configured in next.config.ts
      const allowedDomains = [
        'images.unsplash.com',
        'via.placeholder.com',
        'encrypted-tbn3.gstatic.com',
        'localhost'
      ];
      
      // Check if the hostname is in allowed domains or matches AWS pattern
      return allowedDomains.includes(urlObj.hostname) || 
             urlObj.hostname.endsWith('.amazonaws.com') ||
             // Allow direct image URLs from common image hosting services
             urlObj.hostname.includes('unsplash.com') ||
             urlObj.hostname.includes('placeholder.com');
    } catch {
      return false;
    }
  };

  useEffect(() => {
    fetchTourPackages();
  }, []);

  // Refetch data when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchTourPackages();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchTourPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(endpoints.tourPackages.admin.all);
      setTourPackages(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tour packages:', error);
      setError('Failed to fetch tour packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (packageId: string, currentStatus: boolean) => {
    try {
      console.log('Toggling publish for package:', packageId);
      console.log('Current status:', currentStatus);
      console.log('Auth token:', localStorage.getItem('authToken') ? 'Present' : 'Missing');
      
      const endpoint = endpoints.tourPackages.admin.togglePublish(packageId);
      console.log('Calling endpoint:', endpoint);
      console.log('Full URL:', `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}${endpoint}`);
      
      const response = await api.patch(endpoint);
      console.log('Toggle response:', response.data);
      
      // Update the local state
      setTourPackages(prevPackages =>
        prevPackages.map(pkg =>
          pkg._id === packageId ? { ...pkg, isPublished: !currentStatus } : pkg
        )
      );
      
      alert(`Package ${!currentStatus ? 'published' : 'unpublished'} successfully!`);
    } catch (error: unknown) {
      console.error('Error toggling publish status:', error);
      
      // Type-safe error handling
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown; status?: number } };
        console.error('Error response:', axiosError.response?.data);
        console.error('Error status:', axiosError.response?.status);
      }
      
      // More detailed error message
      let errorMessage = 'Failed to update package status';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { error?: string } } };
        if (axiosError.response?.status === 401) {
          errorMessage = 'Authentication required. Please login again.';
        } else if (axiosError.response?.status === 403) {
          errorMessage = 'Access denied. Admin privileges required.';
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        }
      }
      
      alert(errorMessage);
    }
  };

  const handleDelete = async (packageId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        await api.delete(endpoints.tourPackages.admin.delete(packageId));
        setTourPackages(prevPackages => prevPackages.filter(pkg => pkg._id !== packageId));
      } catch (error) {
        console.error('Error deleting package:', error);
        alert('Failed to delete package');
      }
    }
  };

  const filteredPackages = tourPackages.filter(pkg => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'published' && pkg.isPublished) ||
                         (filterStatus === 'draft' && !pkg.isPublished);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchTourPackages}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tour Packages</h1>
          <p className="mt-1 text-gray-600">Manage your travel packages and itineraries</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={fetchTourPackages}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link
            href="/admin/tour-packages/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Package
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search packages
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by title or description..."
              />
            </div>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by status
            </label>
            <select
              id="status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'draft')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All packages</option>
              <option value="published">Published only</option>
              <option value="draft">Drafts only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-gray-900">{tourPackages.length}</div>
          <div className="text-sm text-gray-500">Total Packages</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-green-600">{tourPackages.filter(p => p.isPublished).length}</div>
          <div className="text-sm text-gray-500">Published</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-yellow-600">{tourPackages.filter(p => !p.isPublished).length}</div>
          <div className="text-sm text-gray-500">Drafts</div>
        </div>
      </div>

      {/* Packages List */}
      {filteredPackages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first tour package.'
            }
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <Link
              href="/admin/tour-packages/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              Create Your First Package
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredPackages.map((pkg) => (
              <div key={pkg._id} className="p-6" data-package-id={pkg._id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                        {pkg.imageUrl && isValidImageUrl(pkg.imageUrl) ? (
                          <Image
                            src={pkg.imageUrl}
                            alt={pkg.title}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Hide the image if it fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{pkg.title}</h3>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            pkg.isPublished 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {pkg.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{pkg.description}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span className="font-medium text-blue-600">${pkg.price}</span>
                        <span>{pkg.duration}</span>
                        <span>Updated {new Date(pkg.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      href={`/admin/tour-packages/preview/${pkg._id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Preview
                    </Link>
                    <Link
                      href={`/admin/tour-packages/edit/${pkg._id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleTogglePublish(pkg._id, pkg.isPublished)}
                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        pkg.isPublished
                          ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:ring-yellow-500'
                          : 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500'
                      }`}
                    >
                      {pkg.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    {user?.role === 'super-admin' && (
                      <button
                        onClick={() => handleDelete(pkg._id, pkg.title)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
