'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function TestNavigationPage() {
  const router = useRouter()

  const testNavigation = () => {
    console.log('Testing navigation...')
    
    // Test with sessionStorage
    sessionStorage.setItem('testData', JSON.stringify({ test: 'value' }))
    
    // Test navigation
    router.push('/booking/flight')
  }

  const testWindowNavigation = () => {
    console.log('Testing window navigation...')
    window.location.href = '/booking/flight'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Navigation Test</h1>
        
        <div className="space-y-4">
          <div>
            <Button 
              onClick={testNavigation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
            >
              Test Router Navigation
            </Button>
          </div>
          
          <div>
            <Button 
              onClick={testWindowNavigation}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
            >
              Test Window Navigation
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
