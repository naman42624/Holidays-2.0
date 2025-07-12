'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plane, Hotel, Map, Search, Clock, Shield, Star, Globe, Users, Calendar, CheckCircle } from 'lucide-react'
import CombinedSearchForm from '@/components/CombinedSearchForm'
import TypewriterEffectHero from '@/components/TypewriterEffectHero'
import HeroBackgroundGradient from '@/components/HeroBackgroundGradient'
import { PageTransition } from '@/components/ui/PageTransition'
import { useTourPackages } from '@/hooks/useTourPackages'
import TourPackage3DCard from '@/components/ui/TourPackage3DCard'

export default function Home() {
  const { tourPackages, loading: tourPackagesLoading, error: tourPackagesError } = useTourPackages()
  const features = [
    {
      icon: Plane,
      title: 'Flight Search',
      description: 'Find and book flights worldwide with real-time pricing',
      href: '/flights'
    },
    {
      icon: Hotel,
      title: 'Hotel Booking',
      description: 'Discover hotels and accommodations for your perfect stay',
      href: '/hotels'
    },
    {
      icon: Map,
      title: 'Activities & Tours',
      description: 'Explore local attractions and book amazing experiences',
      href: '/activities'
    },
    {
      icon: Map,
      title: 'Tour Packages',
      description: 'Discover curated travel packages for unforgettable journeys',
      href: '/tour-packages'
    }
  ]

  const benefits = [
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Advanced search with caching for faster results'
    },
    {
      icon: Clock,
      title: 'Real-time Data',
      description: 'Live pricing and availability from trusted sources'
    },
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'JWT authentication and secure payment processing'
    }
  ]

  return (
    <PageTransition>
      <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative text-white">
        <HeroBackgroundGradient>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <div className="mb-4">
                <TypewriterEffectHero />
              </div>
              <p className="text-xl md:text-2xl mb-4 opacity-90 text-yellow-900">
                Unlock The World With Bells
              </p>
              <p className="text-lg mb-8 opacity-80 text-yellow-800">
                Crafted by Bells with 5+ years of expertise in creating unforgettable journeys
              </p>
            </div>
            
            {/* Combined Search Form */}
            <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <CombinedSearchForm />
            </div>
          </div>
        </HeroBackgroundGradient>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Travel
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive travel services for all your Travel needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Link href={feature.href}>
                      <Button className="w-full">Get Started</Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Tour Packages Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Tour Packages
            </h2>
            <p className="text-xl text-gray-600">
              Discover our handpicked collection of extraordinary travel experiences
            </p>
          </div>
          
          {tourPackagesLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : tourPackagesError ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <Map className="w-12 h-12 mx-auto mb-2" />
                <p>Unable to load tour packages at the moment</p>
              </div>
              <Link href="/tour-packages">
                <Button variant="outline">View All Tour Packages</Button>
              </Link>
            </div>
          ) : tourPackages.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tourPackages.slice(0, 6).map((pkg) => (
                  <TourPackage3DCard
                    key={pkg._id}
                    tourPackage={pkg}
                    onSelect={(tourPackage) => {
                      // Handle booking logic here
                      console.log('Book tour package:', tourPackage);
                    }}
                  />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link href="/tour-packages">
                  <Button size="lg" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    View All Tour Packages
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <Map className="w-12 h-12 mx-auto mb-2" />
                <p>No tour packages available at the moment</p>
              </div>
              <Link href="/tour-packages">
                <Button variant="outline">Check Back Later</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600">
              Built with modern technology and user experience in mind
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Travelers Say
            </h2>
            <p className="text-xl text-gray-600">
              Real experiences from our valued customers
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                &quot;Holidays by Bells made our dream vacation to Japan absolutely perfect. Every detail was handled with care and professionalism.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah Johnson</p>
                  <p className="text-sm text-gray-500">New York, USA</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                &quot;Outstanding service! The team went above and beyond to ensure our honeymoon in Bali was unforgettable. Highly recommended!&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold text-gray-900">Mike & Emma Davis</p>
                  <p className="text-sm text-gray-500">London, UK</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                &quot;15 years of experience really shows! From booking to return, everything was seamless. Best travel agency we&apos;ve ever used.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold text-gray-900">Robert Chen</p>
                  <p className="text-sm text-gray-500">Toronto, Canada</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Travel Information & Tips Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Travel Smart with Expert Guidance
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know for seamless travel experiences
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Global Coverage</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Access to over 500 airlines and 150,000+ hotels worldwide. Book domestic and international travel with confidence.
              </p>
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>200+ countries covered</span>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">24/7 Support</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Our experienced travel consultants are available around the clock to assist with bookings, changes, and travel emergencies.
              </p>
              <div className="flex items-center text-sm text-blue-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Instant chat & phone support</span>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Flexible Booking</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Free cancellation, date changes, and flexible payment options. Travel with peace of mind knowing you&apos;re covered.
              </p>
              <div className="flex items-center text-sm text-purple-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>No hidden fees</span>
              </div>
            </Card>
          </div>

          <div className="mt-16 bg-white rounded-xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Essential Travel Tips
              </h3>
              <p className="text-gray-600">
                Make the most of your journey with these expert recommendations
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Before You Travel</h4>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Check passport validity (6+ months remaining)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Research visa requirements for your destination</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Book flights 2-3 months in advance for best prices</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Consider travel insurance for peace of mind</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">During Your Trip</h4>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Keep digital copies of important documents</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Stay connected with local SIM or international roaming</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Respect local customs and dress codes</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Try local cuisine and embrace new experiences</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of travelers who trust our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="outline" className="text-blue-600">
                Sign Up Free
              </Button>
            </Link>
            <Link href="/flights">
              <Button size="lg" variant="secondary">
                Start Searching
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </div>
    </PageTransition>
  )
}
