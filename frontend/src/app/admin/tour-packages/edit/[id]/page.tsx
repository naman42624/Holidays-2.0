'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api, { endpoints } from '@/lib/api';
import { Activity, TourPackage, TourPackageFormData } from '@/types/tourPackage';

interface EditTourPackageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditTourPackage({ params }: EditTourPackageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TourPackageFormData>({
    title: '',
    description: '',
    price: 0,
    duration: '',
    imageUrl: '',
    activities: []
  });
  const [newActivity, setNewActivity] = useState<Activity>({
    name: '',
    description: '',
    duration: '',
    included: true
  });
  const [packageStatus, setPackageStatus] = useState({
    isPublished: false,
    createdAt: '',
    updatedAt: ''
  });

  const fetchTourPackage = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(endpoints.tourPackages.admin.details(id));

      if (response.data && response.data.success) {
        const tourPackage: TourPackage = response.data.data;
        
        setFormData({
          title: tourPackage.title,
          description: tourPackage.description,
          price: tourPackage.price,
          duration: tourPackage.duration,
          imageUrl: tourPackage.imageUrl,
          activities: tourPackage.activities || []
        });

        setPackageStatus({
          isPublished: tourPackage.isPublished,
          createdAt: new Date(tourPackage.createdAt).toLocaleDateString(),
          updatedAt: new Date(tourPackage.updatedAt).toLocaleDateString()
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch tour package');
      }
    } catch (err: unknown) {
      console.error('Error fetching tour package:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading the tour package');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTourPackage();
  }, [fetchTourPackage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleActivityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setNewActivity({ ...newActivity, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setNewActivity({ ...newActivity, [name]: value });
    }
  };

  const addActivity = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate activity form
    if (!newActivity.name || !newActivity.description || !newActivity.duration) {
      setError('Please fill in all activity fields');
      return;
    }
    
    setFormData({
      ...formData,
      activities: [...formData.activities, { ...newActivity }]
    });
    
    // Reset activity form
    setNewActivity({
      name: '',
      description: '',
      duration: '',
      included: true
    });
    
    setError(null);
  };

  const removeActivity = (index: number) => {
    const updatedActivities = [...formData.activities];
    updatedActivities.splice(index, 1);
    setFormData({ ...formData, activities: updatedActivities });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate form data
      if (!formData.title || !formData.description || formData.price <= 0 || !formData.duration || !formData.imageUrl) {
        throw new Error('Please fill in all required fields');
      }
      
      const response = await api.put(endpoints.tourPackages.admin.update(id), formData);
      
      if (response.data && response.data.success) {
        router.push('/admin/tour-packages');
      } else {
        throw new Error(response.data.message || 'Failed to update tour package');
      }
    } catch (err: unknown) {
      console.error('Error updating tour package:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the tour package';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePublishStatus = async () => {
    try {
      const response = await api.patch(endpoints.tourPackages.admin.togglePublish(id));
      
      if (response.data && response.data.success) {
        setPackageStatus({
          ...packageStatus,
          isPublished: !packageStatus.isPublished
        });
      } else {
        throw new Error(response.data.message || 'Failed to toggle publish status');
      }
    } catch (err: unknown) {
      console.error('Error toggling publish status:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating the publish status';
      setError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Tour Package</h1>
          <Link
            href="/admin/tour-packages"
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Back to List
          </Link>
        </div>
        <p className="text-gray-600 mt-2">Edit tour package information</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">Status</span>
            <div className="flex items-center mt-1">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                packageStatus.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {packageStatus.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={togglePublishStatus}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
              packageStatus.isPublished 
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {packageStatus.isPublished ? 'Unpublish' : 'Publish'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <span className="text-gray-500">Created</span>
            <p>{packageStatus.createdAt}</p>
          </div>
          <div>
            <span className="text-gray-500">Last Updated</span>
            <p>{packageStatus.updatedAt}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Package Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter package title"
              />
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (INR) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the tour package"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration *
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 7 days / 6 nights"
              />
            </div>
            
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL *
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                required
                className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Preview image if available */}
          {formData.imageUrl && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image Preview</label>
              <div className="overflow-hidden rounded-md bg-gray-50 border border-gray-200">
                <Image 
                  src={formData.imageUrl} 
                  alt="Package preview" 
                  width={400}
                  height={300}
                  className="h-48 w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                  }}
                />
              </div>
            </div>
          )}

          {/* Activities Section */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Activities</h2>
            
            {formData.activities.length > 0 ? (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Added Activities</h3>
                <div className="space-y-3">
                  {formData.activities.map((activity, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">{activity.name}</p>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <div className="flex items-center mt-1 space-x-4 text-xs">
                          <span className="text-gray-600">Duration: {activity.duration}</span>
                          <span className={activity.included ? 'text-green-600' : 'text-gray-600'}>
                            {activity.included ? 'Included' : 'Not included'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeActivity(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <span className="sr-only">Remove</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">No activities added yet</p>
            )}
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Activity</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="activityName" className="block text-xs font-medium text-gray-700 mb-1">
                    Activity Name
                  </label>
                  <input
                    type="text"
                    id="activityName"
                    name="name"
                    value={newActivity.name}
                    onChange={handleActivityChange}
                    className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter activity name"
                  />
                </div>
                
                <div>
                  <label htmlFor="activityDescription" className="block text-xs font-medium text-gray-700 mb-1">
                    Activity Description
                  </label>
                  <textarea
                    id="activityDescription"
                    name="description"
                    value={newActivity.description}
                    onChange={handleActivityChange}
                    rows={2}
                    className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Describe the activity"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="activityDuration" className="block text-xs font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      id="activityDuration"
                      name="duration"
                      value={newActivity.duration}
                      onChange={handleActivityChange}
                      className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="e.g., 2 hours"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <div className="flex items-center h-10 ml-2">
                      <input
                        type="checkbox"
                        id="activityIncluded"
                        name="included"
                        checked={newActivity.included}
                        onChange={handleActivityChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="activityIncluded" className="ml-2 block text-sm text-gray-700">
                        Included in package
                      </label>
                    </div>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={addActivity}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Activity
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <Link
            href="/admin/tour-packages"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </Link>
          <Link
            href={`/admin/tour-packages/preview/${id}`}
            className="inline-flex items-center px-4 py-2 border border-purple-500 shadow-sm text-sm font-medium rounded-md text-purple-500 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            Preview
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
