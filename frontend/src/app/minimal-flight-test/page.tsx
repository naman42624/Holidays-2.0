'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function MinimalFlightCard() {
  const router = useRouter()
  
  const mockFlight = {
    id: 'test-flight-123',
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

  const handleFlightSelection = () => {
    console.log('=== FLIGHT SELECTION STARTED ===')
    console.log('Flight selected:', mockFlight.id)
    
    try {
      // Store flight data
      const bookingData = {
        flight: mockFlight,
        passengers: { adults: 1, children: 0, infants: 0 }
      }
      
      console.log('Storing booking data...')
      sessionStorage.setItem('bookingData', JSON.stringify(bookingData))
      console.log('Booking data stored successfully')
      
      // Navigate
      console.log('Attempting navigation to /booking/flight')
      router.push('/booking/flight')
      console.log('Navigation called - should redirect now')
      
      // If we reach here, navigation didn't happen immediately
      setTimeout(() => {
        console.log('Still here after 2 seconds - navigation might have failed')
      }, 2000)
      
    } catch (error) {
      console.error('Error in flight selection:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Minimal Flight Card Test</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">Test Flight</h3>
              <p className="text-sm text-gray-600">6E 2345</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">₹15,000</div>
              <div className="text-xs text-gray-500">per person</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <span>DEL → BOM</span>
            </div>
            
            <Button 
              type="button"
              onClick={handleFlightSelection}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
            >
              Select Flight
            </Button>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p className="text-sm text-gray-600">
            Open browser console to see navigation logs.
          </p>
        </div>
      </div>
    </div>
  )
}
