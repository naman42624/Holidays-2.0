'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FlightOffer, BookingPassenger, BookingContact, SeatSelection, MealSelection } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { getCityDisplayName } from '@/data/airportDatabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Download, Mail, Phone, Calendar, Clock, Plane, Users, Home } from 'lucide-react'
import { motion } from 'framer-motion'

interface BookingConfirmation {
  flight: FlightOffer
  passengers: BookingPassenger[]
  contact: BookingContact
  extras: {
    seats: SeatSelection[]
    meals: MealSelection[]
  }
  totalExtras: number
  bookingReference: string
  status: string
  bookingDate: string
}

export default function BookingSuccessPage() {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<BookingConfirmation | null>(null)

  useEffect(() => {
    const savedBookingData = sessionStorage.getItem('bookingConfirmation')
    if (savedBookingData) {
      try {
        const data = JSON.parse(savedBookingData)
        setBookingData(data)
      } catch (error) {
        console.error('Error parsing booking data:', error)
        router.push('/flights')
      }
    } else {
      router.push('/flights')
    }
  }, [router])

  const handleDownloadItinerary = () => {
    // In a real application, this would generate and download a PDF
    alert('Itinerary download functionality would be implemented here')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const handleBookAnother = () => {
    router.push('/flights')
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

  const { flight, passengers, contact, extras, bookingReference } = bookingData
  const segments = flight.itineraries[0].segments
  const firstSegment = segments[0]
  const lastSegment = segments[segments.length - 1]
  const totalPrice = parseFloat(flight.price.total)
  const finalTotal = totalPrice + bookingData.totalExtras

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Request Submitted!</h1>
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
                      <li>• You&apos;ll receive your e-ticket and boarding pass via email</li>
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
            {/* Flight Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plane className="w-5 h-5" />
                  <span>Flight Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {getCityDisplayName(firstSegment.departure.iataCode)} → {getCityDisplayName(lastSegment.arrival.iataCode)}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{new Date(firstSegment.departure.at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>
                          {new Date(firstSegment.departure.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {new Date(lastSegment.arrival.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Plane className="w-4 h-4 text-gray-500" />
                        <span>{firstSegment.carrierCode} {firstSegment.flightNumber}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(finalTotal, flight.price.currency)}</p>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <Badge variant="outline" className="mt-2">
                      {segments.length === 1 ? 'Direct Flight' : `${segments.length - 1} Stop${segments.length > 2 ? 's' : ''}`}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passenger Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Passengers ({passengers.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {passengers.map((passenger, index) => {
                    const passengerSeat = extras.seats.find(s => s.passengerId === passenger.id)
                    const passengerMeal = extras.meals.find(m => m.passengerId === passenger.id)
                    
                    return (
                      <div key={passenger.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{passenger.title} {passenger.firstName} {passenger.lastName}</p>
                          <p className="text-xs text-gray-600">
                            Seat {passengerSeat?.seatNumber} • {passengerMeal?.mealType?.toLowerCase().replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    )
                  })}
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
              onClick={handleDownloadItinerary}
              variant="outline"
              className="flex-1 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Itinerary</span>
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
              onClick={handleBookAnother}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Book Another Flight
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
