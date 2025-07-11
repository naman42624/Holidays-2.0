'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export default function FlightSelectionDebug() {
  const router = useRouter()
  const [clickCount, setClickCount] = useState(0)
  
  const handleDirectNavigation = () => {
    console.log('Direct navigation clicked')
    setClickCount(prev => prev + 1)
    router.push('/booking/flight')
  }
  
  const handleMotionNavigation = () => {
    console.log('Motion navigation clicked')
    setClickCount(prev => prev + 1)
    router.push('/booking/flight')
  }
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted - this should not happen!')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Flight Selection Debug</h1>
        
        <div className="space-y-8">
          {/* Test 1: Direct button */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test 1: Direct Button</h2>
            <Button 
              type="button"
              onClick={handleDirectNavigation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
            >
              Direct Navigation (Click count: {clickCount})
            </Button>
          </div>
          
          {/* Test 2: Motion wrapped button */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test 2: Motion Wrapped Button</h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Button 
                type="button"
                onClick={handleMotionNavigation}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
              >
                Motion Navigation (Click count: {clickCount})
              </Button>
            </motion.div>
          </div>
          
          {/* Test 3: Inside form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test 3: Inside Form</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <input type="text" placeholder="Test input" className="border p-2 rounded" />
                <div className="space-x-4">
                  <Button 
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3"
                  >
                    Submit Form (should not navigate)
                  </Button>
                  <Button 
                    type="button"
                    onClick={() => {
                      console.log('Button in form clicked')
                      setClickCount(prev => prev + 1)
                      router.push('/booking/flight')
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
                  >
                    Navigate from Form (Click count: {clickCount})
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
