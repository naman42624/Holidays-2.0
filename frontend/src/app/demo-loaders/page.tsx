'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useLoading, useLoadingState } from '@/contexts/LoadingContext'
import { useApiLoader } from '@/hooks/useLoaders'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading, LoadingCard, InlineLoader, SkeletonLoader } from '@/components/ui/loading'
import FlightLoader from '@/components/ui/FlightLoader'
import FullScreenLoader from '@/components/ui/FullScreenLoader'

export default function LoadersDemo() {
  const [showInlineLoader, setShowInlineLoader] = useState(false)
  const [showSkeletonLoader, setShowSkeletonLoader] = useState(false)
  const [showFlightLoader, setShowFlightLoader] = useState(false)
  const [showLocalFullScreen, setShowLocalFullScreen] = useState(false)

  // Global loading hooks
  const { showLoader, hideLoader, setLoadingMessage } = useLoading()
  const { executeWithLoader, executeWithProgressLoader } = useApiLoader()
  const loadingState = useLoadingState()

  const simulateApiCall = () => {
    return new Promise(resolve => setTimeout(resolve, 3000))
  }

  const demoGlobalLoader = () => {
    showLoader('Global loader is active...')
    setTimeout(() => {
      setLoadingMessage('Still working...')
    }, 1500)
    setTimeout(() => {
      hideLoader()
    }, 3000)
  }

  const demoApiLoader = async () => {
    try {
      await executeWithLoader(simulateApiCall, 'Processing your request...')
      alert('API call completed!')
    } catch {
      alert('API call failed!')
    }
  }

  const demoProgressLoader = async () => {
    const messages = [
      'Initializing request...',
      'Connecting to server...',
      'Processing data...',
      'Finalizing response...'
    ]
    
    try {
      await executeWithProgressLoader(simulateApiCall, messages)
      alert('Progress API call completed!')
    } catch {
      alert('Progress API call failed!')
    }
  }

  const demoLoadingState = () => {
    loadingState.start('Using loading state hook...')
    setTimeout(() => {
      loadingState.updateMessage('Almost done...')
    }, 1500)
    setTimeout(() => {
      loadingState.stop()
    }, 3000)
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header with navigation */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Loading System Demo</h1>
        <p className="text-gray-600 mb-4">
          Comprehensive loading states and animations for the Amadeus Travel Platform
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/advanced-loading-demo">
            <Button variant="outline">
              View Advanced Demo →
            </Button>
          </Link>
          <Link href="https://github.com/yourusername/amadeus-travel-platform/blob/main/frontend/LOADING_SYSTEM.md" target="_blank">
            <Button variant="outline">
              📖 Loading Documentation
            </Button>
          </Link>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Loading Components Demo</h1>
        <p className="text-gray-600">
          Comprehensive showcase of all loading states and components
        </p>
      </div>

      {/* Global Loaders Section */}
      <Card>
        <CardHeader>
          <CardTitle>Global Full-Screen Loaders</CardTitle>
          <CardDescription>
            These loaders cover the entire screen and block all interaction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button onClick={demoGlobalLoader}>
              Demo Global Loader
            </Button>
            <Button onClick={demoApiLoader}>
              Demo API Loader
            </Button>
            <Button onClick={demoProgressLoader}>
              Demo Progress Loader
            </Button>
            <Button onClick={demoLoadingState}>
              Demo Loading State Hook
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inline Loaders Section */}
      <Card>
        <CardHeader>
          <CardTitle>Inline Loading Components</CardTitle>
          <CardDescription>
            Lightweight loaders for specific components and sections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Loading */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Basic Loading Spinner</h3>
            <div className="border rounded p-4 bg-gray-50">
              <Loading message="Loading data..." size="md" />
            </div>
          </div>

          {/* Inline Loader */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Inline Loader</h3>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setShowInlineLoader(!showInlineLoader)}
                variant="outline"
              >
                Toggle Inline Loader
              </Button>
              {showInlineLoader && (
                <InlineLoader message="Processing..." />
              )}
            </div>
          </div>

          {/* Skeleton Loader */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Skeleton Loader</h3>
            <div className="flex items-center gap-4 mb-2">
              <Button 
                onClick={() => setShowSkeletonLoader(!showSkeletonLoader)}
                variant="outline"
              >
                Toggle Skeleton Loader
              </Button>
            </div>
            <div className="border rounded p-4">
              {showSkeletonLoader ? (
                <SkeletonLoader className="w-full" />
              ) : (
                <div>
                  <div className="h-4 mb-2">This is some loaded content</div>
                  <div className="h-4 mb-2 text-gray-600">With multiple lines of text</div>
                  <div className="h-4 text-gray-400">And different lengths</div>
                </div>
              )}
            </div>
          </div>

          {/* Loading Card */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Loading Card</h3>
            <LoadingCard message="Loading card content..." />
          </div>
        </CardContent>
      </Card>

      {/* Specialized Loaders */}
      <Card>
        <CardHeader>
          <CardTitle>Specialized Loaders</CardTitle>
          <CardDescription>
            Context-specific loaders for enhanced user experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Flight Loader */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Flight Search Loader</h3>
            <div className="flex items-center gap-4 mb-4">
              <Button 
                onClick={() => setShowFlightLoader(!showFlightLoader)}
                variant="outline"
              >
                {showFlightLoader ? 'Hide' : 'Show'} Flight Loader
              </Button>
            </div>
            {showFlightLoader && (
              <div className="border rounded overflow-hidden">
                <FlightLoader 
                  origin="New York" 
                  destination="London" 
                  className="h-96"
                />
              </div>
            )}
          </div>

          {/* Local Full Screen Loader */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Local Full Screen Loader</h3>
            <div className="flex items-center gap-4 mb-4">
              <Button 
                onClick={() => setShowLocalFullScreen(!showLocalFullScreen)}
                variant="outline"
              >
                {showLocalFullScreen ? 'Hide' : 'Show'} Full Screen Loader
              </Button>
            </div>
            {showLocalFullScreen && (
              <div className="relative h-96 border rounded overflow-hidden">
                <FullScreenLoader 
                  message="Loading amazing content..." 
                  isVisible={showLocalFullScreen}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Guidelines</CardTitle>
          <CardDescription>
            When to use each type of loader
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Global Loaders</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Page transitions</li>
                <li>• Major API operations</li>
                <li>• Initial app loading</li>
                <li>• Authentication flows</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Inline Loaders</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Form submissions</li>
                <li>• Button actions</li>
                <li>• Component data fetching</li>
                <li>• Quick operations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Specialized Loaders</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Search operations (Flight Loader)</li>
                <li>• Context-specific tasks</li>
                <li>• Enhanced user engagement</li>
                <li>• Brand consistency</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Skeleton Loaders</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Content placeholders</li>
                <li>• List/grid loading</li>
                <li>• Progressive loading</li>
                <li>• Better perceived performance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
