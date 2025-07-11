'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FlightOffer } from '@/types'
import { formatCurrency, formatDuration } from '@/lib/utils'
import { Plane, Utensils, Monitor, Battery } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { textColors } from '@/styles/designSystem'
import { getCityDisplayName } from '@/data/airportDatabase'

interface FlightCardProps {
  flight: FlightOffer
  index: number
  onSelect: (flight: FlightOffer) => void
}

// Airline names mapping
const airlineNames: { [key: string]: string } = {
  '6E': 'IndiGo',
  'AI': 'Air India',
  'SG': 'SpiceJet',
  'UK': 'Vistara',
  'G8': 'GoAir',
  'I5': 'AirAsia India',
  'EK': 'Emirates',
  'QR': 'Qatar Airways',
  'EY': 'Etihad Airways',
  'LH': 'Lufthansa',
  'BA': 'British Airways',
  'AF': 'Air France',
  'KL': 'KLM',
  'TK': 'Turkish Airlines',
  'SQ': 'Singapore Airlines',
  'CX': 'Cathay Pacific',
  'NH': 'ANA',
  'JL': 'Japan Airlines',
  'DL': 'Delta Air Lines',
  'AA': 'American Airlines',
  'UA': 'United Airlines',
}

// Airport codes to city names mapping - now using comprehensive database
const getCityName = (airportCode: string): string => {
  return getCityDisplayName(airportCode)
}

const getAirlineTextLogo = (carrierCode: string): string => {
  // Return a styled text logo as fallback
  return carrierCode.toUpperCase()
}

const getAirlineLogoColor = (carrierCode: string): string => {
  // Return colors based on airline code for visual distinction
  const colors: { [key: string]: string } = {
    '6E': '#FF6B00', // IndiGo
    'AI': '#C41E3A', // Air India
    'SG': '#FFCD00', // SpiceJet
    'UK': '#722F37', // Vistara
    'G8': '#00B7EB', // GoAir
    'I5': '#FF0000', // AirAsia
    'EK': '#C8102E', // Emirates
    'QR': '#5D0A41', // Qatar Airways
    'EY': '#D4AF37', // Etihad
    'LH': '#05164D', // Lufthansa
    'BA': '#075AAA', // British Airways
    'AF': '#002157', // Air France
    'KL': '#00A1DE', // KLM
    'TK': '#C70025', // Turkish Airlines
    'SQ': '#003876', // Singapore Airlines
    'CX': '#009639', // Cathay Pacific
    'NH': '#1E3A8A', // ANA
    'JL': '#C8102E', // JAL
    'DL': '#003366', // Delta
    'AA': '#C8102E', // American Airlines
    'UA': '#002244', // United Airlines
  }
  return colors[carrierCode] || '#4B5563' // Default gray
}

const getAirlineName = (carrierCode: string): string => {
  return airlineNames[carrierCode] || carrierCode
}

const getStopsText = (segments: Array<{ departure: { iataCode: string }; arrival: { iataCode: string } }>): string => {
  const stops = segments.length - 1
  if (stops === 0) return 'Non-stop'
  if (stops === 1) return '1 Stop'
  return `${stops} Stops`
}

const getAircraft = (segment: { aircraft?: { code?: string } }): string => {
  return segment.aircraft?.code || 'Aircraft'
}

const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  })
}

// Helper function to get baggage info from fare details
const getBaggageInfo = (flight: FlightOffer): { checkedBags: string; cabinBags: string } => {
  const fareDetails = flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]
  if (!fareDetails) {
    return { checkedBags: 'Not specified', cabinBags: 'Not specified' }
  }

  // Handle checked bags
  const checkedBags = fareDetails.includedCheckedBags
    ? `${fareDetails.includedCheckedBags.weight || 0} ${fareDetails.includedCheckedBags.weightUnit || 'KG'}`
    : 'Not included'

  // Cabin bags are typically standard for economy class (7kg) but not always in API response
  const cabinBags = '7 KG' // Standard cabin baggage allowance

  return { checkedBags, cabinBags }
}

// Helper function to get amenities from fare details
const getAmenities = (flight: FlightOffer): { free: string[]; paid: string[] } => {
  const fareDetails = flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]
  if (!fareDetails?.amenities) return { free: [], paid: [] }

  const free: string[] = []
  const paid: string[] = []

  fareDetails.amenities.forEach(amenity => {
    if (amenity.isChargeable) {
      paid.push(amenity.description)
    } else {
      free.push(amenity.description)
    }
  })

  return { free, paid }
}

export default function FlightCard({ flight, index, onSelect }: FlightCardProps) {
  const segments = flight.itineraries[0].segments
  const firstSegment = segments[0]
  const lastSegment = segments[segments.length - 1]
  const totalDuration = flight.itineraries[0].duration
  const stops = segments.length - 1
  const mainCarrier = firstSegment.carrierCode
  const price = parseFloat(flight.price.total)
  const baggageInfo = getBaggageInfo(flight)
  const amenities = getAmenities(flight)
  const bookableSeats = flight.numberOfBookableSeats

  // Calculate if it's a good deal (mock logic)
  const isGoodDeal = price < 15000 && stops === 0
  const isPopular = index < 3 && stops <= 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 overflow-hidden">
        {/* Deal Badge */}
        {(isGoodDeal || isPopular) && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 text-xs font-semibold">
            {isGoodDeal ? '🔥 Great Deal' : '⭐ Popular Choice'}
          </div>
        )}

        <div className="p-6">
          {/* Header with Airline Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 relative flex items-center justify-center rounded-full text-white font-bold text-xs"
                style={{ backgroundColor: getAirlineLogoColor(mainCarrier) }}
              >
                {getAirlineTextLogo(mainCarrier)}
              </div>
              <div>
                <h3 className="font-semibold text-sm" style={{ color: textColors.primary }}>
                  {getAirlineName(mainCarrier)}
                </h3>
                <p className="text-xs" style={{ color: textColors.muted }}>
                  {firstSegment.carrierCode} {firstSegment.flightNumber}
                  {segments.length > 1 && ` +${segments.length - 1} more`}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: textColors.primary }}>
                {formatCurrency(price, flight.price.currency)}
              </div>
              <div className="text-xs" style={{ color: textColors.muted }}>per person</div>
              {bookableSeats <= 5 && (
                <div className="text-xs text-orange-600 font-medium mt-1">
                  Only {bookableSeats} seat{bookableSeats !== 1 ? 's' : ''} left!
                </div>
              )}
            </div>
          </div>

          {/* Flight Route */}
          <div className="flex items-center space-x-4 mb-4">
            {/* Departure */}
            <div className="flex-1">
              <div className="text-2xl font-bold" style={{ color: textColors.primary }}>
                {formatTime(firstSegment.departure.at)}
              </div>
              <div className="text-sm font-medium" style={{ color: textColors.secondary }}>
                {getCityName(firstSegment.departure.iataCode)}
              </div>
              <div className="text-xs" style={{ color: textColors.muted }}>
                {firstSegment.departure.iataCode} • {formatDate(firstSegment.departure.at)}
              </div>
            </div>

            {/* Flight Path */}
            <div className="flex-1 px-4">
              <div className="relative">
                <div className="flex items-center justify-center mb-1">
                  <div className="h-px bg-gray-300 flex-1"></div>
                  <Plane className="w-4 h-4 text-blue-600 mx-2 transform rotate-90" />
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-600">
                    {formatDuration(totalDuration)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getStopsText(segments)}
                  </div>
                </div>
              </div>
            </div>

            {/* Arrival */}
            <div className="flex-1 text-right">
              <div className="text-2xl font-bold" style={{ color: textColors.primary }}>
                {formatTime(lastSegment.arrival.at)}
              </div>
              <div className="text-sm font-medium" style={{ color: textColors.secondary }}>
                {getCityName(lastSegment.arrival.iataCode)}
              </div>
              <div className="text-xs" style={{ color: textColors.muted }}>
                {lastSegment.arrival.iataCode} • {formatDate(lastSegment.arrival.at)}
              </div>
            </div>
          </div>

          {/* Flight Details */}
          {segments.length > 1 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-medium text-gray-700 mb-2">
                Via {segments.map((segment, i) => i > 0 ? getCityName(segment.departure.iataCode) : '').filter(Boolean).join(', ')}
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>Layover: {segments.length > 1 ? '2h 30m' : 'N/A'}</span>
                <span>Aircraft: {getAircraft(firstSegment)}</span>
              </div>
            </div>
          )}

          {/* Amenities & Baggage */}
          <div className="mb-4 space-y-2">
            {/* Baggage Information */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-4 text-gray-500">
                <span><span className="font-medium text-gray-700">Cabin:</span> {baggageInfo.cabinBags}</span>
                <span><span className="font-medium text-gray-700">Checked:</span> {baggageInfo.checkedBags}</span>
              </div>
            </div>

            {/* Amenities */}
            {amenities.free.length > 0 && (
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="font-medium text-gray-700">Included:</span>
                {amenities.free.slice(0, 3).map((amenity, i) => (
                  <span key={i} className="flex items-center space-x-1">
                    {amenity.includes('MEAL') && <Utensils className="w-3 h-3" />}
                    {amenity.includes('SEAT') && <Monitor className="w-3 h-3" />}
                    {amenity.includes('BAGGAGE') && <Battery className="w-3 h-3" />}
                    <span>{amenity.toLowerCase().replace(/_/g, ' ')}</span>
                  </span>
                ))}
                {amenities.free.length > 3 && <span>+{amenities.free.length - 3} more</span>}
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">Aircraft:</span> {getAircraft(firstSegment)}
              {segments.length === 1 && (
                <>
                  <span className="mx-2">•</span>
                  <span className="font-medium text-gray-700">Cabin:</span> Economy
                </>
              )}
            </div>
            
            <Button 
              type="button"
              onClick={(e) => {
                console.log('FlightCard button clicked')
                e.preventDefault()
                e.stopPropagation()
                
                // Ensure no form submission occurs
                if (e.currentTarget.closest('form')) {
                  console.log('Button is inside a form context')
                }
                
                // Call the onSelect handler immediately
                console.log('Calling onSelect with flight:', flight.id)
                onSelect(flight)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              Select Flight 2.0
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
