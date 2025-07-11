'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, addDays } from 'date-fns'
import { Activity, Location, ApiResponse } from '@/types'
import api, { endpoints } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Calendar, Users, Search, Tag } from 'lucide-react'

// Import new UI components
import { colors } from '@/styles/designSystem'
import SmoothTransition from '@/components/ui/SmoothTransition'
import ActivityCard from '@/components/ui/ActivityCard'
import EnhancedSearchInput from '@/components/ui/EnhancedSearchInput'

const activitySearchSchema = z.object({
  destination: z.string().min(3, 'Destination is required'),
  date: z.string().optional(),
  travelers: z.number().min(1, 'At least 1 traveler required').max(20, 'Maximum 20 travelers'),
  category: z.string().optional()
})

type ActivitySearchFormData = z.infer<typeof activitySearchSchema>

export default function ActivitiesPage() {
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [activities, setActivities] = useState<Activity[]>([])
  const [locationSuggestions, setLocationSuggestions] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  
  // Simple filter state for activities
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState(0)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ActivitySearchFormData>({
    resolver: zodResolver(activitySearchSchema),
    defaultValues: {
      travelers: 2,
      date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      category: 'all'
    }
  })

  // Search activities
  const onSubmit = useCallback(async () => {
    setIsSearching(true)
    setSearchError('')
    setActivities([])

    try {
      if (!selectedLocation) {
        setSearchError('Please select a destination from the suggestions')
        return
      }

      const searchParams = {
        latitude: selectedLocation.coordinates.latitude,
        longitude: selectedLocation.coordinates.longitude,
        radius: 50
      }

      const response = await api.get(`${endpoints.activities.search}`, { params: searchParams })
      const result: ApiResponse<Activity[]> = response.data

      if (result.success && result.data) {
        setActivities(result.data)
      } else {
        setSearchError(result.error || 'Failed to search activities')
      }
    } catch (error) {
      console.error('Activity search error:', error)
      setSearchError('Failed to search activities. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }, [selectedLocation])

  // Load search data from homepage if available
  useEffect(() => {
    const savedSearchData = sessionStorage.getItem('activitiesSearchData')
    if (savedSearchData) {
      try {
        const searchData = JSON.parse(savedSearchData)
        if (searchData.destination) setValue('destination', searchData.destination)
        if (searchData.date) setValue('date', searchData.date)
        if (searchData.participants) setValue('travelers', searchData.participants)
        if (searchData.category) setValue('category', searchData.category)
        
        sessionStorage.removeItem('activitiesSearchData')
        
        if (searchData.destination) {
          // First search for location to get coordinates
          const searchLocation = async () => {
            try {
              const response = await api.get(`${endpoints.locations.search}?keyword=${encodeURIComponent(searchData.destination)}&subType=CITY&limit=1`)
              const data: ApiResponse<Location[]> = response.data
              
              if (data.success && data.data && data.data.length > 0) {
                const location = data.data[0]
                setSelectedLocation(location)
                
                // Trigger search immediately
                onSubmit()
              } else {
                console.error('Could not find coordinates for destination:', searchData.destination)
              }
            } catch (error) {
              console.error('Error searching for location coordinates:', error)
            }
          }
          
          searchLocation()
        }
      } catch (error) {
        console.error('Failed to load search data:', error)
      }
    }
  }, [setValue, setSelectedLocation, onSubmit])

  // Location search function
  const searchLocations = async (keyword: string) => {
    if (keyword.length < 2) return

    try {
      const response = await api.get(`${endpoints.locations.search}?keyword=${encodeURIComponent(keyword)}&subType=CITY&limit=5`)
      const data: ApiResponse<Location[]> = response.data
      
      if (data.success && data.data) {
        setLocationSuggestions(data.data)
      }
    } catch (error) {
      console.error('Location search error:', error)
    }
  }

  const handleLocationChange = (value: string) => {
    setValue('destination', value)
    searchLocations(value)
  }

  const selectLocation = (location: Location) => {
    setValue('destination', location.city)
    setSelectedLocation(location)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Search Form */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Destination */}
              <div className="relative flex-1 min-w-[250px]">
                <EnhancedSearchInput
                  value={watch('destination') || ''}
                  onChange={(value) => handleLocationChange(value)}
                  placeholder="Where to explore?"
                  suggestions={locationSuggestions}
                  onLocationSelect={selectLocation}
                  searchType="activities"
                  icon={<MapPin className="w-4 h-4" />}
                  className="h-10 text-sm"
                  error={errors.destination?.message}
                />
              </div>

              {/* Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  {...register('date')}
                  className="pl-10 h-10 text-sm min-w-[140px]"
                />
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>
                )}
              </div>

              {/* Travelers */}
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  {...register('travelers', { valueAsNumber: true })}
                  className="pl-10 pr-8 py-2 h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[120px]"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Traveler' : 'Travelers'}
                    </option>
                  ))}
                </select>
                {errors.travelers && (
                  <p className="text-red-500 text-xs mt-1">{errors.travelers.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  {...register('category')}
                  className="pl-10 pr-8 py-2 h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[140px]"
                >
                  <option value="all">All Categories</option>
                  <option value="tours">Tours & Sightseeing</option>
                  <option value="adventure">Adventure & Sports</option>
                  <option value="cultural">Cultural Experiences</option>
                  <option value="food">Food & Dining</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="nature">Nature & Wildlife</option>
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
                )}
              </div>

              {/* Search Button */}
              <Button
                type="submit"
                disabled={isSearching}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-10 text-sm font-medium"
              >
                {isSearching ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Searching...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Error */}
        {searchError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{searchError}</p>
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="mb-6 text-center">
            <div className="inline-flex items-center space-x-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Searching for activities...</span>
            </div>
          </div>
        )}

        {/* Activity Results */}
        <SmoothTransition isLoading={isSearching}>
          {activities.length > 0 && (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold" style={{ color: colors.gray[900] }}>
                  {activities.filter(activity => {
                    const categoryMatch = categoryFilter === 'all' || (activity.tags && activity.tags.includes(categoryFilter));
                    const ratingMatch = ratingFilter === 0 || (activity.rating && activity.rating >= ratingFilter);
                    return categoryMatch && ratingMatch;
                  }).length} activit{activities.length === 1 ? 'y' : 'ies'} found
                </h2>
              </div>

              {/* Simple Filters */}
              <div className="flex flex-wrap gap-4 p-4 rounded-lg" style={{ backgroundColor: colors.gray[50] }}>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium" style={{ color: colors.gray[700] }}>Category:</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                    style={{ 
                      borderColor: colors.gray[300],
                      backgroundColor: 'white',
                      color: colors.gray[900]
                    }}
                  >
                    <option value="all">All</option>
                    <option value="tours">Tours</option>
                    <option value="adventure">Adventure</option>
                    <option value="cultural">Cultural</option>
                    <option value="food">Food & Dining</option>
                    <option value="nature">Nature</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium" style={{ color: colors.gray[700] }}>Min Rating:</label>
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(parseInt(e.target.value))}
                    className="px-2 py-1 border rounded text-sm"
                    style={{ 
                      borderColor: colors.gray[300],
                      backgroundColor: 'white',
                      color: colors.gray[900]
                    }}
                  >
                    <option value="0">Any</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5</option>
                  </select>
                </div>
                <button
                  onClick={() => { setCategoryFilter('all'); setRatingFilter(0); }}
                  className="px-3 py-1 text-sm rounded transition-colors"
                  style={{ 
                    backgroundColor: colors.gray[200],
                    color: colors.gray[700]
                  }}
                >
                  Clear
                </button>
              </div>

              {/* Activity Cards */}
              <div className="grid gap-6">
                {activities.filter(activity => {
                  const categoryMatch = categoryFilter === 'all' || (activity.tags && activity.tags.includes(categoryFilter));
                  const ratingMatch = ratingFilter === 0 || (activity.rating && activity.rating >= ratingFilter);
                  return categoryMatch && ratingMatch;
                }).map((activity, index) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    index={index}
                    onSelect={(activity) => {
                      // Handle activity selection
                      console.log('Selected activity:', activity.id);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </SmoothTransition>

        {/* No Results */}
        {!isSearching && activities.length === 0 && !searchError && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 mx-auto mb-4" style={{ color: colors.gray[300] }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: colors.gray[900] }}>
              No activities found
            </h3>
            <p style={{ color: colors.gray[500] }}>
              Try adjusting your search criteria or location
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
