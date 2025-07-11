'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FlightOffer, BookingPassenger, BookingContact } from '@/types'
import { formatCurrency, formatDuration } from '@/lib/utils'
import { getCityDisplayName } from '@/data/airportDatabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plane, Users, AlertCircle, Info } from 'lucide-react'
import { motion } from 'framer-motion'

export default function BookFlightPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasInitialized = useRef(false)
  const [flight, setFlight] = useState<FlightOffer | null>(null)
  const [passengers, setPassengers] = useState<BookingPassenger[]>([])
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
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Prevent multiple executions
    if (hasInitialized.current) {
      console.log('BookFlightPage: useEffect already ran, skipping')
      return
    }
    
    console.log('BookFlightPage: useEffect running')
    hasInitialized.current = true
    let hasData = false
    
    // First check sessionStorage for booking data
    const bookingData = sessionStorage.getItem('bookingData')
    console.log('BookFlightPage: sessionStorage data exists:', !!bookingData)
    
    if (bookingData) {
      try {
        console.log('BookFlightPage: parsing sessionStorage data')
        const parsedBookingData = JSON.parse(bookingData)
        console.log('BookFlightPage: parsed data:', parsedBookingData)
        
        setFlight(parsedBookingData.flight)
        
        const adultsCount = parsedBookingData.passengers?.adults || 1
        const childrenCount = parsedBookingData.passengers?.children || 0
        const infantsCount = parsedBookingData.passengers?.infants || 0
        
        console.log('BookFlightPage: passenger counts:', { adultsCount, childrenCount, infantsCount })
        
        // Initialize passenger array
        const passengerList: BookingPassenger[] = []
        
        // Add adults
        for (let i = 0; i < adultsCount; i++) {
          passengerList.push({
            id: `adult-${i}`,
            title: 'Mr',
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            gender: 'MALE',
            email: '',
            phone: '',
            nationality: '',
            type: 'ADULT'
          })
        }
        
        // Add children
        for (let i = 0; i < childrenCount; i++) {
          passengerList.push({
            id: `child-${i}`,
            title: 'Mr',
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            gender: 'MALE',
            email: '',
            phone: '',
            nationality: '',
            type: 'CHILD'
          })
        }
        
        // Add infants
        for (let i = 0; i < infantsCount; i++) {
          passengerList.push({
            id: `infant-${i}`,
            title: 'Mr',
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            gender: 'MALE',
            email: '',
            phone: '',
            nationality: '',
            type: 'INFANT'
          })
        }
        
        setPassengers(passengerList)
        hasData = true
        
        console.log('BookFlightPage: sessionStorage data loaded successfully')
        
        // Don't clean up sessionStorage immediately - keep it until booking is complete
        // This prevents issues with React strict mode double-rendering
      } catch (error) {
        console.error('BookFlightPage: Failed to load booking data from sessionStorage:', error)
      }
    }
    
    // Only check URL params if we don't have sessionStorage data
    if (!hasData) {
      console.log('BookFlightPage: checking URL params')
      const flightData = searchParams.get('flight')
      const adultsCount = parseInt(searchParams.get('adults') || '1')
      const childrenCount = parseInt(searchParams.get('children') || '0')
      const infantsCount = parseInt(searchParams.get('infants') || '0')

      console.log('BookFlightPage: URL params data exists:', !!flightData)

      if (flightData) {
        try {
          const parsedFlight = JSON.parse(decodeURIComponent(flightData))
          setFlight(parsedFlight)
          
          // Initialize passenger array
          const passengerList: BookingPassenger[] = []
          
          // Add adults
          for (let i = 0; i < adultsCount; i++) {
            passengerList.push({
              id: `adult-${i}`,
              title: 'Mr',
              firstName: '',
              lastName: '',
              dateOfBirth: '',
              gender: 'MALE',
              email: '',
              phone: '',
              nationality: '',
              type: 'ADULT'
            })
          }
          
          // Add children
          for (let i = 0; i < childrenCount; i++) {
            passengerList.push({
              id: `child-${i}`,
              title: 'Mr',
              firstName: '',
              lastName: '',
              dateOfBirth: '',
              gender: 'MALE',
              email: '',
              phone: '',
              nationality: '',
              type: 'CHILD'
            })
          }
          
          // Add infants
          for (let i = 0; i < infantsCount; i++) {
            passengerList.push({
              id: `infant-${i}`,
              title: 'Mr',
              firstName: '',
              lastName: '',
              dateOfBirth: '',
              gender: 'MALE',
              email: '',
              phone: '',
              nationality: '',
              type: 'INFANT'
            })
          }
          
          setPassengers(passengerList)
          hasData = true
          console.log('BookFlightPage: URL params data loaded successfully')
        } catch (error) {
          console.error('BookFlightPage: Error parsing flight data:', error)
        }
      }
    }
    
    // Only redirect if we have no data after trying both methods
    if (!hasData) {
      console.log('BookFlightPage: No flight data found, redirecting to flights page')
      setTimeout(() => {
        router.push('/flights')
      }, 100)
    } else {
      console.log('BookFlightPage: Flight data loaded successfully, staying on page')
    }
  }, [router, searchParams]) // Add required dependencies
  
  // Cleanup effect for when component unmounts
  useEffect(() => {
    return () => {
      // Only clean up if we're not going to the confirmation page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/booking/confirmation')) {
        console.log('BookFlightPage: Component unmounting, cleaning up sessionStorage')
        sessionStorage.removeItem('bookingData')
      }
    }
  }, []) // Intentionally empty - this should only run on mount/unmount

  const updatePassenger = (index: number, field: string, value: string) => {
    const updatedPassengers = [...passengers]
    const fieldPath = field.split('.')
    
    // Use proper type assertion for dynamic property access
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current = updatedPassengers[index] as unknown as Record<string, any>
    for (let i = 0; i < fieldPath.length - 1; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      current = current[fieldPath[i]] as Record<string, any>
    }
    current[fieldPath[fieldPath.length - 1]] = value
    
    setPassengers(updatedPassengers)
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
    
    // Validate passengers
    passengers.forEach((passenger, index) => {
      if (!passenger.firstName.trim()) newErrors[`passenger${index}FirstName`] = 'First name is required'
      if (!passenger.lastName.trim()) newErrors[`passenger${index}LastName`] = 'Last name is required'
      if (!passenger.dateOfBirth.trim()) newErrors[`passenger${index}DateOfBirth`] = 'Date of birth is required'
      if (!passenger.nationality.trim()) newErrors[`passenger${index}Nationality`] = 'Nationality is required'
      if (passenger.type === 'ADULT' && !passenger.email.trim()) newErrors[`passenger${index}Email`] = 'Email is required for adults'
      if (passenger.type === 'ADULT' && !passenger.phone.trim()) newErrors[`passenger${index}Phone`] = 'Phone is required for adults'
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    // Navigate to confirmation modal
    const bookingData = {
      flight,
      passengers,
      contact
    }
    
    // Store booking data in sessionStorage for the next step using a different key
    sessionStorage.setItem('confirmedBookingData', JSON.stringify(bookingData))
    
    // Clean up the original booking data since we're moving to the next step
    sessionStorage.removeItem('bookingData')
    console.log('BookFlightPage: Moving to confirmation, original sessionStorage cleaned up')
    
    router.push('/booking/confirmation')
  }

  if (!flight || !flight.itineraries || !flight.itineraries[0] || !flight.itineraries[0].segments || flight.itineraries[0].segments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flight details...</p>
        </div>
      </div>
    )
  }

  const segments = flight.itineraries[0].segments
  const firstSegment = segments[0]
  const lastSegment = segments[segments.length - 1]
  const totalPrice = parseFloat(flight.price.total)

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
              <span>Flights</span>
              <span>›</span>
              <span>Search Results</span>
              <span>›</span>
              <span className="text-blue-600 font-medium">Book Flight</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
            <p className="text-gray-600 mt-1">Please fill in the traveler details to proceed</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Flight Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plane className="w-5 h-5" />
                    <span>Flight Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {getCityDisplayName(firstSegment.departure.iataCode)} → {getCityDisplayName(lastSegment.arrival.iataCode)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(firstSegment.departure.at).toLocaleDateString()} • {formatDuration(flight.itineraries[0].duration)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {segments.length === 1 ? 'Direct Flight' : `${segments.length - 1} Stop${segments.length > 2 ? 's' : ''}`}
                      </Badge>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Departure</p>
                          <p className="font-medium">{new Date(firstSegment.departure.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-gray-600">{firstSegment.departure.iataCode}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Arrival</p>
                          <p className="font-medium">{new Date(lastSegment.arrival.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-gray-600">{lastSegment.arrival.iataCode}</p>
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
                    <span>Important Guidelines</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p><strong>Name on Ticket:</strong> Ensure names match exactly as on your passport/ID</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p><strong>Check-in:</strong> Arrive at airport at least 2 hours before domestic flights, 3 hours for international</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p><strong>Baggage:</strong> Check airline baggage policies for weight and size restrictions</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p><strong>COVID-19:</strong> Check latest travel requirements and health protocols</p>
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

              {/* Passenger Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Traveler Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {passengers.map((passenger, index) => (
                      <div key={passenger.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            {passenger.type === 'ADULT' ? 'Adult' : passenger.type === 'CHILD' ? 'Child' : 'Infant'} {index + 1}
                          </h4>
                          <Badge variant="outline">
                            {passenger.type.toLowerCase()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Title *</Label>
                            <Select value={passenger.title} onValueChange={(value: string) => updatePassenger(index, 'title', value)}>
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
                              value={passenger.firstName}
                              onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                              className={errors[`passenger${index}FirstName`] ? 'border-red-500' : ''}
                            />
                            {errors[`passenger${index}FirstName`] && <p className="text-red-500 text-xs mt-1">{errors[`passenger${index}FirstName`]}</p>}
                          </div>
                          <div>
                            <Label>Last Name *</Label>
                            <Input
                              value={passenger.lastName}
                              onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                              className={errors[`passenger${index}LastName`] ? 'border-red-500' : ''}
                            />
                            {errors[`passenger${index}LastName`] && <p className="text-red-500 text-xs mt-1">{errors[`passenger${index}LastName`]}</p>}
                          </div>
                          <div>
                            <Label>Date of Birth *</Label>
                            <Input
                              type="date"
                              value={passenger.dateOfBirth}
                              onChange={(e) => updatePassenger(index, 'dateOfBirth', e.target.value)}
                              className={errors[`passenger${index}DateOfBirth`] ? 'border-red-500' : ''}
                            />
                            {errors[`passenger${index}DateOfBirth`] && <p className="text-red-500 text-xs mt-1">{errors[`passenger${index}DateOfBirth`]}</p>}
                          </div>
                          <div>
                            <Label>Gender *</Label>
                            <Select value={passenger.gender} onValueChange={(value: string) => updatePassenger(index, 'gender', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MALE">Male</SelectItem>
                                <SelectItem value="FEMALE">Female</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Nationality *</Label>
                            <Input
                              value={passenger.nationality}
                              onChange={(e) => updatePassenger(index, 'nationality', e.target.value)}
                              className={errors[`passenger${index}Nationality`] ? 'border-red-500' : ''}
                              placeholder="e.g., Indian, American"
                            />
                            {errors[`passenger${index}Nationality`] && <p className="text-red-500 text-xs mt-1">{errors[`passenger${index}Nationality`]}</p>}
                          </div>
                        </div>
                        
                        {passenger.type === 'ADULT' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Email *</Label>
                              <Input
                                type="email"
                                value={passenger.email}
                                onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                                className={errors[`passenger${index}Email`] ? 'border-red-500' : ''}
                              />
                              {errors[`passenger${index}Email`] && <p className="text-red-500 text-xs mt-1">{errors[`passenger${index}Email`]}</p>}
                            </div>
                            <div>
                              <Label>Phone *</Label>
                              <Input
                                type="tel"
                                value={passenger.phone}
                                onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                                className={errors[`passenger${index}Phone`] ? 'border-red-500' : ''}
                              />
                              {errors[`passenger${index}Phone`] && <p className="text-red-500 text-xs mt-1">{errors[`passenger${index}Phone`]}</p>}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
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
                      <span className="text-sm text-gray-600">Flight Price</span>
                      <span className="font-medium">{formatCurrency(totalPrice, flight.price.currency)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Passengers</span>
                      <span className="font-medium">{passengers.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taxes & Fees</span>
                      <span className="font-medium">Included</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total Amount</span>
                        <span className="font-bold text-lg">{formatCurrency(totalPrice, flight.price.currency)}</span>
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
