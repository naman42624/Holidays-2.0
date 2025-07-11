'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FlightOffer, BookingPassenger, BookingContact } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { getCityDisplayName } from '@/data/airportDatabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Plane, User, Mail, Phone, MapPin, Calendar, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface BookingData {
  flight: FlightOffer
  passengers: BookingPassenger[]
  contact: BookingContact
}

export default function BookingConfirmationPage() {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const savedBookingData = sessionStorage.getItem('confirmedBookingData')
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

  const handleConfirm = () => {
    setShowModal(true)
  }

  const handleModalConfirm = () => {
    setIsLoading(true)
    // Store booking data for seat selection
    sessionStorage.setItem('confirmedBookingData', JSON.stringify(bookingData))
    router.push('/booking/seats')
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  const { flight, passengers, contact } = bookingData
  const segments = flight.itineraries[0].segments
  const firstSegment = segments[0]
  const lastSegment = segments[segments.length - 1]
  const totalPrice = parseFloat(flight.price.total)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <span>Flights</span>
              <span>›</span>
              <span>Book Flight</span>
              <span>›</span>
              <span className="text-blue-600 font-medium">Review Details</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Review Your Booking</h1>
            <p className="text-gray-600 mt-1">Please review all details before confirming</p>
          </div>

          <div className="space-y-6">
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
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalPrice, flight.price.currency)}</p>
                    <p className="text-sm text-gray-600">Total for {passengers.length} passenger{passengers.length > 1 ? 's' : ''}</p>
                    <Badge variant="outline" className="mt-2">
                      {segments.length === 1 ? 'Direct Flight' : `${segments.length - 1} Stop${segments.length > 2 ? 's' : ''}`}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{contact.firstName} {contact.lastName}</p>
                      <p className="text-sm text-gray-600">Primary Contact</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{contact.email}</p>
                      <p className="text-sm text-gray-600">Email</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{contact.phone}</p>
                      <p className="text-sm text-gray-600">Phone</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{contact.address.city}, {contact.address.country}</p>
                      <p className="text-sm text-gray-600">Address</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passengers */}
            <Card>
              <CardHeader>
                <CardTitle>Passengers ({passengers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {passengers.map((passenger) => (
                    <div key={passenger.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{passenger.title} {passenger.firstName} {passenger.lastName}</p>
                          <p className="text-sm text-gray-600">
                            {passenger.type.toLowerCase()} • {passenger.nationality} • {new Date(passenger.dateOfBirth).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {passenger.type.toLowerCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                Back to Edit
              </Button>
              
              <Button
                onClick={handleConfirm}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Confirm Details
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Confirm Your Details</h3>
              <p className="text-gray-600 mb-6">
                Please confirm that all traveler details are correct. You will not be able to change them after this step.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Review Again
                </Button>
                <Button
                  onClick={handleModalConfirm}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? 'Processing...' : 'Confirm & Continue'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
