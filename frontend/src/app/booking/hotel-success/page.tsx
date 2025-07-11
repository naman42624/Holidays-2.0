'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Hotel, HotelSearchForm, BookingContact } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Download, Mail, Phone, Calendar, Users, Building, Home, Star } from 'lucide-react'
import { motion } from 'framer-motion'

interface HotelGuest {
  id: string
  title: 'Mr' | 'Mrs' | 'Ms' | 'Miss' | 'Dr'
  firstName: string
  lastName: string
  email: string
  phone: string
  type: 'PRIMARY' | 'ADDITIONAL'
}

interface HotelBookingConfirmation {
  hotel: Hotel
  searchForm: HotelSearchForm
  guests: HotelGuest[]
  contact: BookingContact
  specialRequests: string
  bookingReference: string
  status: string
  bookingDate: string
}

export default function HotelSuccessPage() {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<HotelBookingConfirmation | null>(null)

  useEffect(() => {
    const savedBookingData = sessionStorage.getItem('hotelBookingConfirmation')
    if (savedBookingData) {
      try {
        const data = JSON.parse(savedBookingData)
        setBookingData(data)
      } catch (error) {
        console.error('Error parsing hotel booking data:', error)
        router.push('/hotels')
      }
    } else {
      router.push('/hotels')
    }
  }, [router])

  const handleDownloadConfirmation = () => {
    // In a real application, this would generate and download a PDF
    alert('Booking confirmation download functionality would be implemented here')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const handleBookAnotherHotel = () => {
    router.push('/hotels')
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking confirmation...</p>
        </div>
      </div>
    )
  }

  const { hotel, searchForm, guests, contact, bookingReference } = bookingData
  const offer = hotel.offers?.[0]
  const checkInDate = new Date(searchForm.checkIn)
  const checkOutDate = new Date(searchForm.checkOut)
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
  const totalPrice = offer ? parseFloat(offer.price.total) * nights : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Success Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Hotel Booking Request Submitted!</h1>
              <p className="text-gray-600 text-lg">
                Your booking reference is <span className="font-semibold text-blue-600">{bookingReference}</span>
              </p>
            </motion.div>
          </div>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="bg-blue-50 border-blue-200 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                    <ul className="space-y-1 text-blue-800 text-sm">
                      <li>• Our team will contact you within 24 hours to confirm your booking</li>
                      <li>• We&apos;ll provide payment options and complete the booking process</li>
                      <li>• You&apos;ll receive your hotel confirmation via email</li>
                      <li>• Keep your booking reference handy for all communications</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Booking Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="space-y-6"
          >
            {/* Hotel Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Hotel Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{hotel.name}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < (hotel.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{hotel.rating} stars</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {hotel.address.lines.join(', ')}, {hotel.address.cityName}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Check-in: {checkInDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Check-out: {checkOutDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>{searchForm.adults} guest{searchForm.adults > 1 ? 's' : ''} • {searchForm.rooms} room{searchForm.rooms > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPrice, offer?.price.currency || 'USD')}</p>
                    <p className="text-sm text-gray-600">Total for {nights} night{nights > 1 ? 's' : ''}</p>
                    <Badge variant="outline" className="mt-2">
                      {offer?.room.type} Room
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Guests ({guests.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {guests.map((guest, index) => (
                    <div key={guest.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{guest.title} {guest.firstName} {guest.lastName}</p>
                        <p className="text-xs text-gray-600">
                          {guest.type === 'PRIMARY' ? 'Primary Guest' : 'Additional Guest'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{contact.email}</p>
                      <p className="text-sm text-gray-600">Confirmation will be sent here</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{contact.phone}</p>
                      <p className="text-sm text-gray-600">We&apos;ll call you here</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-4 mt-8"
          >
            <Button
              onClick={handleDownloadConfirmation}
              variant="outline"
              className="flex-1 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Confirmation</span>
            </Button>
            
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="flex-1 flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Go to Home</span>
            </Button>
            
            <Button
              onClick={handleBookAnotherHotel}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Book Another Hotel
            </Button>
          </motion.div>

          {/* Customer Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="text-center mt-8 p-4 bg-gray-100 rounded-lg"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-3">
              If you have any questions about your booking, please contact our customer support team.
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>support@travelbook.com</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
