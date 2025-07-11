'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Hotel, HotelSearchForm, BookingContact } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building, Users, Star, Wifi, Car, Utensils, Dumbbell, Coffee, AlertCircle, Info } from 'lucide-react'
import { motion } from 'framer-motion'

interface HotelBookingData {
  hotel: Hotel
  searchForm: HotelSearchForm
}

interface HotelGuest {
  id: string
  title: 'Mr' | 'Mrs' | 'Ms' | 'Miss' | 'Dr'
  firstName: string
  lastName: string
  email: string
  phone: string
  type: 'PRIMARY' | 'ADDITIONAL'
}

const getAmenityIcon = (amenity: string) => {
  switch (amenity.toLowerCase()) {
    case 'wifi':
      return <Wifi className="w-4 h-4" />
    case 'parking':
      return <Car className="w-4 h-4" />
    case 'restaurant':
      return <Utensils className="w-4 h-4" />
    case 'gym':
      return <Dumbbell className="w-4 h-4" />
    case 'pool':
      return <Coffee className="w-4 h-4" />
    default:
      return <Coffee className="w-4 h-4" />
  }
}

export default function HotelBookingPage() {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<HotelBookingData | null>(null)
  const [guests, setGuests] = useState<HotelGuest[]>([])
  const [contact, setContact] = useState<BookingContact>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      country: '',
      postalCode: ''
    }
  })
  const [specialRequests, setSpecialRequests] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const savedBookingData = sessionStorage.getItem('hotelBookingData')
    if (savedBookingData) {
      try {
        const data = JSON.parse(savedBookingData)
        setBookingData(data)
        
        // Initialize guests based on search form
        const guestList: HotelGuest[] = []
        
        // Add primary guest
        guestList.push({
          id: 'primary',
          title: 'Mr',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          type: 'PRIMARY'
        })
        
        // Add additional guests based on adults count
        const adultsCount = data.searchForm.adults || 1
        for (let i = 1; i < adultsCount; i++) {
          guestList.push({
            id: `guest-${i}`,
            title: 'Mr',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            type: 'ADDITIONAL'
          })
        }
        
        setGuests(guestList)
      } catch (error) {
        console.error('Error parsing hotel booking data:', error)
        router.push('/hotels')
      }
    } else {
      router.push('/hotels')
    }
  }, [router])

  const updateGuest = (index: number, field: string, value: string) => {
    const updatedGuests = [...guests]
    const fieldPath = field.split('.')
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current = updatedGuests[index] as unknown as Record<string, any>
    for (let i = 0; i < fieldPath.length - 1; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      current = current[fieldPath[i]] as Record<string, any>
    }
    current[fieldPath[fieldPath.length - 1]] = value
    
    setGuests(updatedGuests)
  }

  const updateContact = (field: string, value: string) => {
    const fieldPath = field.split('.')
    const updatedContact = { ...contact }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current = updatedContact as unknown as Record<string, any>
    for (let i = 0; i < fieldPath.length - 1; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      current = current[fieldPath[i]] as Record<string, any>
    }
    current[fieldPath[fieldPath.length - 1]] = value
    
    setContact(updatedContact)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    // Validate contact information
    if (!contact.firstName.trim()) newErrors.contactFirstName = 'First name is required'
    if (!contact.lastName.trim()) newErrors.contactLastName = 'Last name is required'
    if (!contact.email.trim()) newErrors.contactEmail = 'Email is required'
    if (!contact.phone.trim()) newErrors.contactPhone = 'Phone is required'
    
    // Validate primary guest
    const primaryGuest = guests.find(g => g.type === 'PRIMARY')
    if (primaryGuest) {
      if (!primaryGuest.firstName.trim()) newErrors.primaryGuestFirstName = 'Primary guest first name is required'
      if (!primaryGuest.lastName.trim()) newErrors.primaryGuestLastName = 'Primary guest last name is required'
      if (!primaryGuest.email.trim()) newErrors.primaryGuestEmail = 'Primary guest email is required'
      if (!primaryGuest.phone.trim()) newErrors.primaryGuestPhone = 'Primary guest phone is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    
    const finalBookingData = {
      ...bookingData,
      guests,
      contact,
      specialRequests
    }
    
    sessionStorage.setItem('hotelFinalBookingData', JSON.stringify(finalBookingData))
    router.push('/booking/hotel-confirmation')
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hotel booking...</p>
        </div>
      </div>
    )
  }

  const { hotel, searchForm } = bookingData
  const offer = hotel.offers?.[0]
  const checkInDate = new Date(searchForm.checkIn)
  const checkOutDate = new Date(searchForm.checkOut)
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
  const totalPrice = offer ? parseFloat(offer.price.total) * nights : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
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
              <span>Search Results</span>
              <span>›</span>
              <span className="text-blue-600 font-medium">Book Hotel</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Hotel Booking</h1>
            <p className="text-gray-600 mt-1">Please fill in the guest details to proceed</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hotel Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="w-5 h-5" />
                    <span>Hotel Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
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
                          {hotel.address?.lines?.join(', ') || hotel.address?.cityName || 'Address not available'}, {hotel.address?.cityName}
                        </p>
                        
                        {/* Amenities */}
                        <div className="flex flex-wrap gap-3">
                          {hotel.amenities?.map((amenity, i) => (
                            <div key={i} className="flex items-center space-x-1 text-gray-600">
                              {getAmenityIcon(amenity)}
                              <span className="text-sm">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalPrice, offer?.price.currency || 'USD')}</p>
                        <p className="text-sm text-gray-600">for {nights} night{nights > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Check-in</p>
                          <p className="font-medium">{checkInDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Check-out</p>
                          <p className="font-medium">{checkOutDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Guests</p>
                          <p className="font-medium">{searchForm.adults} adult{searchForm.adults > 1 ? 's' : ''}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Rooms</p>
                          <p className="font-medium">{searchForm.rooms} room{searchForm.rooms > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Guidelines Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Info className="w-5 h-5" />
                    <span>Booking Guidelines</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p><strong>Check-in:</strong> Usually starts at 3:00 PM. Early check-in may be available upon request</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p><strong>Check-out:</strong> Usually before 11:00 AM. Late check-out may be available for an additional fee</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p><strong>Cancellation:</strong> Free cancellation policies vary by hotel and rate type</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p><strong>ID Required:</strong> Valid government-issued photo ID required at check-in</p>
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
                    <div>
                      <Label htmlFor="contactFirstName">First Name *</Label>
                      <Input
                        id="contactFirstName"
                        value={contact.firstName}
                        onChange={(e) => updateContact('firstName', e.target.value)}
                        className={errors.contactFirstName ? 'border-red-500' : ''}
                      />
                      {errors.contactFirstName && <p className="text-red-500 text-xs mt-1">{errors.contactFirstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="contactLastName">Last Name *</Label>
                      <Input
                        id="contactLastName"
                        value={contact.lastName}
                        onChange={(e) => updateContact('lastName', e.target.value)}
                        className={errors.contactLastName ? 'border-red-500' : ''}
                      />
                      {errors.contactLastName && <p className="text-red-500 text-xs mt-1">{errors.contactLastName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">Email *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={contact.email}
                        onChange={(e) => updateContact('email', e.target.value)}
                        className={errors.contactEmail ? 'border-red-500' : ''}
                      />
                      {errors.contactEmail && <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>}
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">Phone *</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => updateContact('phone', e.target.value)}
                        className={errors.contactPhone ? 'border-red-500' : ''}
                      />
                      {errors.contactPhone && <p className="text-red-500 text-xs mt-1">{errors.contactPhone}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Guest Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Guest Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {guests.map((guest, index) => (
                      <div key={guest.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            {guest.type === 'PRIMARY' ? 'Primary Guest' : `Guest ${index}`}
                          </h4>
                          <Badge variant="outline">
                            {guest.type === 'PRIMARY' ? 'Primary' : 'Additional'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Title *</Label>
                            <Select value={guest.title} onValueChange={(value: string) => updateGuest(index, 'title', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Mr">Mr</SelectItem>
                                <SelectItem value="Mrs">Mrs</SelectItem>
                                <SelectItem value="Ms">Ms</SelectItem>
                                <SelectItem value="Miss">Miss</SelectItem>
                                <SelectItem value="Dr">Dr</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>First Name *</Label>
                            <Input
                              value={guest.firstName}
                              onChange={(e) => updateGuest(index, 'firstName', e.target.value)}
                              className={errors[`${guest.type.toLowerCase()}GuestFirstName`] ? 'border-red-500' : ''}
                            />
                            {errors[`${guest.type.toLowerCase()}GuestFirstName`] && <p className="text-red-500 text-xs mt-1">{errors[`${guest.type.toLowerCase()}GuestFirstName`]}</p>}
                          </div>
                          <div>
                            <Label>Last Name *</Label>
                            <Input
                              value={guest.lastName}
                              onChange={(e) => updateGuest(index, 'lastName', e.target.value)}
                              className={errors[`${guest.type.toLowerCase()}GuestLastName`] ? 'border-red-500' : ''}
                            />
                            {errors[`${guest.type.toLowerCase()}GuestLastName`] && <p className="text-red-500 text-xs mt-1">{errors[`${guest.type.toLowerCase()}GuestLastName`]}</p>}
                          </div>
                        </div>
                        
                        {guest.type === 'PRIMARY' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Email *</Label>
                              <Input
                                type="email"
                                value={guest.email}
                                onChange={(e) => updateGuest(index, 'email', e.target.value)}
                                className={errors.primaryGuestEmail ? 'border-red-500' : ''}
                              />
                              {errors.primaryGuestEmail && <p className="text-red-500 text-xs mt-1">{errors.primaryGuestEmail}</p>}
                            </div>
                            <div>
                              <Label>Phone *</Label>
                              <Input
                                type="tel"
                                value={guest.phone}
                                onChange={(e) => updateGuest(index, 'phone', e.target.value)}
                                className={errors.primaryGuestPhone ? 'border-red-500' : ''}
                              />
                              {errors.primaryGuestPhone && <p className="text-red-500 text-xs mt-1">{errors.primaryGuestPhone}</p>}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Special Requests */}
              <Card>
                <CardHeader>
                  <CardTitle>Special Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                    <Textarea
                      id="specialRequests"
                      placeholder="Any special requests or requirements..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Room Rate</span>
                      <span className="font-medium">{formatCurrency(offer ? parseFloat(offer.price.total) : 0, offer?.price.currency || 'USD')}/night</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Nights</span>
                      <span className="font-medium">{nights}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Guests</span>
                      <span className="font-medium">{searchForm.adults}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rooms</span>
                      <span className="font-medium">{searchForm.rooms}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taxes & Fees</span>
                      <span className="font-medium">Included</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total Amount</span>
                        <span className="font-bold text-lg">{formatCurrency(totalPrice, offer?.price.currency || 'USD')}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleContinue}
                      disabled={isLoading}
                      className="w-full mt-6"
                    >
                      {isLoading ? 'Processing...' : 'Continue to Review'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
