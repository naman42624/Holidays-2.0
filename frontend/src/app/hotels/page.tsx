'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, addDays } from 'date-fns'
import { Hotel, Location, ApiResponse } from '@/types'
import api, { endpoints } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building, MapPin, Calendar, Users, Search, Loader2 } from 'lucide-react'
import HotelLoader from '@/components/HotelLoader'

// Import new UI components
import { colors } from '@/styles/designSystem'
import SmoothTransition from '@/components/ui/SmoothTransition'
import HotelCard from '@/components/ui/HotelCard'
import EnhancedSearchInput from '@/components/ui/EnhancedSearchInput'

const hotelSearchSchema = z.object({
  destination: z.string().min(3, 'Destination is required'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  adults: z.number().min(1, 'At least 1 adult required').max(9, 'Maximum 9 adults'),
  children: z.number().min(0).max(9, 'Maximum 9 children'),
  rooms: z.number().min(1, 'At least 1 room required').max(5, 'Maximum 5 rooms')
}).refine((data) => {
  const checkIn = new Date(data.checkIn)
  const checkOut = new Date(data.checkOut)
  return checkOut > checkIn
}, {
  message: "Check-out date must be after check-in date",
  path: ["checkOut"]
})

type HotelSearchFormData = z.infer<typeof hotelSearchSchema>

export default function HotelsPage() {
  const router = useRouter()
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [locationSuggestions, setLocationSuggestions] = useState<Location[]>([])
  
  // Filter state for hotels
  const [filters, setFilters] = useState({
    maxPrice: 20000,
    minRating: 0
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<HotelSearchFormData>({
    resolver: zodResolver(hotelSearchSchema),
    defaultValues: {
      adults: 2,
      children: 0,
      rooms: 1,
      checkIn: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      checkOut: format(addDays(new Date(), 3), 'yyyy-MM-dd')
    }
  })

  const onSubmit = useCallback(async (data: HotelSearchFormData) => {
    setIsSearching(true)
    setSearchError('')
    setHotels([])

    try {
      const extractCityCode = (destinationString: string) => {
        const matchingLocation = locationSuggestions.find(loc => 
          destinationString.includes(loc.city)
        )
        if (matchingLocation) {
          return matchingLocation.cityCode
        }
        return destinationString.split(',')[0].trim().slice(0, 3).toUpperCase()
      }

      const searchParams = {
        cityCode: extractCityCode(data.destination),
        checkInDate: data.checkIn,
        checkOutDate: data.checkOut,
        adults: data.adults,
        ...(data.children > 0 && { children: data.children }),
        rooms: data.rooms,
        currency: 'INR'
      }

      const response = await api.get(endpoints.hotels.search, { params: searchParams })
      const apiResponse: ApiResponse<Hotel[]> = response.data

      if (apiResponse.success && apiResponse.data) {
        setHotels(apiResponse.data)
      } else {
        setSearchError(apiResponse.error || 'No hotels found')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to search hotels'
      setSearchError(errorMessage)
    } finally {
      setIsSearching(false)
    }
  }, [locationSuggestions])

  // Load search data from homepage if available
  useEffect(() => {
    const savedSearchData = sessionStorage.getItem('hotelsSearchData')
    if (savedSearchData) {
      try {
        const searchData = JSON.parse(savedSearchData)
        if (searchData.destination) setValue('destination', searchData.destination)
        if (searchData.checkIn) setValue('checkIn', searchData.checkIn)
        if (searchData.checkOut) setValue('checkOut', searchData.checkOut)
        if (searchData.guests) setValue('adults', searchData.guests)
        if (searchData.rooms) setValue('rooms', searchData.rooms)
        
        sessionStorage.removeItem('hotelsSearchData')
        
        // Immediately trigger search
        if (searchData.destination && searchData.checkIn && searchData.checkOut) {
          onSubmit({
            destination: searchData.destination,
            checkIn: searchData.checkIn,
            checkOut: searchData.checkOut,
            adults: searchData.guests || 1,
            children: 0,
            rooms: searchData.rooms || 1
          })
        }
      } catch (error) {
        console.error('Failed to load search data:', error)
      }
    }
  }, [setValue, handleSubmit, onSubmit])

  const handleDestinationChange = async (value: string) => {
    setValue('destination', value)
    if (value.length < 2) {
      return
    }

    // Skip search if it looks like a selected location (contains comma)
    if (value.includes(',')) {
      return
    }

    try {
      const response = await api.get(`${endpoints.locations.search}?keyword=${encodeURIComponent(value)}&subType=CITY&limit=5`)
      const data: ApiResponse<Location[]> = response.data
      
      if (data.success && data.data) {
        setLocationSuggestions(data.data)
      }
    } catch (error) {
      console.error('Location search error:', error)
    }
  }

  const selectLocation = (location: Location) => {
    setValue('destination', `${location.city}, ${location.country}`)
  }

  // Filter hotels
  const filteredHotels = hotels.filter(hotel => {
    const price = hotel.offers?.[0]?.price?.total ? parseFloat(hotel.offers[0].price.total) : 0
    const rating = hotel.rating || 0
    
    // If no price data, include the hotel (don't filter out based on price)
    const priceFilter = price === 0 || price <= filters.maxPrice
    const ratingFilter = rating >= filters.minRating
    
    return priceFilter && ratingFilter
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Search Form */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Destination */}
              <div className="relative flex-1 min-w-[200px]">
                <EnhancedSearchInput
                  value={watch('destination') || ''}
                  onChange={(value) => handleDestinationChange(value)}
                  placeholder="Where are you going?"
                  suggestions={locationSuggestions}
                  onLocationSelect={selectLocation}
                  searchType="hotels"
                  icon={<MapPin className="w-3 h-3 sm:w-4 sm:h-4" />}
                  className="h-10 text-sm"
                  error={errors.destination?.message}
                />
              </div>

              {/* Check-in Date */}
              <div className="relative">
                <Calendar className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <Input
                  type="date"
                  {...register('checkIn')}
                  className="pl-8 sm:pl-10 h-10 text-sm min-w-[140px]"
                />
                {errors.checkIn && (
                  <p className="text-red-500 text-xs mt-1">{errors.checkIn.message}</p>
                )}
              </div>

              {/* Check-out Date */}
              <div className="relative">
                <Calendar className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <Input
                  type="date"
                  {...register('checkOut')}
                  className="pl-8 sm:pl-10 h-10 text-sm min-w-[140px]"
                />
                {errors.checkOut && (
                  <p className="text-red-500 text-xs mt-1">{errors.checkOut.message}</p>
                )}
              </div>

              {/* Guests */}
              <div className="relative">
                <Users className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <select
                  {...register('adults', { valueAsNumber: true })}
                  className="pl-8 sm:pl-10 pr-8 py-2 h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[100px]"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
                {errors.adults && (
                  <p className="text-red-500 text-xs mt-1">{errors.adults.message}</p>
                )}
              </div>

              {/* Search Button */}
              <Button
                type="submit"
                disabled={isSearching}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-10 text-sm font-medium"
              >
                <div className="flex items-center space-x-2">
                  {isSearching ? <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" /> : <Search className="w-3 h-3 sm:w-4 sm:h-4" />}
                  <span className="text-sm">{isSearching ? 'Searching...' : 'Search'}</span>
                </div>
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading State */}
        {isSearching && (
          <HotelLoader location={watch('destination')} />
        )}

        {/* Search Error */}
        {!isSearching && searchError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{searchError}</p>
          </div>
        )}

        {/* Filters */}
        {!isSearching && hotels.length > 0 && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm" style={{ borderColor: colors.gray[200], borderWidth: '1px' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.gray[900] }}>Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.gray[700] }}>
                  Max Price: ₹{filters.maxPrice.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="2000"
                  max="50000"
                  step="1000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.gray[700] }}>
                  Min Rating: {filters.minRating} stars
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={filters.minRating}
                  onChange={(e) => setFilters(prev => ({ ...prev, minRating: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ maxPrice: 20000, minRating: 0 })}
                  className="w-full px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 transition-colors"
                  style={{ 
                    backgroundColor: colors.gray[100],
                    color: colors.gray[700],
                    borderColor: colors.gray[300],
                    borderWidth: '1px'
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hotel Results */}
        <SmoothTransition isLoading={isSearching}>
          {filteredHotels.length > 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold" style={{ color: colors.gray[900] }}>
                  {filteredHotels.length} hotel{filteredHotels.length !== 1 ? 's' : ''} found
                </h2>
              </div>

              <div className="grid gap-6">
                {filteredHotels.map((hotel, index) => (
                  <HotelCard
                    key={hotel.hotelId}
                    hotel={hotel}
                    index={index}
                    onSelect={(hotel) => {
                      console.log('Hotel selected:', hotel)
                      
                      // Navigate to hotel booking page
                      const formData = watch()
                      const bookingData = {
                        hotel,
                        searchForm: {
                          destination: formData.destination,
                          checkIn: formData.checkIn,
                          checkOut: formData.checkOut,
                          adults: formData.adults,
                          children: formData.children,
                          rooms: formData.rooms
                        }
                      }
                      
                      sessionStorage.setItem('hotelBookingData', JSON.stringify(bookingData))
                      router.push('/booking/hotel')
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </SmoothTransition>

        {/* No Results */}
        {!isSearching && filteredHotels.length === 0 && !searchError && (
          <div className="text-center py-12">
            <Building className="w-16 h-16 mx-auto mb-4" style={{ color: colors.gray[300] }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: colors.gray[900] }}>
              No hotels found
            </h3>
            <p style={{ color: colors.gray[500] }}>
              Try adjusting your search criteria or dates
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
