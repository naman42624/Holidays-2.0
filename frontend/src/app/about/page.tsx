'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Globe, 
  Clock, 
  Heart,
  CheckCircle,
  Plane
} from 'lucide-react'

export default function AboutPage() {
  const stats = [
    { number: "50,000+", label: "Happy Travelers", icon: Users },
    { number: "15+", label: "Years Experience", icon: Clock },
    { number: "200+", label: "Destinations", icon: Globe },
    { number: "24/7", label: "Customer Support", icon: Heart }
  ]

  const teamMembers = [
    {
      name: "Bells Founder",
      position: "Founder & CEO",
      description: "With over 5 years in the travel industry, our founder started Holidays by Bells with a vision to make travel accessible and memorable for everyone."
    },
    {
      name: "Travel Experts",
      position: "Senior Travel Consultants",
      description: "Our team of experienced travel consultants have visited over 100 countries and bring firsthand knowledge to plan your perfect trip."
    },
    {
      name: "Customer Care",
      position: "Support Specialists",
      description: "Our dedicated customer care team ensures you receive prompt assistance and support throughout your travel journey."
    }
  ]

  const milestones = [
    {
      year: "2009",
      title: "Founded Holidays by Bells",
      description: "Started with a small office and big dreams to revolutionize travel experiences"
    },
    {
      year: "2013",
      title: "IATA Certification",
      description: "Became IATA certified travel agent, ensuring secure and reliable booking services"
    },
    {
      year: "2018",
      title: "Digital Transformation",
      description: "Launched online platform making travel booking easier and more accessible"
    },
    {
      year: "2023",
      title: "50,000+ Travelers",
      description: "Celebrated serving over 50,000 happy customers with memorable travel experiences"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Holidays by Bells</h1>
            <p className="text-xl md:text-2xl mb-4">
              Crafting Unforgettable Travel Experiences Since 2009
            </p>
            <p className="text-lg opacity-90">
              Founded by Bells with a passion for travel and a commitment to excellence, 
              we&apos;ve been turning travel dreams into reality for over a decade.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <stat.icon className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-600 text-lg">
                The journey that started with a dream to make travel accessible to everyone
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Born from Passion for Travel
                </h3>
                <p className="text-gray-600 mb-6">
                  Holidays by Bells was founded in 2009 by Bells, a passionate traveler who understood 
                  the challenges of planning the perfect trip. What started as a small travel 
                  consultancy has grown into a trusted travel partner for thousands of families 
                  and individuals across India.
                </p>
                <p className="text-gray-600 mb-6">
                  Our founder&apos;s vision was simple yet powerful: to create a travel company 
                  that treats every customer like family, ensuring each journey is not just a 
                  trip, but a collection of beautiful memories that last a lifetime.
                </p>
                <div className="flex items-center gap-2 text-yellow-600">
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">Crafted with Love & Care</span>
                </div>
              </div>
              <div className="bg-blue-50 p-8 rounded-lg">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Our Mission</h4>
                <p className="text-gray-600 mb-4">
                  To make exceptional travel experiences accessible to everyone through 
                  personalized service, competitive pricing, and unwavering commitment 
                  to customer satisfaction.
                </p>
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Our Vision</h4>
                <p className="text-gray-600">
                  To be India&apos;s most trusted travel partner, known for creating 
                  unforgettable journeys that bring families together and create 
                  memories that last forever.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-gray-600">Key milestones in our growth story</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {milestone.year.slice(-2)}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="text-yellow-600 font-semibold text-sm mb-1">
                        {milestone.year}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-600">
              Passionate travel experts dedicated to making your journey perfect
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-10 h-10 text-yellow-600" />
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-yellow-600 font-medium">
                    {member.position}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer First</h3>
              <p className="text-gray-600">
                Every decision we make is with our customers&apos; best interests at heart
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in every service we provide
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600">
                Continuously improving our services with latest technology
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Travel Family</h2>
          <p className="text-xl mb-8">
            Experience the Holidays by Bells difference and let us create your next adventure
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-yellow-600 hover:bg-gray-100">
              <Plane className="w-5 h-5 mr-2" />
              Start Planning
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-yellow-600">
              Contact Our Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
