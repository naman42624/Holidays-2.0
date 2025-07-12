'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plane, 
  Building, 
  MapPin, 
  Calendar, 
  Shield, 
  Clock, 
  Users, 
  Star,
  CheckCircle,
  Globe,
  Heart,
  Camera
} from 'lucide-react'

export default function ServicesPage() {
  const services = [
    {
      icon: Plane,
      title: "Flight Booking",
      description: "Domestic & International flights at best prices",
      features: ["Compare 500+ airlines", "Best price guarantee", "24/7 support", "Instant booking"]
    },
    {
      icon: Building,
      title: "Hotel Reservations", 
      description: "Luxury stays to budget accommodations worldwide",
      features: ["1M+ properties", "Free cancellation", "Best rate guarantee", "Verified reviews"]
    },
    {
      icon: MapPin,
      title: "Holiday Packages",
      description: "Curated travel experiences for every budget",
      features: ["All-inclusive deals", "Custom itineraries", "Local guides", "Group discounts"]
    },
    {
      icon: Camera,
      title: "Activities & Tours",
      description: "Unforgettable experiences and local adventures", 
      features: ["Skip-the-line tickets", "Expert guides", "Small groups", "Cultural immersion"]
    },
    {
      icon: Calendar,
      title: "Visa Assistance",
      description: "Hassle-free visa processing for all destinations",
      features: ["Document guidance", "Application tracking", "Quick processing", "Expert consultation"]
    },
    {
      icon: Shield,
      title: "Travel Insurance",
      description: "Comprehensive coverage for worry-free travel",
      features: ["Medical coverage", "Trip cancellation", "Baggage protection", "24/7 claims support"]
    }
  ]

  const testimonials = [
    {
      name: "Priya Sharma",
      location: "Mumbai",
      rating: 5,
      text: "Holidays by Bells made our Europe trip absolutely magical! From flights to hotels, everything was perfectly organized. Highly recommended!"
    },
    {
      name: "Rajesh Kumar",
      location: "Delhi",
      rating: 5,
      text: "Excellent service and great prices. The team helped us plan our honeymoon to Bali and it was beyond our expectations."
    },
    {
      name: "Anita Patel",
      location: "Bangalore",
      rating: 5,
      text: "Professional, reliable, and always available. Holidays by Bells has been our go-to travel partner for the past 3 years."
    }
  ]

  const whyChooseUs = [
    {
      icon: Globe,
      title: "Global Reach",
      description: "Access to worldwide destinations with local expertise"
    },
    {
      icon: Shield,
      title: "Trusted & Secure",
      description: "IATA certified with secure payment processing"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock assistance for all your travel needs"
    },
    {
      icon: Star,
      title: "Best Prices",
      description: "Competitive rates with no hidden charges"
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Experienced travel consultants to guide you"
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Your satisfaction is our top priority"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Holidays by Bells Services</h1>
            <p className="text-xl md:text-2xl mb-2">Unlock The World With Bells</p>
            <p className="text-lg opacity-90">Crafted by Bells with Love & Expertise</p>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Premium Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From flights to complete holiday packages, we offer comprehensive travel solutions 
              tailored to make your journey unforgettable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <service.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Holidays by Bells?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              With years of experience and thousands of happy customers, we&apos;re committed to 
              making your travel dreams come true.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <item.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-gray-600">Real experiences from real travelers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic mb-4">&quot;{testimonial.text}&quot;</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8">Let Holidays by Bells turn your travel dreams into reality</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-yellow-600 hover:bg-gray-100">
              Plan My Trip
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-yellow-600">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
