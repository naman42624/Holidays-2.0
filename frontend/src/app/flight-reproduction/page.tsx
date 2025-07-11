'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'

export default function FlightPageReproduction() {
  const router = useRouter()
  const [searchResults, setSearchResults] = useState([
    {
      id: 'flight-1',
      price: { total: '15000', currency: 'INR' },
      itineraries: [{
        segments: [{
          departure: { iataCode: 'DEL', at: '2025-01-15T10:00:00' },
          arrival: { iataCode: 'BOM', at: '2025-01-15T12:00:00' },
          carrierCode: '6E',
          flightNumber: '2345'
        }]
      }]
    }
  ])

  const { handleSubmit, register, watch } = useForm({
    defaultValues: {
      from: 'Delhi',
      to: 'Mumbai',
      adults: 1,
      children: 0,
      infants: 0
    }
  })

  const onSubmit = (data: { from: string; to: string; adults: number; children: number; infants: number }) => {
    console.log('Form submitted:', data)
    // Simulate search results
    setSearchResults([
      {
        id: 'flight-search-result',
        price: { total: '18000', currency: 'INR' },
        itineraries: [{
          segments: [{
            departure: { iataCode: 'DEL', at: '2025-01-15T14:00:00' },
            arrival: { iataCode: 'BOM', at: '2025-01-15T16:00:00' },
            carrierCode: 'AI',
            flightNumber: '6789'
          }]
        }]
      }
    ])
  }

  const handleFlightSelection = (flight: typeof searchResults[0]) => {
    console.log('=== FLIGHT SELECTION FROM REPRODUCTION ===')
    console.log('Flight selected:', flight.id)
    
    try {
      // Store flight data
      const formData = watch()
      const bookingData = {
        flight: flight,
        passengers: {
          adults: formData.adults,
          children: formData.children,
          infants: formData.infants
        }
      }
      
      console.log('Storing booking data...')
      sessionStorage.setItem('bookingData', JSON.stringify(bookingData))
      console.log('Booking data stored successfully')
      
      // Navigate
      console.log('Attempting navigation to /booking/flight')
      router.push('/booking/flight')
      console.log('Navigation called')
      
    } catch (error) {
      console.error('Error in flight selection:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Form */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <input
                  {...register('from')}
                  className="w-full px-3 py-3 h-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200"
                  placeholder="From"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <input
                  {...register('to')}
                  className="w-full px-3 py-3 h-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200"
                  placeholder="To"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adults</label>
                <select
                  {...register('adults', { valueAsNumber: true })}
                  className="w-full px-3 py-3 h-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-200"
                >
                  <option value={1}>1 Adult</option>
                  <option value={2}>2 Adults</option>
                  <option value={3}>3 Adults</option>
                </select>
              </div>
              <div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  Search Flights
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold mb-6">Flight Page Reproduction</h1>
        
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Search Results:</h2>
            {searchResults.map((flight, index) => (
              <motion.div
                key={flight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Flight {flight.id}</h3>
                      <p className="text-sm text-gray-600">
                        {flight.itineraries[0].segments[0].carrierCode} {flight.itineraries[0].segments[0].flightNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">₹{flight.price.total}</div>
                      <div className="text-xs text-gray-500">per person</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <span>{flight.itineraries[0].segments[0].departure.iataCode} → {flight.itineraries[0].segments[0].arrival.iataCode}</span>
                    </div>
                    
                    <Button 
                      type="button"
                      onClick={(e) => {
                        console.log('Button clicked - preventing defaults')
                        e.preventDefault()
                        e.stopPropagation()
                        handleFlightSelection(flight)
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      Select Flight
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
