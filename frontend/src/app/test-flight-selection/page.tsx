'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function SimpleFlightTest() {
  const router = useRouter()
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`])
    console.log(message)
  }

  const testFlightSelection = () => {
    addLog('Starting flight selection test...')
    
    // Simulate storing flight data
    const mockFlightData = {
      id: 'test-flight-123',
      price: { total: '15000', currency: 'INR' },
      itineraries: []
    }
    
    try {
      addLog('Storing flight data in sessionStorage...')
      sessionStorage.setItem('bookingData', JSON.stringify({
        flight: mockFlightData,
        passengers: { adults: 1, children: 0, infants: 0 }
      }))
      addLog('Flight data stored successfully')
      
      addLog('Attempting navigation...')
      router.push('/booking/flight')
      addLog('router.push() called - should navigate now')
      
    } catch (error) {
      addLog(`Error occurred: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Simple Flight Selection Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Flight Selection</h2>
          <Button 
            onClick={testFlightSelection}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
          >
            Select Test Flight
          </Button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Log</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono bg-gray-100 p-2 rounded">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
