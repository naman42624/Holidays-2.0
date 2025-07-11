'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import api, { endpoints } from '@/lib/api'
import { User } from '@/types'

export default function DebugProfilePage() {
  const { user } = useAuth()
  const [apiUser, setApiUser] = useState<{ user: User } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('Fetching profile from API...')
        const response = await api.get(endpoints.auth.profile)
        console.log('API Response:', response.data)
        setApiUser(response.data.data)
      } catch (error: unknown) {
        console.error('Error fetching profile:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      }
    }

    if (user) {
      fetchProfile()
    }
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile Debug Page</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Context User */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">User from Context</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {user ? JSON.stringify(user, null, 2) : 'No user in context'}
            </pre>
          </div>

          {/* API User */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">User from API</h2>
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                Error: {error}
              </div>
            )}
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {apiUser ? JSON.stringify(apiUser, null, 2) : 'Loading...'}
            </pre>
          </div>
        </div>

        {/* Data Comparison */}
        <div className="bg-white p-6 rounded-lg shadow mt-8">
          <h2 className="text-xl font-semibold mb-4">Data Analysis</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Context user exists:</strong> {user ? 'Yes' : 'No'}</p>
            <p><strong>API user exists:</strong> {apiUser ? 'Yes' : 'No'}</p>
            {user && (
              <>
                <p><strong>Context user has preferences:</strong> {user.preferences ? 'Yes' : 'No'}</p>
                <p><strong>Context user has profile:</strong> {user.profile ? 'Yes' : 'No'}</p>
                <p><strong>Context user firstName:</strong> {user.firstName || 'undefined'}</p>
                <p><strong>Context user lastName:</strong> {user.lastName || 'undefined'}</p>
                <p><strong>Context user email:</strong> {user.email || 'undefined'}</p>
              </>
            )}
            {apiUser && (
              <>
                <p><strong>API user has preferences:</strong> {apiUser.user?.preferences ? 'Yes' : 'No'}</p>
                <p><strong>API user has profile:</strong> {apiUser.user?.profile ? 'Yes' : 'No'}</p>
                <p><strong>API user firstName:</strong> {apiUser.user?.firstName || 'undefined'}</p>
                <p><strong>API user lastName:</strong> {apiUser.user?.lastName || 'undefined'}</p>
                <p><strong>API user email:</strong> {apiUser.user?.email || 'undefined'}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
