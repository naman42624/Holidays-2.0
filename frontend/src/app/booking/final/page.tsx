'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FlightOffer, BookingPassenger, BookingContact, SeatSelection, MealSelection } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { getCityDisplayName } from '@/data/airportDatabase'
import { bookingApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Plane, Calendar, Clock, Users, Mail, Phone } from 'lucide-react'
import { motion } from 'framer-motion'

interface FinalBookingData {
  flight: FlightOffer
  passengers: BookingPassenger[]
  contact: BookingContact
  extras: {
    seats: SeatSelection[]
    meals: MealSelection[]
  }
  totalExtras: number
}

export default function FinalBookingPage() {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<FinalBookingData | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const savedBookingData = sessionStorage.getItem('finalBookingData')
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

  const handleProceedToPayment = () => {
    setShowModal(true)
  }

  const handleConfirmBooking = async () => {
    if (!bookingData) return
    
    setIsSubmitting(true)
    
    try {
      // Extract flight information from the flight offer
      const firstSegment = flight.itineraries[0].segments[0]
      const lastSegment = flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1]
      
      // Prepare booking data for API with correct structure
      const bookingRequest = {
        flightData: {
          origin: firstSegment.departure.iataCode,
          destination: lastSegment.arrival.iataCode,
          departureDate: firstSegment.departure.at,
          returnDate: flight.itineraries[1] ? flight.itineraries[1].segments[0].departure.at : undefined,
          flightOffers: [flight],
          airline: firstSegment.carrierCode,
          flightNumber: firstSegment.flightNumber,
          duration: flight.itineraries[0].duration,
          stops: flight.itineraries[0].segments.length - 1,
        },
        passengers: passengers.map(p => ({
          ...p,
          dateOfBirth: p.dateOfBirth,
          passportExpiry: p.passportExpiry,
        })),
        contact: contact,
        specialRequests: undefined, // Add if needed
      }
      
      // Submit booking to API
      const bookingResult = await bookingApi.createFlightBooking(bookingRequest)
      
      // Store booking confirmation data
      const confirmationData = {
        ...bookingData,
        bookingReference: bookingResult.bookingId,
        status: 'CONFIRMED',
        bookingDate: new Date().toISOString(),
        bookingResult: bookingResult
      }
      
      sessionStorage.setItem('bookingConfirmation', JSON.stringify(confirmationData))
      
      // Clear temporary booking data
      sessionStorage.removeItem('bookingData')
      sessionStorage.removeItem('confirmedBookingData')
      sessionStorage.removeItem('finalBookingData')
      
      // Navigate to success page
      router.push('/booking/success')
      
    } catch (error) {
      console.error('Error submitting booking:', error)
      // Show error message to user
      alert('There was an error submitting your booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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

  const { flight, passengers, contact, extras } = bookingData
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <span>Flights</span>
              <span>›</span>
              <span>Book Flight</span>
              <span>›</span>
              <span>Review Details</span>
              <span>›</span>
              <span>Select Seats & Meals</span>
              <span>›</span>
              <span className="text-blue-600 font-medium">Final Review</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Final Review</h1>
            <p className="text-gray-600 mt-1">Review your complete booking before confirming</p>
          </div>

          <div className="space-y-6">
            {/* Flight Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plane className="w-5 h-5" />
                  <span>Flight Summary</span>
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
                    <Badge variant="outline" className="mb-2">
                      {segments.length === 1 ? 'Direct Flight' : `${segments.length - 1} Stop${segments.length > 2 ? 's' : ''}`}
                    </Badge>
                    <p className="text-sm text-gray-600">{passengers.length} passenger{passengers.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passenger Details with Seats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Passenger Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {passengers.map((passenger, index) => {
                    const passengerSeat = extras.seats.find(s => s.passengerId === passenger.id)
                    const passengerMeal = extras.meals.find(m => m.passengerId === passenger.id)
                    
                    return (
                      <div key={passenger.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{passenger.title} {passenger.firstName} {passenger.lastName}</p>
                            <p className="text-sm text-gray-600">
                              {passenger.type.toLowerCase()} • {passenger.nationality}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              Seat {passengerSeat?.seatNumber || 'Not selected'}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            {passengerMeal?.mealType?.toLowerCase().replace('_', ' ') || 'Regular meal'}
                          </div>
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
                      <p className="text-sm text-gray-600">Booking confirmation will be sent here</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{contact.phone}</p>
                      <p className="text-sm text-gray-600">Contact number</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Price Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Flight Price ({passengers.length} passenger{passengers.length > 1 ? 's' : ''})</span>
                    <span className="font-medium">{formatCurrency(totalPrice, flight.price.currency)}</span>
                  </div>
                  
                  {extras.seats.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Seat Selection</span>
                      <span className="font-medium">
                        {formatCurrency(extras.seats.reduce((sum, seat) => sum + (seat.seatPrice || 0), 0), flight.price.currency)}
                      </span>
                    </div>
                  )}
                  
                  {extras.meals.some(m => (m.mealPrice || 0) > 0) && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Meal Upgrades</span>
                      <span className="font-medium">
                        {formatCurrency(extras.meals.reduce((sum, meal) => sum + (meal.mealPrice || 0), 0), flight.price.currency)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span className="font-medium">Included</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">Total Amount</span>
                      <span className="text-2xl font-bold text-blue-600">{formatCurrency(finalTotal, flight.price.currency)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-blue-900">Important Notes:</p>
                  <ul className="space-y-1 text-blue-800 list-disc list-inside">
                    <li>Our team will contact you within 24 hours to confirm your booking</li>
                    <li>Payment details and methods will be provided during the confirmation call</li>
                    <li>Please ensure all passenger details are correct before confirming</li>
                    <li>Booking is subject to availability and airline terms & conditions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                Back to Seat Selection
              </Button>
              
              <Button
                onClick={handleProceedToPayment}
                className="bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                Confirm Booking
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
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Confirm Your Booking</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to confirm this booking? Our team will contact you within 24 hours for payment and final confirmation.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
