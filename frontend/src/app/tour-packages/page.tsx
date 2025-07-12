'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import api, { endpoints } from '@/lib/api';
import { TourPackage } from '@/types/tourPackage';
import TourPackage3DCard from '@/components/ui/TourPackage3DCard';

export default function TourPackagesPage() {
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTourPackages();
  }, []);

  const fetchTourPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching tour packages from endpoint:', endpoints.tourPackages.all);
      
      // Only fetch published packages for public display
      const response = await api.get(endpoints.tourPackages.all);
      
      console.log('Tour packages response:', response.data);
      
      if (response.data && response.data.success) {
        setTourPackages(response.data.data);
      } else {
        throw new Error('Failed to fetch tour packages');
      }
    } catch (err: unknown) {
      console.error('Error fetching tour packages:', err);
      const errorMessage = err instanceof Error ? err.message : 'Please try again later.';
      setError(`Failed to load tour packages. ${errorMessage}`);
      
      // Handle case where API might not be running
      if (err instanceof Error && (err.message?.includes('Network Error') || (err as { response?: { status?: number } }).response?.status === 404)) {
        setError('The tour packages API is not available. Please make sure the backend server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = tourPackages.filter(pkg => 
    pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="relative bg-blue-700 overflow-hidden">
        <div className="absolute inset-0">
          <Image 
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" 
            alt="Travel Banner" 
            fill
            className="object-cover opacity-20"
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
            Discover Our Tour Packages
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-blue-100">
            Explore our carefully curated selection of tour packages, designed to provide unforgettable experiences around the world.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="max-w-md mx-auto">
            <div className="relative flex items-center w-full">
              <input
                type="text"
                placeholder="Search tour packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 sm:py-3 pl-10 sm:pl-12 pr-4 border border-gray-300 rounded-full focus:ring-blue-500 focus:border-blue-500 block text-sm sm:text-base"
              />
              <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Something went wrong</h3>
            <p className="mt-2 text-base text-gray-500">{error}</p>
            <button
              onClick={fetchTourPackages}
              className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No tour packages found</h3>
            {searchQuery ? (
              <p className="mt-2 text-base text-gray-500">Try adjusting your search terms</p>
            ) : (
              <p className="mt-2 text-base text-gray-500">Check back later for new offerings</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPackages.map((pkg) => (
              <TourPackage3DCard
                key={pkg._id}
                tourPackage={pkg}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
