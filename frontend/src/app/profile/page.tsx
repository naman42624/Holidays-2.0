'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, ApiResponse } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useApiLoader } from '@/hooks/useLoaders'
import api, { endpoints } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User as UserIcon, Settings, Save, Lock, Mail, Phone, MapPin, Calendar, Globe, Clock, Loader2 } from 'lucide-react'

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional()
  }).optional(),
  preferences: z.object({
    currency: z.string().optional(),
    language: z.string().optional(),
    timezone: z.string().optional()
  }).optional()
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Global loader for API calls
  const { executeWithLoader } = useApiLoader()

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue,
    watch,
    formState: { errors: profileErrors }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: {
        street: '',
        city: '',
        country: '',
        postalCode: ''
      },
      preferences: {
        currency: 'INR',
        language: 'en',
        timezone: 'UTC'
      }
    }
  })

  // Watch form values for debugging
  const formValues = watch()

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors }
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  })

  // Route protection - redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      console.log('Loading profile, user:', user)
      if (!user) {
        console.log('No user found, skipping profile load')
        return
      }

      try {
        // Fetch fresh data from API (primary source)
        console.log('Fetching fresh profile data from API...')
        const response = await api.get(endpoints.auth.profile)
        const data: ApiResponse<User> = response.data
        console.log('API response:', data)

        if (data.success && data.data) {
          const userData = (data.data as { user?: User } & User).user || data.data // Handle both response formats
          console.log('Setting form values from API data:', userData)
          console.log('userData.firstName:', userData.firstName)
          console.log('userData.preferences:', userData.preferences)
          console.log('userData.profile:', userData.profile)
          
          // Set form values with fresh data - ensure we handle all possible structures
          setValue('firstName', userData.firstName || '')
          setValue('lastName', userData.lastName || '')
          setValue('email', userData.email || '')
          setValue('phone', userData.profile?.phone || '')
          setValue('dateOfBirth', userData.profile?.dateOfBirth ? new Date(userData.profile.dateOfBirth).toISOString().split('T')[0] : '')
          
          // Handle nested address object
          const address = userData.profile?.address || { street: '', city: '', country: '', postalCode: '' }
          setValue('address.street', address.street || '')
          setValue('address.city', address.city || '')
          setValue('address.country', address.country || '')
          setValue('address.postalCode', address.postalCode || '')
          
          // Handle preferences
          const preferences = userData.preferences || { currency: 'INR', language: 'en', timezone: 'UTC' }
          setValue('preferences.currency', preferences.currency || 'INR')
          setValue('preferences.language', preferences.language || 'en')
          setValue('preferences.timezone', preferences.timezone || 'UTC')
          
          console.log('Form values set successfully')
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
        // If API fails, still use context data
        if (user) {
          console.log('Using fallback context data:', user)
          setValue('firstName', user.firstName || '')
          setValue('lastName', user.lastName || '')
          setValue('email', user.email || '')
          setValue('phone', user.profile?.phone || '')
          setValue('dateOfBirth', user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0] : '')
          
          // Handle nested address object
          const address = user.profile?.address || { street: '', city: '', country: '', postalCode: '' }
          setValue('address.street', address.street || '')
          setValue('address.city', address.city || '')
          setValue('address.country', address.country || '')
          setValue('address.postalCode', address.postalCode || '')
          
          // Handle preferences
          const preferences = user.preferences || { currency: 'INR', language: 'en', timezone: 'UTC' }
          setValue('preferences.currency', preferences.currency || 'INR')
          setValue('preferences.language', preferences.language || 'en')
          setValue('preferences.timezone', preferences.timezone || 'UTC')
          
          console.log('Fallback form values set')
        } else {
          console.log('No user data available for fallback')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user, setValue])

  // Add debug effect to monitor form values
  useEffect(() => {
    console.log('=== Current Form Values ===')
    console.log(formValues)
  }, [formValues])

  // Add debug effect to monitor form state
  useEffect(() => {
    console.log('=== Form State Debug ===')
    console.log('User from context:', user)
    console.log('Loading state:', loading)
    console.log('Is Loading:', isLoading)
  }, [user, loading, isLoading])

  // Update profile
  const onSubmitProfile = async (data: ProfileFormData) => {
    setSaveMessage('')
    setSaveError('')

    try {
      await executeWithLoader(async () => {
        setIsSaving(true) // Also set local state for UI feedback
        
        const response = await api.put(endpoints.auth.profile, data)
        const apiResponse: ApiResponse = response.data

        if (apiResponse.success) {
          setSaveMessage('Profile updated successfully!')
          // Update the form with the latest user data after successful API call
          window.location.reload() // Simple way to refresh user data
        } else {
          setSaveError(apiResponse.error || 'Failed to update profile')
        }
        
        setIsSaving(false)
      }, 'Updating your profile...')
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update profile'
      setSaveError(errorMessage)
      setIsSaving(false)
    }
  }

  // Change password
  const onSubmitPassword = async (data: PasswordFormData) => {
    setPasswordMessage('')
    setPasswordError('')

    try {
      await executeWithLoader(async () => {
        setIsChangingPassword(true) // Also set local state for UI feedback
        
        const response = await api.post(endpoints.auth.changePassword, {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        })
        const apiResponse: ApiResponse = response.data

        if (apiResponse.success) {
          setPasswordMessage('Password changed successfully!')
          resetPassword()
        } else {
          setPasswordError(apiResponse.error || 'Failed to change password')
        }
        
        setIsChangingPassword(false)
      }, 'Changing your password...')
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to change password'
      setPasswordError(errorMessage)
      setIsChangingPassword(false)
    }
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="w-6 h-6 mr-2 animate-spin" />
          Checking authentication...
        </div>
      </div>
    )
  }

  // Show loading while loading profile data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="w-6 h-6 mr-2 animate-spin" />
          Loading profile...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Information */}
        {/* <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Debug Information</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>User exists:</strong> {user ? 'Yes' : 'No'}</p>
            <p><strong>User firstName:</strong> {user?.firstName || 'undefined'}</p>
            <p><strong>Form firstName:</strong> {formValues.firstName || 'empty'}</p>
            <p><strong>Form lastName:</strong> {formValues.lastName || 'empty'}</p>
            <p><strong>Form email:</strong> {formValues.email || 'empty'}</p>
          </div>
        </div> */}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserIcon className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your basic information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <Input {...registerProfile('firstName')} />
                      {profileErrors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <Input {...registerProfile('lastName')} />
                      {profileErrors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address
                    </label>
                    <Input type="email" {...registerProfile('email')} />
                    {profileErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone Number
                      </label>
                      <Input {...registerProfile('phone')} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Date of Birth
                      </label>
                      <Input type="date" {...registerProfile('dateOfBirth')} />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Address
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <Input {...registerProfile('address.street')} />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <Input {...registerProfile('address.city')} />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <Input {...registerProfile('address.country')} />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Postal Code
                          </label>
                          <Input {...registerProfile('address.postalCode')} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      <Settings className="w-4 h-4 inline mr-1" />
                      Preferences
                    </h4>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Currency
                        </label>
                        <select {...registerProfile('preferences.currency')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="CAD">CAD - Canadian Dollar</option>
                          <option value="AUD">AUD - Australian Dollar</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Globe className="w-4 h-4 inline mr-1" />
                          Language
                        </label>
                        <select {...registerProfile('preferences.language')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="it">Italian</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Timezone
                        </label>
                        <select {...registerProfile('preferences.timezone')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                          <option value="Europe/London">London</option>
                          <option value="Europe/Paris">Paris</option>
                          <option value="Asia/Tokyo">Tokyo</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  {saveMessage && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-green-600 text-sm">{saveMessage}</p>
                    </div>
                  )}

                  {saveError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-600 text-sm">{saveError}</p>
                    </div>
                  )}

                  {/* Save Button */}
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <Input type="password" {...registerPassword('currentPassword')} />
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <Input type="password" {...registerPassword('newPassword')} />
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <Input type="password" {...registerPassword('confirmPassword')} />
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  {/* Messages */}
                  {passwordMessage && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-green-600 text-sm">{passwordMessage}</p>
                    </div>
                  )}

                  {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-600 text-sm">{passwordError}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Account Status</p>
                  <p className="text-sm text-green-600">Active</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Member Since</p>
                  <p className="text-sm text-gray-600">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Last Login</p>
                  <p className="text-sm text-gray-600">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
