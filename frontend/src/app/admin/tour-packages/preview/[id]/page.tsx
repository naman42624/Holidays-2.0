'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api, { endpoints } from '@/lib/api';
import { TourPackage } from '@/types/tourPackage';

interface PreviewTourPackageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PreviewTourPackage({ params }: PreviewTourPackageProps) {
  const { id } = use(params);
  const [tourPackage, setTourPackage] = useState<TourPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTourPackage = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(endpoints.tourPackages.admin.details(id));

      if (response.data && response.data.success) {
        setTourPackage(response.data.data);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch tour package');
      }
    } catch (err: unknown) {
      console.error('Error fetching tour package:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tour package details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTourPackage();
  }, [fetchTourPackage]);

  const handleTogglePublish = async () => {
    if (!tourPackage) return;

    try {
      const response = await api.patch(endpoints.tourPackages.admin.togglePublish(id));
      
      if (response.data && response.data.success) {
        setTourPackage({
          ...tourPackage,
          isPublished: !tourPackage.isPublished
        });
      }
    } catch (err) {
      console.error('Error toggling publish status:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !tourPackage) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">{error || 'Tour package not found'}</p>
          <Link
            href="/admin/tour-packages"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Tour Packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white shadow-sm border-b mb-6">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Preview: {tourPackage.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tourPackage.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {tourPackage.isPublished ? 'Published' : 'Draft'}
              </span>
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={handleTogglePublish}
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm ${
                tourPackage.isPublished
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {tourPackage.isPublished ? 'Unpublish' : 'Publish'}
            </button>
            <Link
              href={`/admin/tour-packages/edit/${id}`}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Edit
            </Link>
            <Link
              href="/admin/tour-packages"
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back
            </Link>
          </div>
        </div>
      </div>

      {/* Preview UI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative w-full h-80">
              <Image 
                src={tourPackage.imageUrl} 
                alt={tourPackage.title} 
                fill
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Image+Not+Available';
                }}
              />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{tourPackage.title}</h2>
              
              <div className="flex items-center mb-6">
                <div className="flex items-center mr-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{tourPackage.duration}</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">₹{tourPackage.price.toLocaleString()} per person</span>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{tourPackage.description}</p>
              </div>
              
              {tourPackage.activities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Activities</h3>
                  <div className="space-y-4">
                    {tourPackage.activities.map((activity, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900">{activity.name}</h4>
                        <p className="text-gray-700 mt-1">{activity.description}</p>
                        <div className="flex items-center justify-between mt-3 text-sm">
                          <span className="text-gray-600">Duration: {activity.duration}</span>
                          <span className={`${activity.included ? 'text-green-600' : 'text-gray-500'}`}>
                            {activity.included ? '✓ Included' : '✗ Not included'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Summary</h3>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{tourPackage.duration}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Activities:</span>
                <span className="font-medium">{tourPackage.activities.length}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${tourPackage.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>
                  {tourPackage.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg text-gray-900">Price per person:</span>
                <span className="text-xl font-bold text-blue-600">₹{tourPackage.price.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                type="button"
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                disabled
              >
                Book Now
              </button>
              <button
                type="button"
                className="w-full py-3 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                disabled
              >
                Contact Us
              </button>
            </div>
            
            <div className="mt-6 text-sm text-center text-gray-500">
              <p>* Preview mode - booking functionality disabled</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="inline-flex rounded-md shadow">
          <Link
            href="/admin/tour-packages"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Tour Packages
          </Link>
        </div>
      </div>
    </div>
  );
}
