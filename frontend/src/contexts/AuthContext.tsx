'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthData } from '@/types'
import api, { endpoints } from '@/lib/api'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthData>
  register: (userData: RegisterData) => Promise<AuthData>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<User>
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth data on mount
    const checkAuthState = async () => {
      try {
        // Make sure we're on the client side
        if (typeof window === 'undefined') {
          setLoading(false)
          return
        }

        const storedToken = localStorage.getItem('authToken')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
          // Validate the token with the server
          try {
            // Make a request to the profile endpoint to validate token
            const response = await api.get(endpoints.auth.profile)
            // If successful, update user data with the latest from server
            setToken(storedToken)
            setUser(response.data.data)
            // Update stored user data with fresh data
            localStorage.setItem('user', JSON.stringify(response.data.data))
          } catch (validationError) {
            console.error('Token validation failed:', validationError)
            // Token is invalid, clear auth data
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
            setToken(null)
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Error checking auth state:', error)
        // Clear potentially corrupted data only if on client side
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
        }
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuthState()
  }, [])

  const login = async (email: string, password: string): Promise<AuthData> => {
    try {
      console.log('Attempting login with:', { email })
      const response = await api.post(endpoints.auth.login, { email, password })
      console.log('Login response:', response.data)
      const authData: AuthData = response.data.data

      setUser(authData.user)
      setToken(authData.token)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', authData.token)
        localStorage.setItem('user', JSON.stringify(authData.user))
      }

      return authData
    } catch (error: unknown) {
      console.error('Login error:', error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } }
        console.error('Login error response:', axiosError.response?.data)
        throw new Error(axiosError.response?.data?.error || 'Login failed')
      }
      throw new Error(error instanceof Error ? error.message : 'Login failed')
    }
  }

  const register = async (userData: RegisterData): Promise<AuthData> => {
    try {
      const response = await api.post(endpoints.auth.register, userData)
      const authData: AuthData = response.data.data

      setUser(authData.user)
      setToken(authData.token)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', authData.token)
        localStorage.setItem('user', JSON.stringify(authData.user))
      }

      return authData
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } }
        throw new Error(axiosError.response?.data?.error || 'Registration failed')
      }
      throw new Error(error instanceof Error ? error.message : 'Registration failed')
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    }
  }

  const updateProfile = async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await api.put(endpoints.auth.profile, userData)
      const updatedUser: User = response.data.data.user

      setUser(updatedUser)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser))
      }

      return updatedUser
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { error?: string } } }
        throw new Error(axiosError.response?.data?.error || 'Profile update failed')
      }
      throw new Error(error instanceof Error ? error.message : 'Profile update failed')
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
