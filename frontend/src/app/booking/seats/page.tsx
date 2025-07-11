'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FlightOffer, BookingPassenger, BookingContact, SeatSelection, MealSelection } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { getCityDisplayName } from '@/data/airportDatabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plane, Utensils } from 'lucide-react'
import { motion } from 'framer-motion'

interface BookingData {
  flight: FlightOffer
  passengers: BookingPassenger[]
  contact: BookingContact
}

// Mock seat map data
const generateSeatMap = () => {
  const seatMap = []
  const rows = 30
  const seatsPerRow = 6
  const seatLabels = ['A', 'B', 'C', 'D', 'E', 'F']
  
  for (let row = 1; row <= rows; row++) {
    for (let seat = 0; seat < seatsPerRow; seat++) {
      const seatNumber = `${row}${seatLabels[seat]}`
      const isWindow = seat === 0 || seat === 5
      const isAisle = seat === 2 || seat === 3
      const isOccupied = Math.random() < 0.3 // 30% chance of being occupied
      
      seatMap.push({
        id: seatNumber,
        row,
        seat: seatLabels[seat],
        type: isWindow ? 'WINDOW' : isAisle ? 'AISLE' : 'MIDDLE',
        isOccupied,
        price: isWindow ? 25 : isAisle ? 20 : 15
      })
    }
  }
  
  return seatMap
}

const mealOptions = [
  { value: 'REGULAR', label: 'Regular Meal', price: 0 },
  { value: 'VEGETARIAN', label: 'Vegetarian', price: 0 },
  { value: 'VEGAN', label: 'Vegan', price: 5 },
  { value: 'KOSHER', label: 'Kosher', price: 10 },
  { value: 'HALAL', label: 'Halal', price: 5 },
  { value: 'GLUTEN_FREE', label: 'Gluten Free', price: 8 }
]

export default function SeatSelectionPage() {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [seatMap] = useState(generateSeatMap())
  const [selectedSeats, setSelectedSeats] = useState<SeatSelection[]>([])
  const [selectedMeals, setSelectedMeals] = useState<MealSelection[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const savedBookingData = sessionStorage.getItem('confirmedBookingData')
    if (savedBookingData) {
      try {
        const data = JSON.parse(savedBookingData)
        setBookingData(data)
        
        // Initialize meal selections
        const initialMeals = data.passengers.map((passenger: BookingPassenger) => ({
          passengerId: passenger.id,
          mealType: 'REGULAR',
          mealPrice: 0
        }))
        setSelectedMeals(initialMeals)
      } catch (error) {
        console.error('Error parsing booking data:', error)
        router.push('/flights')
      }
    } else {
      router.push('/flights')
    }
  }, [router])

  const handleSeatSelect = (seatId: string, passengerId: string) => {
    const seat = seatMap.find(s => s.id === seatId)
    if (!seat || seat.isOccupied) return

    // Remove existing seat selection for this passenger
    const updatedSeats = selectedSeats.filter(s => s.passengerId !== passengerId)
    
    // Add new seat selection
    updatedSeats.push({
      passengerId,
      seatNumber: seatId,
      seatPrice: seat.price,
      seatType: seat.type as 'WINDOW' | 'AISLE' | 'MIDDLE'
    })
    
    setSelectedSeats(updatedSeats)
  }

  const handleMealSelect = (passengerId: string, mealType: string) => {
    const meal = mealOptions.find(m => m.value === mealType)
    if (!meal) return

    const updatedMeals = selectedMeals.map(m => 
      m.passengerId === passengerId 
        ? { ...m, mealType: mealType as MealSelection['mealType'], mealPrice: meal.price }
        : m
    )
    
    setSelectedMeals(updatedMeals)
  }

  const getSeatColor = (seat: { id: string; isOccupied: boolean }, passengerId?: string) => {
    if (seat.isOccupied) return 'bg-red-200 text-red-800 cursor-not-allowed'
    
    const isSelected = selectedSeats.some(s => s.seatNumber === seat.id)
    const isSelectedByCurrentPassenger = selectedSeats.some(s => s.seatNumber === seat.id && s.passengerId === passengerId)
    
    if (isSelectedByCurrentPassenger) return 'bg-blue-500 text-white'
    if (isSelected) return 'bg-yellow-200 text-yellow-800'
    
    return 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'
  }

  const calculateTotalExtras = () => {
    const seatTotal = selectedSeats.reduce((sum, seat) => sum + (seat.seatPrice || 0), 0)
    const mealTotal = selectedMeals.reduce((sum, meal) => sum + (meal.mealPrice || 0), 0)
    return seatTotal + mealTotal
  }

  const handleProceedToPayment = () => {
    setIsLoading(true)
    
    // Store final booking data
    const finalBookingData = {
      ...bookingData,
      extras: {
        seats: selectedSeats,
        meals: selectedMeals
      },
      totalExtras: calculateTotalExtras()
    }
    
    sessionStorage.setItem('finalBookingData', JSON.stringify(finalBookingData))
    router.push('/booking/final')
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seat selection...</p>
        </div>
      </div>
    )
  }

  const { flight, passengers } = bookingData
  const segments = flight.itineraries[0].segments
  const firstSegment = segments[0]
  const lastSegment = segments[segments.length - 1]
  const totalPrice = parseFloat(flight.price.total)
  const extrasTotal = calculateTotalExtras()
  const finalTotal = totalPrice + extrasTotal

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
              <span>Book Flight</span>
              <span>›</span>
              <span>Review Details</span>
              <span>›</span>
              <span className="text-blue-600 font-medium">Select Seats & Meals</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Select Your Seats & Meals</h1>
            <p className="text-gray-600 mt-1">Choose your preferred seats and meal options</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Seat Map */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plane className="w-5 h-5" />
                    <span>Seat Map - {getCityDisplayName(firstSegment.departure.iataCode)} to {getCityDisplayName(lastSegment.arrival.iataCode)}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Legend */}
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded"></div>
                        <span>Selected</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
                        <span>Occupied</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-200 border border-yellow-300 rounded"></div>
                        <span>Selected by Others</span>
                      </div>
                    </div>

                    {/* Seat Map Grid */}
                    <div className="max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-7 gap-1 text-xs">
                        {/* Header */}
                        <div className="text-center font-semibold">Row</div>
                        <div className="text-center font-semibold">A</div>
                        <div className="text-center font-semibold">B</div>
                        <div className="text-center font-semibold">C</div>
                        <div className="text-center font-semibold">D</div>
                        <div className="text-center font-semibold">E</div>
                        <div className="text-center font-semibold">F</div>

                        {/* Seats */}
                        {Array.from({ length: 30 }, (_, rowIndex) => {
                          const row = rowIndex + 1
                          const rowSeats = seatMap.filter(s => s.row === row)
                          
                          return (
                            <React.Fragment key={row}>
                              <div className="text-center font-semibold py-2">{row}</div>
                              {rowSeats.map(seat => (
                                <div key={seat.id} className="p-1">
                                  <div
                                    className={`w-8 h-8 rounded border text-center text-xs font-semibold flex items-center justify-center ${getSeatColor(seat, passengers[0]?.id)}`}
                                    onClick={() => !seat.isOccupied && handleSeatSelect(seat.id, passengers[0]?.id)}
                                  >
                                    {seat.seat}
                                  </div>
                                </div>
                              ))}
                            </React.Fragment>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Meal Selection */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Utensils className="w-5 h-5" />
                    <span>Meal Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {passengers.map((passenger) => (
                      <div key={passenger.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{passenger.firstName} {passenger.lastName}</p>
                          <p className="text-sm text-gray-600">{passenger.type.toLowerCase()}</p>
                        </div>
                        <div className="w-48">
                          <Select 
                            value={selectedMeals.find(m => m.passengerId === passenger.id)?.mealType || 'REGULAR'}
                            onValueChange={(value: string) => handleMealSelect(passenger.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {mealOptions.map(meal => (
                                <SelectItem key={meal.value} value={meal.value}>
                                  {meal.label} {meal.price > 0 && `(+$${meal.price})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
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
                    
                    {selectedSeats.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Seat Selection</span>
                          <span className="font-medium">
                            {formatCurrency(selectedSeats.reduce((sum, seat) => sum + (seat.seatPrice || 0), 0), flight.price.currency)}
                          </span>
                        </div>
                        {selectedSeats.map(seat => (
                          <div key={seat.passengerId} className="text-xs text-gray-500 flex justify-between">
                            <span>Seat {seat.seatNumber}</span>
                            <span>+{formatCurrency(seat.seatPrice || 0, flight.price.currency)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {selectedMeals.some(m => (m.mealPrice || 0) > 0) && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Meal Upgrades</span>
                          <span className="font-medium">
                            {formatCurrency(selectedMeals.reduce((sum, meal) => sum + (meal.mealPrice || 0), 0), flight.price.currency)}
                          </span>
                        </div>
                        {selectedMeals.filter(m => (m.mealPrice || 0) > 0).map(meal => (
                          <div key={meal.passengerId} className="text-xs text-gray-500 flex justify-between">
                            <span>{meal.mealType}</span>
                            <span>+{formatCurrency(meal.mealPrice || 0, flight.price.currency)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total Amount</span>
                        <span className="font-bold text-lg">{formatCurrency(finalTotal, flight.price.currency)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">Selected Seats: {selectedSeats.length}/{passengers.length}</p>
                      <p className="text-xs text-gray-600">Meal Preferences: {selectedMeals.length}/{passengers.length}</p>
                    </div>
                    
                    <Button 
                      onClick={handleProceedToPayment}
                      disabled={isLoading || selectedSeats.length < passengers.length}
                      className="w-full mt-6"
                    >
                      {isLoading ? 'Processing...' : 'Proceed to Payment'}
                    </Button>
                    
                    {selectedSeats.length < passengers.length && (
                      <p className="text-xs text-red-600 text-center">
                        Please select seats for all passengers
                      </p>
                    )}
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
