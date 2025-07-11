'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, addDays } from 'date-fns'
import { Hotel, Location, ApiResponse } from '@/types'
import api, { endpoints } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Building, MapPin, Calendar, Users, Search, Star, Wifi, Car, Coffee, Dumbbell } from 'lucide-react'

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
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [locationSuggestions, setLocationSuggestions] = useState<Location[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
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
        
        if (searchData.destination && searchData.checkIn && searchData.checkOut) {
          setTimeout(() => {
            handleSubmit(onSubmit)()
          }, 500)
        }
      } catch (error) {
        console.error('Failed to load search data:', error)
      }
    }
  }, [setValue, handleSubmit])

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
    setShowSuggestions(true)
    searchLocations(value)
  }

  const selectLocation = (location: Location) => {
    setValue('destination', location.city)
    setShowSuggestions(false)
  }

  const onSubmit = async (data: HotelSearchFormData) => {
    setIsSearching(true)
    setSearchError('')
    setHotels([])

    try {
      const searchParams = {
        cityCode: data.destination,
        checkInDate: data.checkIn,
        checkOutDate: data.checkOut,
        adults: data.adults,
        roomQuantity: data.rooms
      }

      const response = await api.get(`${endpoints.hotels.search}`, { params: searchParams })
      const result: ApiResponse<Hotel[]> = response.data

      if (result.success && result.data) {
        setHotels(result.data)
      } else {
        setSearchError(result.error || 'Failed to search hotels')
      }
    } catch (error) {
      console.error('Hotel search error:', error)
      setSearchError('Failed to search hotels. Please try again.')
    } finally {
      setIsSearching(false)
    }
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
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  {...register('destination')}
                  placeholder="Destination (City or Hotel)"
                  className="pl-10 h-10 text-sm"
                  onChange={(e) => handleLocationChange(e.target.value)}
                />
                {errors.destination && (
                  <p className="text-red-500 text-xs mt-1">{errors.destination.message}</p>
                )}
              </div>

              {/* Check-in Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  {...register('checkIn')}
                  className="pl-10 h-10 text-sm min-w-[140px]"
                />
                {errors.checkIn && (
                  <p className="text-red-500 text-xs mt-1">{errors.checkIn.message}</p>
                )}
              </div>

              {/* Check-out Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  {...register('checkOut')}
                  className="pl-10 h-10 text-sm min-w-[140px]"
                />
                {errors.checkOut && (
                  <p className="text-red-500 text-xs mt-1">{errors.checkOut.message}</p>
                )}
              </div>

              {/* Guests */}
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  {...register('adults', { valueAsNumber: true })}
                  className="pl-10 pr-8 py-2 h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[100px]"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
                {errors.adults && (
                  <p className="text-red-500 text-xs mt-1">{errors.adults.message}</p>
                )}
              </div>

              {/* Rooms */}
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  {...register('rooms', { valueAsNumber: true })}
                  className="pl-10 pr-8 py-2 h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[100px]"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Room' : 'Rooms'}
                    </option>
                  ))}
                </select>
                {errors.rooms && (
                  <p className="text-red-500 text-xs mt-1">{errors.rooms.message}</p>
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

          {/* Location Suggestions */}
          {showSuggestions && locationSuggestions.length > 0 && (
            <div className="absolute top-16 left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
              {locationSuggestions.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => selectLocation(location)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{location.name}</div>
                      <div className="text-xs text-gray-500">{location.detailedName}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
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
              <span className="text-gray-600">Searching for hotels...</span>
            </div>
          </div>
        )}

        {/* Hotel Results */}
        {hotels.length > 0 && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {hotels.length} hotel{hotels.length !== 1 ? 's' : ''} found
              </h2>
            </div>

            {/* Hotel Cards */}
            <div className="grid gap-4">
              {hotels.map((hotel) => (
                <div key={hotel.hotelId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex">
                    {/* Hotel Image Placeholder */}
                    <div className="w-48 h-32 bg-gray-200 flex items-center justify-center">
                      <Building className="w-12 h-12 text-gray-400" />
                    </div>
                    
                    {/* Hotel Details */}
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{hotel.name}</h3>
                          <div className="flex items-center space-x-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < (hotel.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-500 ml-1">
                              {hotel.rating}/5
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {hotel.address.lines.join(', ')}, {hotel.address.cityName}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {hotel.offers && hotel.offers.length > 0 
                              ? formatCurrency(parseFloat(hotel.offers[0].price.total), hotel.offers[0].price.currency)
                              : 'Price unavailable'
                            }
                          </div>
                          <div className="text-sm text-gray-500">per night</div>
                        </div>
                      </div>
                      
                      {/* Amenities */}
                      <div className="flex items-center space-x-4 mb-3">
                        {hotel.amenities?.includes('WiFi') && <Wifi className="w-4 h-4 text-gray-400" />}
                        {hotel.amenities?.includes('Parking') && <Car className="w-4 h-4 text-gray-400" />}
                        {hotel.amenities?.includes('Restaurant') && <Coffee className="w-4 h-4 text-gray-400" />}
                        {hotel.amenities?.includes('Gym') && <Dumbbell className="w-4 h-4 text-gray-400" />}
                      </div>
                      
                      {/* Book Button */}
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!isSearching && hotels.length === 0 && !searchError && (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hotels found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or dates
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
