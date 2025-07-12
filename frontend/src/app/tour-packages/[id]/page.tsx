'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  ArrowLeft,
  CheckCircle,
  Plane,
  Hotel,
  Camera
} from 'lucide-react';
import api, { endpoints } from '@/lib/api';
import { TourPackage } from '@/types/tourPackage';
import { PageTransition } from '@/components/ui/PageTransition';

interface TourPackageDetailsProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TourPackageDetails({ params }: TourPackageDetailsProps) {
  const { id } = use(params);
  const [tourPackage, setTourPackage] = useState<TourPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const fetchTourPackage = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setImageError(false);
      setImageLoading(true);
      const response = await api.get(endpoints.tourPackages.details(id));

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

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tour package details...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error || !tourPackage) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tour Package Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The tour package you are looking for does not exist.'}</p>
            <Link href="/tour-packages">
              <Button className="inline-flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tour Packages
              </Button>
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!tourPackage.isPublished) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tour Package Not Available</h2>
            <p className="text-gray-600 mb-6">This tour package is currently not available for booking.</p>
            <Link href="/tour-packages">
              <Button className="inline-flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tour Packages
              </Button>
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/tour-packages" className="inline-flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tour Packages
              </Link>
              <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
                Book Now - ₹{tourPackage.price.toLocaleString()}
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative h-96 md:h-[500px] overflow-hidden">
          {!imageError && tourPackage.imageUrl ? (
            <>
              <Image 
                src={tourPackage.imageUrl} 
                alt={tourPackage.title}
                fill
                className="object-cover"
                priority
                onLoad={() => {
                  console.log('Image loaded successfully:', tourPackage.imageUrl);
                  setImageLoading(false);
                }}
                onError={() => {
                  console.log('Image failed to load:', tourPackage.imageUrl);
                  setImageError(true);
                  setImageLoading(false);
                }}
                sizes="100vw"
              />
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="text-gray-500">Loading image...</div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <div className="text-center text-white">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h1 className="text-4xl md:text-5xl font-bold">{tourPackage.title}</h1>
                {imageError && (
                  <p className="text-sm mt-2 opacity-75">Image failed to load: {tourPackage.imageUrl}</p>
                )}
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center space-x-4 mb-4">
                <Badge className="bg-white text-amber-600 font-semibold">
                  {tourPackage.duration}
                </Badge>
                <Badge className="bg-white text-green-600 font-semibold">
                  ₹{tourPackage.price.toLocaleString()}
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                {tourPackage.title}
              </h1>
              <p className="text-xl text-white/90 max-w-2xl">
                {tourPackage.description}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Package Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Package Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-semibold">{tourPackage.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Group Size</p>
                        <p className="font-semibold">2-15 people</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {tourPackage.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* What's Included */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    What&apos;s Included
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Plane className="w-4 h-4 mr-2" />
                        Transportation
                      </h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Round-trip flights</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Airport transfers</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Local transportation</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Hotel className="w-4 h-4 mr-2" />
                        Accommodation
                      </h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>4-star hotels</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Daily breakfast</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Twin sharing rooms</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Booking Card */}
              <Card className="sticky top-24 z-20 bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-center">
                    <span className="text-3xl font-bold text-amber-600">
                      ₹{tourPackage.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">per person</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{tourPackage.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Group Size:</span>
                      <span className="font-medium">2-15 people</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Availability:</span>
                      <Badge className="bg-green-100 text-green-800">Available</Badge>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <Button size="lg" className="w-full bg-amber-600 hover:bg-amber-700 mb-3">
                      Book Now
                    </Button>
                    <Button size="lg" variant="outline" className="w-full border-amber-600 text-amber-600 hover:bg-amber-50">
                      Contact Us
                    </Button>
                  </div>
                  
                  <div className="text-center text-sm text-gray-500">
                    <p>Free cancellation up to 24 hours before departure</p>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Reviews */}
              <Card className="bg-white shadow-lg relative z-10">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-400" />
                    Customer Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">4.8 out of 5 (124 reviews)</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                        <div>
                          <p className="font-medium text-sm">Sarah M.</p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        &quot;Absolutely amazing experience! The tour was well-organized and our guide was fantastic.&quot;
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                        <div>
                          <p className="font-medium text-sm">John D.</p>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        &quot;Great value for money. Every detail was taken care of. Highly recommend!&quot;
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
