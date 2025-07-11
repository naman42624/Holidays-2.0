'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Hotel, HotelSearchForm, BookingContact } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { bookingApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Building, Calendar, Users, Mail, Phone, Star } from 'lucide-react'
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

interface HotelFinalBookingData {
  hotel: Hotel
  searchForm: HotelSearchForm
  guests: HotelGuest[]
  contact: BookingContact
  specialRequests: string
}

export default function HotelConfirmationPage() {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<HotelFinalBookingData | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const savedBookingData = sessionStorage.getItem('hotelFinalBookingData')
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

  const handleConfirmBooking = async () => {
    if (!bookingData) return
    
    setIsSubmitting(true)
    
    try {
      const { hotel, searchForm, guests, contact, specialRequests } = bookingData
      const offer = hotel.offers?.[0]
      
      // Prepare booking data for API
      const bookingRequest = {
        hotel: {
          hotelId: hotel.hotelId,
          name: hotel.name,
          address: {
            street: hotel.address?.lines?.[0] || '',
            city: hotel.address?.cityName || '',
            country: hotel.address?.countryCode || '',
            postalCode: '', // Not available in current hotel type
          },
          checkIn: searchForm.checkIn,
          checkOut: searchForm.checkOut,
          nights: Math.ceil((new Date(searchForm.checkOut).getTime() - new Date(searchForm.checkIn).getTime()) / (1000 * 60 * 60 * 24)),
          rooms: [{
            roomType: offer?.room?.type || 'STANDARD',
            roomName: offer?.room?.typeEstimated?.category || 'Standard Room',
            guests: searchForm.rooms || 1,
            price: parseFloat(offer?.price?.total || '0'),
          }],
        },
        searchForm: searchForm,
        guests: guests.map(guest => ({
          title: guest.title,
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          phone: guest.phone,
          isMainGuest: guest.type === 'PRIMARY',
        })),
        contact: contact,
        specialRequests: specialRequests || undefined,
      }
      
      // Submit booking to API
      const bookingResult = await bookingApi.createHotelBooking(bookingRequest)
      
      // Store booking confirmation data
      const confirmationData = {
        ...bookingData,
        bookingReference: bookingResult.bookingId,
        status: 'CONFIRMED',
        bookingDate: new Date().toISOString(),
        bookingResult: bookingResult
      }
      
      sessionStorage.setItem('hotelBookingConfirmation', JSON.stringify(confirmationData))
      
      // Clear temporary booking data
      sessionStorage.removeItem('hotelBookingData')
      sessionStorage.removeItem('hotelFinalBookingData')
      
      // Navigate to success page
      router.push('/booking/hotel-success')
      
    } catch (error) {
      console.error('Error submitting hotel booking:', error)
      // Show error message to user
      alert('There was an error submitting your hotel booking. Please try again.')
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

  const { hotel, searchForm, guests, contact, specialRequests } = bookingData
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <span>Hotels</span>
              <span>›</span>
              <span>Book Hotel</span>
              <span>›</span>
              <span className="text-blue-600 font-medium">Confirm Booking</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Confirm Your Hotel Booking</h1>
            <p className="text-gray-600 mt-1">Please review all details before confirming</p>
          </div>

          <div className="space-y-6">
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
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalPrice, offer?.price.currency || 'USD')}</p>
                    <p className="text-sm text-gray-600">Total for {nights} night{nights > 1 ? 's' : ''}</p>
                    <Badge variant="outline" className="mt-2">
                      {offer?.room.type} Room
                    </Badge>
                  </div>
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
                      <p className="text-sm text-gray-600">Contact number</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Guest Details ({guests.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {guests.map((guest, index) => (
                    <div key={guest.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{guest.title} {guest.firstName} {guest.lastName}</p>
                          <p className="text-sm text-gray-600">
                            {guest.type === 'PRIMARY' ? 'Primary Guest' : 'Additional Guest'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {guest.type.toLowerCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Special Requests */}
            {specialRequests && (
              <Card>
                <CardHeader>
                  <CardTitle>Special Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{specialRequests}</p>
                </CardContent>
              </Card>
            )}

            {/* Price Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Price Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Room Rate (per night)</span>
                    <span className="font-medium">{formatCurrency(offer ? parseFloat(offer.price.total) : 0, offer?.price.currency || 'USD')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Number of Nights</span>
                    <span className="font-medium">{nights}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span className="font-medium">Included</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">Total Amount</span>
                      <span className="text-2xl font-bold text-blue-600">{formatCurrency(totalPrice, offer?.price.currency || 'USD')}</span>
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
                    <li>Please ensure all guest details are correct before confirming</li>
                    <li>Booking is subject to availability and hotel terms & conditions</li>
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
                Back to Edit
              </Button>
              
              <Button
                onClick={() => setShowModal(true)}
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
              <h3 className="text-lg font-semibold mb-2">Confirm Your Hotel Booking</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to confirm this hotel booking? Our team will contact you within 24 hours for payment and final confirmation.
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
