'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, addDays } from 'date-fns'
import { FlightOffer, FlightSegment, Location, ApiResponse } from '@/types'
import api, { endpoints } from '@/lib/api'
import { formatCurrency, formatDuration } from '@/lib/utils'
import { useApiLoader } from '@/hooks/useLoaders'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plane, MapPin, Calendar, Users, Search, Loader2 } from 'lucide-react'

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
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [flightOffers, setFlightOffers] = useState<FlightOffer[]>([])
  const [filteredFlights, setFilteredFlights] = useState<FlightOffer[]>([])
  const [locationSuggestions, setLocationSuggestions] = useState<Location[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeField, setActiveField] = useState<'from' | 'to' | null>(null)
  
  // Store search parameters for loader - keeping setter for future use
  const [, setSearchParams] = useState<{origin: string, destination: string} | null>(null)

  // Global loader for API calls
  const { executeWithProgressLoader } = useApiLoader()

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
    const savedSearchData = sessionStorage.getItem('flightSearchData')
    if (savedSearchData) {
      try {
        const searchData = JSON.parse(savedSearchData)
        if (searchData.from) setValue('from', searchData.from)
        if (searchData.to) setValue('to', searchData.to)
        if (searchData.departureDate) setValue('departureDate', searchData.departureDate)
        if (searchData.returnDate) setValue('returnDate', searchData.returnDate)
        if (searchData.passengers) setValue('adults', searchData.passengers)
        if (searchData.tripType) setValue('tripType', searchData.tripType)
        
        sessionStorage.removeItem('flightSearchData')
        
        if (searchData.from && searchData.to && searchData.departureDate) {
          setTimeout(() => {
            const form = document.querySelector('form')
            if (form) {
              form.requestSubmit()
            }
          }, 500)
        }
      } catch (error) {
        console.error('Failed to load search data:', error)
      }
    }
  }, [setValue])

  // Location search functionality
  const handleLocationChange = async (value: string, field: 'from' | 'to') => {
    setValue(field, value)
    setActiveField(field)
    
    if (value.length < 2) {
      setShowSuggestions(false)
      return
    }

    // Skip search if it looks like a selected location (contains comma or parentheses)
    if (value.includes(',') || value.includes('(')) {
      setShowSuggestions(false)
      return
    }

    try {
      const response = await api.get(`${endpoints.locations.search}?keyword=${encodeURIComponent(value)}&subType=AIRPORT,CITY&limit=5`)
      const data: ApiResponse<Location[]> = response.data
      
      if (data.success && data.data) {
        setLocationSuggestions(data.data)
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Location search error:', error)
    }
  }

  const selectLocation = (location: Location) => {
    if (activeField) {
      setValue(activeField, location.iataCode || location.name)
      setShowSuggestions(false)
      setActiveField(null)
    }
  }

  // Helper functions for flight processing
  // Currently not used but kept for future reference
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const extractLocationCode = (locationString: string): string => {
    // Keeping this function but not using it currently
    return locationString.substring(0, 3);
  }

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

  // Currently not used but may be needed in future
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatDurationInHours = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
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

  // Get unique airlines for filter
  // This will be used later when we implement airline filtering
  useMemo(() => {
    const airlines = new Set<string>()
    flightOffers.forEach(flight => {
      flight.itineraries.forEach(itinerary => {
        itinerary.segments.forEach(segment => {
          airlines.add(segment.carrierCode)
        })
      })
    })
    return Array.from(airlines).sort()
  }, [flightOffers])

  const onSubmit = async (data: FlightSearchFormData) => {
    setIsSearching(true)
    setSearchError('')
    setFlightOffers([])
    setFilteredFlights([])

    try {
      const originCode = extractCityCode(data.from, locationSuggestions)
      const destinationCode = extractCityCode(data.to, locationSuggestions)
      
      setSearchParams({
        origin: originCode,
        destination: destinationCode
      })

      const searchParams = {
        originLocationCode: originCode,
        destinationLocationCode: destinationCode,
        departureDate: data.departureDate,
        adults: data.adults,
        ...(data.children && data.children > 0 && { children: data.children }),
        ...(data.infants && data.infants > 0 && { infants: data.infants }),
        travelClass: data.travelClass,
        ...(data.tripType === 'round-trip' && data.returnDate && { returnDate: data.returnDate }),
        currencyCode: 'INR',
        max: 50
      }

      const result = await executeWithProgressLoader(
        () => api.get(`${endpoints.flights.search}`, { params: searchParams }),
        [`Searching flights from ${originCode} to ${destinationCode}...`]
      )

      const apiResponse: ApiResponse<FlightOffer[]> = result.data

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
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Search Form */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* From */}
              <div className="relative flex-1 min-w-[200px]">
                <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  {...register('from')}
                  placeholder="From"
                  className="pl-10 h-10 text-sm"
                  onChange={(e) => handleLocationChange(e.target.value, 'from')}
                  onFocus={() => setActiveField('from')}
                />
                {errors.from && (
                  <p className="text-red-500 text-xs mt-1">{errors.from.message}</p>
                )}
              </div>

              {/* To */}
              <div className="relative flex-1 min-w-[200px]">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  {...register('to')}
                  placeholder="To"
                  className="pl-10 h-10 text-sm"
                  onChange={(e) => handleLocationChange(e.target.value, 'to')}
                  onFocus={() => setActiveField('to')}
                />
                {errors.to && (
                  <p className="text-red-500 text-xs mt-1">{errors.to.message}</p>
                )}
              </div>

              {/* Departure Date */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  {...register('departureDate')}
                  className="pl-10 h-10 text-sm min-w-[140px]"
                />
                {errors.departureDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.departureDate.message}</p>
                )}
              </div>

              {/* Passengers */}
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  {...register('adults', { valueAsNumber: true })}
                  className="pl-10 pr-8 py-2 h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[100px]"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Adult' : 'Adults'}
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
                {isSearching ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
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

        {/* Filters - Always show if we have original flights */}
        {flightOffers.length > 0 && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price: ₹{filters.maxPrice || '50,000'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  value={filters.maxPrice || 50000}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Max Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Duration: {filters.maxDuration || 24}h
                </label>
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={filters.maxDuration || 24}
                  onChange={(e) => setFilters({...filters, maxDuration: e.target.value})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Stops */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stops</label>
                <select
                  value={filters.stops}
                  onChange={(e) => setFilters({...filters, stops: e.target.value as "any" | "nonstop" | "1stop" | "2+stops"})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="any">Any</option>
                  <option value="nonstop">Non-stop</option>
                  <option value="1stop">1 stop</option>
                  <option value="2+stops">2+ stops</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder]
                    setSortBy(newSortBy)
                    setSortOrder(newSortOrder)
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        )}

        {/* Flight Results */}
        {filteredFlights.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {filteredFlights.length} flight{filteredFlights.length !== 1 ? 's' : ''} found
              </h2>
            </div>

            <div className="grid gap-6">
              {filteredFlights.map((flight) => (
                <div key={flight.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Flight {flight.id}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Duration: {formatDuration(flight.itineraries[0].duration)}
                        </p>
                        
                        {/* Flight segments */}
                        {flight.itineraries[0].segments.map((segment: FlightSegment, index: number) => (
                          <div key={index} className="mb-2">
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="font-medium">
                                {new Date(segment.departure.at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              <span className="text-gray-500">
                                {segment.departure.iataCode}
                              </span>
                              <span className="text-gray-400">→</span>
                              <span className="text-gray-500">
                                {segment.arrival.iataCode}
                              </span>
                              <span className="font-medium">
                                {new Date(segment.arrival.at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              <span className="text-gray-500">
                                {segment.carrierCode} {segment.flightNumber}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Price Section */}
                      <div className="ml-6 text-right">
                        <div className="text-3xl font-bold text-gray-900">
                          {formatCurrency(parseFloat(flight.price.total), flight.price.currency)}
                        </div>
                        <div className="text-sm text-gray-500 mb-4">per person</div>
                        
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          Select Flight
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!isSearching && filteredFlights.length === 0 && flightOffers.length > 0 && (
          <div className="text-center py-12">
            <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No flights match your filters
            </h3>
            <p className="text-gray-500">
              Try adjusting your filter criteria
            </p>
          </div>
        )}

        {/* No Initial Results */}
        {!isSearching && flightOffers.length === 0 && !searchError && (
          <div className="text-center py-12">
            <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Search for flights
            </h3>
            <p className="text-gray-500">
              Enter your travel details above to find available flights
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
