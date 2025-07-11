'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, Server, Database, Shield } from 'lucide-react'
import api, { endpoints } from '@/lib/api'

interface HealthCheck {
  service: string
  status: 'checking' | 'success' | 'error'
  message?: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export default function TestPage() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    { service: 'Backend API', status: 'checking', icon: Server },
    { service: 'Database', status: 'checking', icon: Database },
    { service: 'Authentication', status: 'checking', icon: Shield }
  ])

  const updateHealthCheck = (service: string, status: 'success' | 'error', message?: string) => {
    setHealthChecks(prev => prev.map(check => 
      check.service === service ? { ...check, status, message } : check
    ))
  }

  const runHealthChecks = useCallback(async () => {
    // Reset all to checking
    setHealthChecks(prev => prev.map(check => ({ ...check, status: 'checking' as const })))

    // Test Backend API
    try {
      const response = await api.get('/health')
      if (response.status === 200) {
        updateHealthCheck('Backend API', 'success', 'API is responding')
      } else {
        updateHealthCheck('Backend API', 'error', 'API returned unexpected status')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect'
      updateHealthCheck('Backend API', 'error', errorMessage)
    }

    // Test Database (through backend)
    try {
      const response = await api.get(endpoints.locations.popularDestinations)
      if (response.status === 200) {
        updateHealthCheck('Database', 'success', 'Database connection working')
      } else {
        updateHealthCheck('Database', 'error', 'Database query failed')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Database connection failed'
      updateHealthCheck('Database', 'error', errorMessage)
    }

    // Test Authentication (if logged in)
    try {
      const token = localStorage.getItem('authToken')
      if (token) {
        const response = await api.get(endpoints.auth.profile)
        if (response.status === 200) {
          updateHealthCheck('Authentication', 'success', 'User authenticated')
        } else {
          updateHealthCheck('Authentication', 'error', 'Authentication failed')
        }
      } else {
        updateHealthCheck('Authentication', 'success', 'No authentication required')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Auth check failed'
      updateHealthCheck('Authentication', 'error', errorMessage)
    }
  }, [])

  useEffect(() => {
    runHealthChecks()
  }, [runHealthChecks])

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusColor = (status: HealthCheck['status']) => {
    switch (status) {
      case 'checking':
        return 'border-blue-200 bg-blue-50'
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            System Health Check
          </h1>
          <p className="text-gray-600">
            Testing connectivity to backend services
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          {healthChecks.map((check) => {
            const Icon = check.icon
            return (
              <Card key={check.service} className={`${getStatusColor(check.status)} transition-colors`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className="w-6 h-6 text-gray-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{check.service}</h3>
                        {check.message && (
                          <p className="text-sm text-gray-600">{check.message}</p>
                        )}
                      </div>
                    </div>
                    {getStatusIcon(check.status)}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Test individual services or run full health check</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runHealthChecks}
              className="w-full"
              disabled={healthChecks.some(check => check.status === 'checking')}
            >
              {healthChecks.some(check => check.status === 'checking') ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Health Checks...
                </>
              ) : (
                'Run Health Checks'
              )}
            </Button>

            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => window.location.href = '/flights'}>
                Test Flight Search
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/hotels'}>
                Test Hotel Search
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/activities'}>
                Test Activity Search
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/profile'}>
                Test Profile Page
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>Available backend endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Flights</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• GET /api/flights/search</li>
                  <li>• GET /api/flights/offers</li>
                  <li>• GET /api/flights/destinations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Hotels</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• GET /api/hotels/search</li>
                  <li>• GET /api/hotels/offers</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Activities</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• GET /api/activities/search</li>
                  <li>• GET /api/activities/points-of-interest</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Authentication</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• POST /api/auth/login</li>
                  <li>• POST /api/auth/register</li>
                  <li>• GET /api/auth/profile</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
