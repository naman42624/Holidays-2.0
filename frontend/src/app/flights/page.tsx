'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, addDays } from 'date-fns'
import { FlightOffer, Location, ApiResponse } from '@/types'
import api, { endpoints } from '@/lib/api'
import FlightLoader from '@/components/ui/FlightLoader'
import SmoothTransition from '@/components/ui/SmoothTransition'
import FlightCard from '@/components/ui/FlightCard'
import EnhancedSearchInput from '@/components/ui/EnhancedSearchInput'
import { FlightEmptyState, SearchEmptyState, ErrorEmptyState } from '@/components/ui/EmptyState'
import { searchAirports } from '@/data/airportDatabase'
import { useNotifications } from '@/components/ui/NotificationSystem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plane, MapPin, Calendar, Users, Search, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { colors, textColors } from '@/styles/designSystem'

const flightSearchSchema = z.object({
  from: z.string().min(3, 'Origin is required'),
  to: z.string().min(3, 'Destination is required'),
  departureDate: z.string().min(1, 'Departure date is required'),
  returnDate: z.string().optional(),
  adults: z.number().min(1, 'At least 1 adult required').max(9, 'Maximum 9 adults'),
  children: z.number().min(0).max(9, 'Maximum 9 children'),
  infants: z.number().min(0).max(9, 'Maximum 9 infants'),
  travelClass: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']),
  tripType: z.enum(['round-trip', 'one-way'])
})

type FlightSearchFormData = z.infer<typeof flightSearchSchema>

export default function FlightsPage() {
  const router = useRouter()
  const { addNotification } = useNotifications()
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [flightOffers, setFlightOffers] = useState<FlightOffer[]>([])
  const [filteredFlights, setFilteredFlights] = useState<FlightOffer[]>([])
  const [locationSuggestions, setLocationSuggestions] = useState<Location[]>([])
  const [searchOrigin, setSearchOrigin] = useState('')
  const [searchDestination, setSearchDestination] = useState('')
  const [filtersExpanded, setFiltersExpanded] = useState(false)
  const [compactSearchForm, setCompactSearchForm] = useState(false)
  
  // Form state for controlled inputs
  const [formState, setFormState] = useState({
    from: '',
    to: '',
    tripType: 'round-trip' as 'round-trip' | 'one-way'
  })

  // Sorting and filtering state
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure' | 'arrival'>('price')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filters, setFilters] = useState({
    maxPrice: '',
    maxDuration: '',
    airlines: [] as string[],
    stops: 'any' as 'any' | 'nonstop' | '1stop' | '2+stops',
    departureTime: 'any' as 'any' | 'morning' | 'afternoon' | 'evening' | 'night',
    arrivalTime: 'any' as 'any' | 'morning' | 'afternoon' | 'evening' | 'night'
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FlightSearchFormData>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
      adults: 1,
      children: 0,
      infants: 0,
      travelClass: 'ECONOMY',
      tripType: 'round-trip',
      departureDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      returnDate: format(addDays(new Date(), 8), 'yyyy-MM-dd')
    }
  })

  // Load search data from homepage if available
  useEffect(() => {
    const savedSearchData = sessionStorage.getItem('flightsSearchData')
    if (savedSearchData) {
      try {
        const searchData = JSON.parse(savedSearchData)
        
        if (searchData.from) setValue('from', searchData.from)
        if (searchData.to) setValue('to', searchData.to)
        if (searchData.departureDate) setValue('departureDate', searchData.departureDate)
        if (searchData.returnDate) setValue('returnDate', searchData.returnDate)
        if (searchData.passengers) setValue('adults', searchData.passengers)
        if (searchData.tripType) {
          setValue('tripType', searchData.tripType === 'roundtrip' ? 'round-trip' : 'one-way')
        }
        
        // Set form state for immediate display
        setFormState({
          from: searchData.from || '',
          to: searchData.to || '',
          tripType: searchData.tripType === 'roundtrip' ? 'round-trip' : 'one-way'
        })
        
        // Clean up sessionStorage after loading
        sessionStorage.removeItem('flightsSearchData')
        
        // Immediately trigger search with the saved data
        if (searchData.from && searchData.to && searchData.departureDate) {
          // Start loading immediately
          setIsSearching(true)
          
          // Trigger search with a small delay to ensure state is set
          setTimeout(() => {
            onSubmit({
              from: searchData.from,
              to: searchData.to,
              departureDate: searchData.departureDate,
              returnDate: searchData.returnDate,
              adults: searchData.passengers || 1,
              children: 0,
              infants: 0,
              travelClass: 'ECONOMY',
              tripType: searchData.tripType === 'roundtrip' ? 'round-trip' : 'one-way'
            })
          }, 100)
        }
      } catch (error) {
        console.error('Failed to load search data:', error)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue]) // Load search data from session storage

  // Location search functionality
  const handleLocationChange = async (value: string, field: 'from' | 'to') => {
    setValue(field, value)
    
    if (value.length < 2) {
      return
    }

    // Skip search if it looks like a selected location (contains comma or parentheses)
    if (value.includes(',') || value.includes('(')) {
      return
    }

    try {
      // First try the new airport database for faster results
      const airportResults = searchAirports(value)
      
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
      const response = await api.get(`${endpoints.locations.search}?keyword=${encodeURIComponent(value)}&subType=AIRPORT,CITY&limit=5`)
      const data: ApiResponse<Location[]> = response.data
      
      if (data.success && data.data) {
        setLocationSuggestions(data.data)
      }
    } catch (error) {
      console.error('Location search error:', error)
    }
  }

  // Helper functions for flight processing
  const extractCityCode = (locationString: string, matchingLocations: Location[]): string => {
    const matchingLocation = matchingLocations.find(loc => 
      locationString.toLowerCase().includes(loc.city.toLowerCase()) ||
      locationString.toLowerCase().includes(loc.name.toLowerCase()) ||
      locationString === loc.iataCode
    )
    
    if (matchingLocation) {
      return matchingLocation.iataCode || matchingLocation.cityCode
    } else {
      const match = locationString.match(/\(([A-Z]{3})\)/)
      if (match) {
        return match[1]
      } else {
        return locationString.slice(-3).toUpperCase()
      }
    }
  }

  const parseDuration = (duration: string): number => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
    if (match) {
      const hours = parseInt(match[1] || '0')
      const minutes = parseInt(match[2] || '0')
      return hours * 60 + minutes
    }
    return 0
  }

  const getTimeCategory = (isoDateTime: string): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date(isoDateTime).getHours()
    if (hour >= 6 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 18) return 'afternoon'
    if (hour >= 18 && hour < 24) return 'evening'
    return 'night'
  }

  // Apply filters and sorting
  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...flightOffers]

    // Apply filters
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice)
      filtered = filtered.filter(flight => parseFloat(flight.price.total) <= maxPrice)
    }

    if (filters.airlines.length > 0) {
      filtered = filtered.filter(flight => 
        flight.itineraries.some(itinerary => 
          itinerary.segments.some(segment => 
            filters.airlines.includes(segment.carrierCode)
          )
        )
      )
    }

    if (filters.maxDuration) {
      const maxDurationMinutes = parseInt(filters.maxDuration) * 60
      filtered = filtered.filter(flight => {
        const duration = parseDuration(flight.itineraries[0].duration)
        return duration <= maxDurationMinutes
      })
    }

    if (filters.stops !== 'any') {
      filtered = filtered.filter(flight => {
        const stops = flight.itineraries[0].segments.length - 1
        switch (filters.stops) {
          case 'nonstop': return stops === 0
          case '1stop': return stops === 1
          case '2+stops': return stops >= 2
          default: return true
        }
      })
    }

    if (filters.departureTime !== 'any') {
      filtered = filtered.filter(flight => 
        getTimeCategory(flight.itineraries[0].segments[0].departure.at) === filters.departureTime
      )
    }

    if (filters.arrivalTime !== 'any') {
      filtered = filtered.filter(flight => {
        const lastSegment = flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1]
        return getTimeCategory(lastSegment.arrival.at) === filters.arrivalTime
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: number | string, bValue: number | string
      
      switch (sortBy) {
        case 'price':
          aValue = parseFloat(a.price.total)
          bValue = parseFloat(b.price.total)
          break
        case 'duration':
          aValue = parseDuration(a.itineraries[0].duration)
          bValue = parseDuration(b.itineraries[0].duration)
          break
        case 'departure':
          aValue = new Date(a.itineraries[0].segments[0].departure.at).getTime()
          bValue = new Date(b.itineraries[0].segments[0].departure.at).getTime()
          break
        case 'arrival':
          const aLastSegment = a.itineraries[0].segments[a.itineraries[0].segments.length - 1]
          const bLastSegment = b.itineraries[0].segments[b.itineraries[0].segments.length - 1]
          aValue = new Date(aLastSegment.arrival.at).getTime()
          bValue = new Date(bLastSegment.arrival.at).getTime()
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    setFilteredFlights(filtered)
  }, [flightOffers, filters, sortBy, sortOrder])

  // Apply filters whenever filters or sorting changes
  useEffect(() => {
    if (flightOffers.length > 0) {
      applyFiltersAndSort()
    }
  }, [flightOffers, filters, sortBy, sortOrder, applyFiltersAndSort])

  const onSubmit = useCallback(async (data: FlightSearchFormData) => {
    setIsSearching(true)
    setSearchError('')
    setFlightOffers([])
    setFilteredFlights([])
    
    // Store search parameters for the flight loader
    setSearchOrigin(data.from)
    setSearchDestination(data.to)

    try {
      const originCode = extractCityCode(data.from, locationSuggestions)
      const destinationCode = extractCityCode(data.to, locationSuggestions)

      const searchParams = {
        originLocationCode: originCode,
        destinationLocationCode: destinationCode,
        departureDate: data.departureDate,
        adults: data.adults,
        ...(data.children && data.children > 0 && { children: data.children }),
        ...(data.infants && data.infants > 0 && { infants: data.infants }),
        travelClass: data.travelClass,
        ...(data.tripType === 'round-trip' && data.returnDate && { returnDate: data.returnDate }),
        oneWay: data.tripType === 'one-way',
        currencyCode: 'INR',
        max: 50
      }

      const response = await api.get(`${endpoints.flights.search}`, { params: searchParams })
      const apiResponse: ApiResponse<FlightOffer[]> = response.data

      if (apiResponse.success && apiResponse.data) {
        setFlightOffers(apiResponse.data)
        setFilteredFlights(apiResponse.data)
      } else {
        setSearchError(apiResponse.error || 'No flights found')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to search flights'
      setSearchError(errorMessage)
    } finally {
      setIsSearching(false)
      setCompactSearchForm(true) // Set to compact mode after search completes
    }
  }, [locationSuggestions])

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.gray[50] }}>
      {/* Enhanced Search Form */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          {/* Search Form Toggle Button (visible only after search) */}
          {flightOffers.length > 0 && (
            <div className="flex justify-between items-center py-2">
              <div className="flex-1">
                {compactSearchForm && (
                  <div className="text-sm font-medium">
                    <span className="text-gray-600">
                      {formState.from} → {formState.to}
                      <span className="mx-2">|</span>
                      {watch('departureDate')}
                      {formState.tripType === 'round-trip' && watch('returnDate') && (
                        <>
                          <span className="mx-2">-</span>
                          {watch('returnDate')}
                        </>
                      )}
                      <span className="mx-2">|</span>
                      {watch('adults')} {watch('adults') === 1 ? 'adult' : 'adults'}
                    </span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setCompactSearchForm(!compactSearchForm)}
                className="flex items-center text-amber-600 hover:text-amber-800 ml-2"
              >
                <span className="mr-1 text-sm">{compactSearchForm ? 'Modify' : 'Hide'}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transition-transform ${compactSearchForm ? '' : 'transform rotate-180'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Collapsible Form Content */}
          <div className={`transition-all duration-300 ease-in-out ${compactSearchForm ? 'max-h-0 overflow-hidden opacity-0 py-0' : 'max-h-[800px] opacity-100 py-4'}`}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Trip Type */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trip Type</label>
                  <select
                    {...register('tripType')}
                    className="w-full px-3 py-3 h-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200 bg-white"
                    onChange={(e) => {
                      const tripType = e.target.value as 'round-trip' | 'one-way'
                      setValue('tripType', tripType)
                      setFormState(prev => ({ ...prev, tripType }))
                      // Hide return date for one-way trips
                      if (tripType === 'one-way') {
                        setValue('returnDate', '')
                      }
                    }}
                  >
                    <option value="round-trip">Round Trip</option>
                    <option value="one-way">One Way</option>
                  </select>
                </div>

                {/* From */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <EnhancedSearchInput
                    placeholder="Departure"
                    value={formState.from}
                    onChange={(value) => {
                      setFormState(prev => ({ ...prev, from: value }))
                      setValue('from', value)
                      handleLocationChange(value, 'from')
                    }}
                    onLocationSelect={(location) => {
                      const locationValue = location.iataCode || location.name
                      setFormState(prev => ({ ...prev, from: locationValue }))
                      setValue('from', locationValue)
                    }}
                    suggestions={locationSuggestions}
                    searchType="flights"
                    icon={<Plane className="w-4 h-4 sm:w-5 sm:h-5" />}
                    error={errors.from?.message}
                  />
                </div>

                {/* To */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <EnhancedSearchInput
                    placeholder="Destination"
                    value={formState.to}
                    onChange={(value) => {
                      setFormState(prev => ({ ...prev, to: value }))
                      setValue('to', value)
                      handleLocationChange(value, 'to')
                    }}
                    onLocationSelect={(location) => {
                      const locationValue = location.iataCode || location.name
                      setFormState(prev => ({ ...prev, to: locationValue }))
                      setValue('to', locationValue)
                    }}
                    suggestions={locationSuggestions}
                    searchType="flights"
                    icon={<MapPin className="w-4 h-4 sm:w-5 sm:h-5" />}
                    error={errors.to?.message}
                  />
                </div>

                {/* Departure Date */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departure</label>
                  <div className="relative">
                    <Calendar className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <Input
                      type="date"
                      {...register('departureDate')}
                      className="pl-10 sm:pl-12 h-10 sm:h-12 border-2 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-lg transition-all duration-200"
                    />
                  </div>
                  {errors.departureDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.departureDate.message}</p>
                  )}
                </div>

                {/* Return Date - Only show for round-trip */}
                {formState.tripType === 'round-trip' && (
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Return</label>
                    <div className="relative">
                      <Calendar className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      <Input
                        type="date"
                        {...register('returnDate')}
                        className="pl-10 sm:pl-12 h-10 sm:h-12 border-2 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-lg transition-all duration-200"
                      />
                    </div>
                    {errors.returnDate && (
                      <p className="text-red-500 text-xs mt-1">{errors.returnDate.message}</p>
                    )}
                  </div>
                )}

                {/* Passengers */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                  <div className="relative">
                    <Users className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <select
                      {...register('adults', { valueAsNumber: true })}
                      className="w-full pl-10 sm:pl-12 pr-4 py-3 h-10 sm:h-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200 bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Adult' : 'Adults'}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.adults && (
                    <p className="text-red-500 text-xs mt-1">{errors.adults.message}</p>
                  )}
                </div>

                {/* Search Button */}
                <div className="lg:col-span-1 flex items-end">
                  <Button
                    type="submit"
                    disabled={isSearching}
                    className="w-full h-10 sm:h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    {isSearching ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span className="text-sm sm:text-base">Searching...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base">Search Flights</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
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

        {/* Flight Search Loader */}
        {isSearching && (
          <FlightLoader 
            origin={searchOrigin || 'Origin'} 
            destination={searchDestination || 'Destination'} 
            className="mb-6"
          />
        )}
        
        {/* Mobile Filter Toggle */}
        {flightOffers.length > 0 && !isSearching && (
          <div className="mb-4 md:hidden">
            <button 
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="flex items-center justify-between w-full p-3 bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-gray-700">Filters & Sorting</span>
              </div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 text-amber-600 transition-transform duration-200 ${filtersExpanded ? 'transform rotate-180' : ''}`}
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Filters - Collapsible on mobile */}
        {flightOffers.length > 0 && !isSearching && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm" style={{ borderColor: colors.gray[200], borderWidth: '1px' }}>
            <button 
              onClick={() => setFiltersExpanded(!filtersExpanded)} 
              className="flex justify-between w-full items-center md:hidden mb-2"
            >
              <h3 className="text-lg font-semibold" style={{ color: colors.gray[900] }}>Filters</h3>
              <span className="text-amber-600">
                {filtersExpanded ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
            </button>
            
            {/* Always visible on desktop, toggleable on mobile */}
            <div className={`${filtersExpanded ? 'block' : 'hidden'} md:block`}>
              <h3 className="text-lg font-semibold mb-4 hidden md:block" style={{ color: colors.gray[900] }}>Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Max Price */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.gray[700] }}>
                    Max Price: ₹{filters.maxPrice || '50,000'}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={filters.maxPrice || 50000}
                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Max Duration */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.gray[700] }}>
                    Max Duration: {filters.maxDuration || 24}h
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    value={filters.maxDuration || 24}
                    onChange={(e) => setFilters({...filters, maxDuration: e.target.value})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Stops */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.gray[700] }}>Stops</label>
                  <select
                    value={filters.stops}
                    onChange={(e) => setFilters({...filters, stops: e.target.value as 'any' | 'nonstop' | '1stop' | '2+stops'})}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500"
                    style={{ 
                      borderColor: colors.gray[300],
                      backgroundColor: 'white',
                      color: colors.gray[900]
                    }}
                  >
                    <option value="any">Any</option>
                    <option value="nonstop">Non-stop</option>
                    <option value="1stop">1 stop</option>
                    <option value="2+stops">2+ stops</option>
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.gray[700] }}>Sort by</label>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder]
                      setSortBy(newSortBy)
                      setSortOrder(newSortOrder)
                    }}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500"
                    style={{ 
                      borderColor: colors.gray[300],
                      backgroundColor: 'white',
                      color: colors.gray[900]
                    }}
                  >
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="duration-asc">Duration: Short to Long</option>
                    <option value="duration-desc">Duration: Long to Short</option>
                    <option value="departure-asc">Departure: Early to Late</option>
                    <option value="departure-desc">Departure: Late to Early</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flight Results */}
        <SmoothTransition isLoading={isSearching}>
          {/* Loading State */}
          {isSearching && (
            <div className="flex justify-center items-center py-12">
              <FlightLoader 
                origin={formState.from || 'Origin'}
                destination={formState.to || 'Destination'}
              />
            </div>
          )}

          {/* Search Results */}
          {!isSearching && filteredFlights.length > 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold" style={{ color: textColors.primary }}>
                  {filteredFlights.length} flight{filteredFlights.length !== 1 ? 's' : ''} found
                </h2>
              </div>

              <div className="grid gap-6">
                {filteredFlights.map((flight, index) => (
                  <motion.div
                    key={flight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.3,
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                  >
                    <FlightCard
                      flight={flight}
                      index={index}
                      onSelect={async (flight) => {
                        console.log('Flight selected:', flight.id)
                        
                        try {
                          // Store flight data in sessionStorage
                          const formData = watch()
                          const bookingData = {
                            flight: flight,
                            passengers: {
                              adults: formData.adults,
                              children: formData.children,
                              infants: formData.infants
                            }
                          }
                          
                          console.log('Storing booking data:', bookingData)
                          sessionStorage.setItem('bookingData', JSON.stringify(bookingData))
                          
                          // Verify storage
                          const stored = sessionStorage.getItem('bookingData')
                          console.log('Verified stored data exists:', !!stored)
                          
                          // Navigate to booking page
                          console.log('Navigating to booking page...')
                          router.push('/booking/flight')
                          
                        } catch (error) {
                          console.error('Error in flight selection:', error)
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* No Results with Filters */}
          {!isSearching && filteredFlights.length === 0 && flightOffers.length > 0 && (
            <FlightEmptyState
              onNewSearch={() => {
                // Reset search form
                setFormState({ from: '', to: '', tripType: 'round-trip' })
                setSearchOrigin('')
                setSearchDestination('')
                setFlightOffers([])
                setFilteredFlights([])
                setCompactSearchForm(false) // Show full search form for new search
              }}
              onRefresh={() => {
                // Retry search with current criteria
                if (formState.from && formState.to) {
                  // Trigger search again
                  addNotification({
                    type: 'info',
                    title: 'Searching Again',
                    message: 'Refreshing your flight search...',
                    duration: 2000
                  })
                }
              }}
            />
          )}

          {/* No Initial Results */}
          {!isSearching && flightOffers.length === 0 && !searchError && (
            <SearchEmptyState
              searchType="flights"
              onGetStarted={() => {
                // Focus on the first input
                const input = document.querySelector('input[name="from"]') as HTMLInputElement
                input?.focus()
              }}
            />
          )}

          {/* Error State */}
          {!isSearching && searchError && (
            <ErrorEmptyState
              onRetry={() => {
                setSearchError('')
                // Retry the last search
                addNotification({
                  type: 'info',
                  title: 'Retrying Search',
                  message: 'Attempting to search again...',
                  duration: 2000
                })
              }}
            />
          )}
        </SmoothTransition>
      </div>
    </div>
  )
}
