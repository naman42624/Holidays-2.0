'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, addDays } from 'date-fns'
import { Location, ApiResponse } from '@/types'
import api, { endpoints } from '@/lib/api'
import { searchAirports } from '@/data/airportDatabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import EnhancedSearchInput from '@/components/ui/EnhancedSearchInput'
import { 
  Plane, 
  Building, 
  MapPin, 
  Calendar, 
  Users, 
  Search
} from 'lucide-react'

type SearchType = 'flights' | 'hotels' | 'activities'

// Form schemas for validation
const flightSearchSchema = z.object({
  from: z.string().min(3, 'Origin is required'),
  to: z.string().min(3, 'Destination is required'),
  departureDate: z.string().min(1, 'Departure date is required'),
  returnDate: z.string().optional(),
  passengers: z.number().min(1, 'At least 1 passenger required').max(9, 'Maximum 9 passengers'),
  tripType: z.enum(['roundtrip', 'oneway'])
}).refine((data) => {
  if (data.tripType === 'roundtrip') {
    return data.returnDate && data.returnDate > data.departureDate
  }
  return true
}, {
  message: "Return date must be after departure date",
  path: ["returnDate"]
})

const hotelSearchSchema = z.object({
  destination: z.string().min(3, 'Destination is required'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests: z.number().min(1, 'At least 1 guest required').max(10, 'Maximum 10 guests'),
  rooms: z.number().min(1, 'At least 1 room required').max(5, 'Maximum 5 rooms')
}).refine((data) => {
  return new Date(data.checkOut) > new Date(data.checkIn)
}, {
  message: "Check-out date must be after check-in date",
  path: ["checkOut"]
})

const activitySearchSchema = z.object({
  destination: z.string().min(3, 'Destination is required'),
  date: z.string().optional(),
  participants: z.number().min(1, 'At least 1 participant required').max(20, 'Maximum 20 participants'),
  category: z.string().optional()
})

type FlightFormData = z.infer<typeof flightSearchSchema>
type HotelFormData = z.infer<typeof hotelSearchSchema>
type ActivityFormData = z.infer<typeof activitySearchSchema>

export default function CombinedSearchForm() {
  const router = useRouter()
  const [searchType, setSearchType] = useState<SearchType>('flights')
  const [isLoading, setIsLoading] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState<Location[]>([])

  // Form instances for each search type
  const flightForm = useForm<FlightFormData>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
      from: '',
      to: '',
      departureDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      returnDate: format(addDays(new Date(), 8), 'yyyy-MM-dd'),
      passengers: 1,
      tripType: 'roundtrip'
    }
  })

  const hotelForm = useForm<HotelFormData>({
    resolver: zodResolver(hotelSearchSchema),
    defaultValues: {
      destination: '',
      checkIn: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      checkOut: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
      guests: 2,
      rooms: 1
    }
  })

  const activityForm = useForm<ActivityFormData>({
    resolver: zodResolver(activitySearchSchema),
    defaultValues: {
      destination: '',
      date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      participants: 2,
      category: 'all'
    }
  })

  const searchTabs = [
    { id: 'flights', label: 'Flights', icon: Plane },
    { id: 'hotels', label: 'Hotels', icon: Building },
    { id: 'activities', label: 'Activities', icon: MapPin }
  ]

  // Location search functionality
  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([])
      return
    }

    // Skip search if it looks like a selected location (contains comma or parentheses)
    if (query.includes(',') || query.includes('(')) {
      return
    }

    try {
      // First try the local airport database for faster results
      const airportResults = searchAirports(query)
      
      if (airportResults.length > 0) {
        // Convert airport data to Location format
        const locationResults: Location[] = airportResults.map(airport => ({
          id: airport.code,
          name: airport.name,
          detailedName: `${airport.city}, ${airport.country}`,
          type: 'AIRPORT',
          iataCode: airport.code,
          city: airport.city,
          cityCode: airport.code,
          country: airport.country,
          countryCode: airport.country.substring(0, 2).toUpperCase(),
          coordinates: { latitude: 0, longitude: 0 }, // Default values
          timeZone: 'UTC',
          relevanceScore: 1.0
        }))
        
        setLocationSuggestions(locationResults)
        return
      }
      
      // Fallback to API search if no results from database
      const response = await api.get<ApiResponse<Location[]>>(
        `${endpoints.locations.search}?keyword=${encodeURIComponent(query)}&subType=AIRPORT,CITY&limit=5`
      )
      
      if (response.data.success && response.data.data) {
        setLocationSuggestions(response.data.data)
      }
    } catch (error) {
      console.error('Location search error:', error)
      setLocationSuggestions([])
    }
  }, [])

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLoading) return; // Prevent double submissions
    
    try {
      let isValid = false
      let searchData

      switch (searchType) {
        case 'flights':
          isValid = await flightForm.trigger()
          if (isValid) {
            searchData = flightForm.getValues()
            console.log('Flight form data:', searchData)
          } else {
            console.log('Flight form validation failed:', flightForm.formState.errors)
          }
          break
        case 'hotels':
          isValid = await hotelForm.trigger()
          if (isValid) {
            searchData = hotelForm.getValues()
            console.log('Hotel form data:', searchData)
          } else {
            console.log('Hotel form validation failed:', hotelForm.formState.errors)
          }
          break
        case 'activities':
          isValid = await activityForm.trigger()
          if (isValid) {
            searchData = activityForm.getValues()
            console.log('Activity form data:', searchData)
          } else {
            console.log('Activity form validation failed:', activityForm.formState.errors)
          }
          break
      }

      if (isValid && searchData) {
        // Store search data in sessionStorage for the target page to use
        const storageKey = `${searchType}SearchData`
        sessionStorage.setItem(storageKey, JSON.stringify(searchData))
        console.log(`Stored search data with key: ${storageKey}`, searchData)
        
        // Set loading state briefly for visual feedback
        setIsLoading(true)
        
        // Navigate immediately to provide instant feedback
        setTimeout(() => {
          router.push(`/${searchType}`)
        }, 100) // Very short delay just for visual feedback
      } else {
        console.log('Form validation failed or no search data')
      }
    } catch (error) {
      console.error('Search error:', error)
    }
  }

  const renderFlightForm = () => {
    const { register, watch, formState: { errors } } = flightForm
    const tripType = watch('tripType')

    return (
      <div className="space-y-4">
        {/* Trip Type Selection */}
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="roundtrip"
              {...register('tripType')}
              className="text-blue-600"
            />
            <span className="text-gray-700">Round Trip</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="oneway"
              {...register('tripType')}
              className="text-blue-600"
            />
            <span className="text-gray-700">One Way</span>
          </label>
        </div>

        {/* From and To Fields */}
        <div className="grid grid-cols-1 gap-4">
          <div className="relative">
            <EnhancedSearchInput
              placeholder="From (City or Airport)"
              value={flightForm.watch('from') || ''}
              onChange={(value) => {
                flightForm.setValue('from', value)
                searchLocations(value)
              }}
              onLocationSelect={(location) => {
                const locationValue = location.iataCode || location.name
                flightForm.setValue('from', locationValue)
              }}
              suggestions={locationSuggestions}
              searchType="flights"
              icon={<Plane className="w-4 h-4 sm:w-5 sm:h-5" />}
              error={errors.from?.message}
            />
            {errors.from && (
              <p className="text-red-500 text-sm mt-1">{errors.from.message}</p>
            )}
          </div>
          <div className="relative">
            <EnhancedSearchInput
              placeholder="To (City or Airport)"
              value={flightForm.watch('to') || ''}
              onChange={(value) => {
                flightForm.setValue('to', value)
                searchLocations(value)
              }}
              onLocationSelect={(location) => {
                const locationValue = location.iataCode || location.name
                flightForm.setValue('to', locationValue)
              }}
              suggestions={locationSuggestions}
              searchType="flights"
              icon={<MapPin className="w-4 h-4 sm:w-5 sm:h-5" />}
              error={errors.to?.message}
            />
            {errors.to && (
              <p className="text-red-500 text-sm mt-1">{errors.to.message}</p>
            )}
          </div>
        </div>

        {/* Date and Passengers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Calendar className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <Input
              type="date"
              {...register('departureDate')}
              className="pl-10 sm:pl-12 pr-4 py-3 h-10 sm:h-12 bg-white text-gray-800 border-2 border-gray-300 focus:border-gray-400 rounded-lg transition-all"
            />
            {errors.departureDate && (
              <p className="text-red-500 text-sm mt-1">{errors.departureDate.message}</p>
            )}
          </div>
          {tripType === 'roundtrip' && (
            <div className="relative">
              <Calendar className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <Input
                type="date"
                {...register('returnDate')}
                className="pl-10 sm:pl-12 pr-4 py-3 h-10 sm:h-12 bg-white text-gray-800 border-2 border-gray-300 focus:border-gray-400 rounded-lg transition-all"
              />
              {errors.returnDate && (
                <p className="text-red-500 text-sm mt-1">{errors.returnDate.message}</p>
              )}
            </div>
          )}
          <div className="relative">
            <Users className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <select
              {...register('passengers', { valueAsNumber: true })}
              className="w-full pl-10 sm:pl-12 pr-4 py-3 h-10 sm:h-12 bg-white text-gray-800 border-2 border-gray-300 focus:border-gray-400 rounded-lg transition-all appearance-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Passenger' : 'Passengers'}
                </option>
              ))}
            </select>
            {errors.passengers && (
              <p className="text-red-500 text-sm mt-1">{errors.passengers.message}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderHotelForm = () => {
    const { register, formState: { errors } } = hotelForm

    return (
      <div className="space-y-4">
        {/* Destination */}
        <div className="relative">
          <EnhancedSearchInput
            placeholder="Destination (City or Hotel)"
            value={hotelForm.watch('destination') || ''}
            onChange={(value) => {
              hotelForm.setValue('destination', value)
              searchLocations(value)
            }}
            onLocationSelect={(location) => {
              const locationValue = location.iataCode || location.name
              hotelForm.setValue('destination', locationValue)
            }}
            suggestions={locationSuggestions}
            searchType="hotels"
            icon={<MapPin className="w-4 h-4 sm:w-5 sm:h-5" />}
            error={errors.destination?.message}
          />
          {errors.destination && (
            <p className="text-red-500 text-sm mt-1">{errors.destination.message}</p>
          )}
        </div>

        {/* Check-in and Check-out */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Calendar className="absolute left-2 sm:left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
            <Input
              type="date"
              {...register('checkIn')}
              className="pl-8 sm:pl-10 bg-white/90 text-gray-800"
            />
            {errors.checkIn && (
              <p className="text-red-500 text-sm mt-1">{errors.checkIn.message}</p>
            )}
          </div>
          <div className="relative">
            <Calendar className="absolute left-2 sm:left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
            <Input
              type="date"
              {...register('checkOut')}
              className="pl-8 sm:pl-10 bg-white/90 text-gray-800"
            />
            {errors.checkOut && (
              <p className="text-red-500 text-sm mt-1">{errors.checkOut.message}</p>
            )}
          </div>
        </div>

        {/* Guests and Rooms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Users className="absolute left-2 sm:left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
            <select
              {...register('guests', { valueAsNumber: true })}
              className="w-full pl-8 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 bg-white/90 text-gray-800"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
            {errors.guests && (
              <p className="text-red-500 text-sm mt-1">{errors.guests.message}</p>
            )}
          </div>
          <div className="relative">
            <Building className="absolute left-2 sm:left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
            <select
              {...register('rooms', { valueAsNumber: true })}
              className="w-full pl-8 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 bg-white/90 text-gray-800"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Room' : 'Rooms'}
                </option>
              ))}
            </select>
            {errors.rooms && (
              <p className="text-red-500 text-sm mt-1">{errors.rooms.message}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderActivityForm = () => {
    const { register, formState: { errors } } = activityForm

    return (
      <div className="space-y-4">
        {/* Destination */}
        <div className="relative">
          <EnhancedSearchInput
            placeholder="Destination (City or Location)"
            value={activityForm.watch('destination') || ''}
            onChange={(value) => {
              activityForm.setValue('destination', value)
              searchLocations(value)
            }}
            onLocationSelect={(location) => {
              const locationValue = location.iataCode || location.name
              activityForm.setValue('destination', locationValue)
            }}
            suggestions={locationSuggestions}
            searchType="activities"
            icon={<MapPin className="w-4 h-4 sm:w-5 sm:h-5" />}
            error={errors.destination?.message}
          />
          {errors.destination && (
            <p className="text-red-500 text-sm mt-1">{errors.destination.message}</p>
          )}
        </div>

        {/* Date and Participants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Calendar className="absolute left-2 sm:left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
            <Input
              type="date"
              {...register('date')}
              className="pl-8 sm:pl-10 bg-white/90 text-gray-800"
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>
          <div className="relative">
            <Users className="absolute left-2 sm:left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
            <select
              {...register('participants', { valueAsNumber: true })}
              className="w-full pl-8 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 bg-white/90 text-gray-800"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Participant' : 'Participants'}
                </option>
              ))}
            </select>
            {errors.participants && (
              <p className="text-red-500 text-sm mt-1">{errors.participants.message}</p>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="relative">
          <select
            {...register('category')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 bg-white/90 text-gray-800"
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
            <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Search & Book Your Perfect Trip
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Search Type Tabs */}
          <div className="flex flex-wrap border-b border-gray-200">
            {searchTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSearchType(tab.id as SearchType)}
                  className={`flex-1 min-w-0 py-3 px-2 sm:px-4 text-center flex items-center justify-center space-x-1 sm:space-x-2 border-b-2 font-medium transition-colors ${
                    searchType === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base truncate">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Dynamic Form Content */}
          <div className="min-h-[200px] relative">
            {searchType === 'flights' && renderFlightForm()}
            {searchType === 'hotels' && renderHotelForm()}
            {searchType === 'activities' && renderActivityForm()}
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base sm:text-lg font-semibold"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm sm:text-base">Searching...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">
                  Search {searchType === 'flights' ? 'Flights' : 
                         searchType === 'hotels' ? 'Hotels' : 'Activities'}
                </span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
