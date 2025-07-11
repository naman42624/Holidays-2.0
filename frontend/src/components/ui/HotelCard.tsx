'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Hotel } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { MapPin, Star, Wifi, Car, Coffee, Dumbbell, Users, Bed, Bath, Tv, AirVent, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { colors, shadows, borderRadius, textColors } from '@/styles/designSystem'

interface HotelCardProps {
  hotel: Hotel
  index: number
  onSelect: (hotel: Hotel) => void
}

// Enhanced amenity icons mapping
const amenityIcons: { [key: string]: React.ReactNode } = {
  'Wi-Fi': <Wifi className="w-4 h-4" />,
  'WiFi': <Wifi className="w-4 h-4" />,
  'Internet': <Wifi className="w-4 h-4" />,
  'Parking': <Car className="w-4 h-4" />,
  'Car park': <Car className="w-4 h-4" />,
  'Restaurant': <Coffee className="w-4 h-4" />,
  'Dining': <UtensilsCrossed className="w-4 h-4" />,
  'Fitness': <Dumbbell className="w-4 h-4" />,
  'Gym': <Dumbbell className="w-4 h-4" />,
  'Pool': <Users className="w-4 h-4" />,
  'Swimming pool': <Users className="w-4 h-4" />,
  'Room service': <Bed className="w-4 h-4" />,
  'Spa': <Bath className="w-4 h-4" />,
  'TV': <Tv className="w-4 h-4" />,
  'Television': <Tv className="w-4 h-4" />,
  'Air conditioning': <AirVent className="w-4 h-4" />,
  'AC': <AirVent className="w-4 h-4" />,
}

const getAmenityIcon = (amenity: string): React.ReactNode => {
  const amenityKey = Object.keys(amenityIcons).find(key => 
    amenity.toLowerCase().includes(key.toLowerCase())
  )
  return amenityKey ? amenityIcons[amenityKey] : <Coffee className="w-4 h-4" />
}

const renderStars = (rating?: number) => {
  if (!rating) return null
  
  return (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300'
          }`}
        />
      ))}
      <span className="text-sm font-medium ml-1" style={{ color: colors.gray[600] }}>
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, index, onSelect }) => {
  const mainOffer = hotel.offers?.[0]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4,
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -2,
        boxShadow: shadows.lg
      }}
      className="bg-white rounded-lg overflow-hidden border"
      style={{ 
        borderColor: colors.gray[200],
        borderRadius: borderRadius.lg,
        boxShadow: shadows.md
      }}
    >
      <div className="flex flex-col lg:flex-row">
        {/* Hotel Image Placeholder */}
        <div className="lg:w-1/3 h-48 lg:h-auto relative bg-gray-100">
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: colors.gray[100] }}
          >
            <div className="text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2" style={{ color: colors.gray[400] }} />
              <p className="text-sm" style={{ color: colors.gray[500] }}>
                {hotel.name}
              </p>
            </div>
          </div>
          
          {/* Rating badge */}
          {hotel.rating && (
            <div 
              className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: colors.primary[600],
                color: 'white'
              }}
            >
              ⭐ {hotel.rating}
            </div>
          )}
        </div>

        {/* Hotel Details */}
        <div className="lg:w-2/3 p-6">
          <div className="flex justify-between items-start h-full">
            <div className="flex-1 pr-4">
              {/* Hotel Name */}
              <h3 className="text-xl font-semibold mb-2" style={{ color: textColors.primary }}>
                {hotel.name}
              </h3>

              {/* Rating */}
              <div className="mb-3">
                {renderStars(hotel.rating)}
              </div>

              {/* Address */}
              {hotel.address && (
                <div className="flex items-start space-x-2 mb-3">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors.gray[400] }} />
                  <p className="text-sm" style={{ color: colors.gray[600] }}>
                    {hotel.address.lines.join(', ')}, {hotel.address.cityName}
                  </p>
                </div>
              )}

              {/* Description */}
              {hotel.description && (
                <p className="text-sm mb-4 line-clamp-2" style={{ color: colors.gray[600] }}>
                  {hotel.description}
                </p>
              )}

              {/* Amenities */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {hotel.amenities.slice(0, 6).map((amenity, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs"
                        style={{ 
                          backgroundColor: colors.gray[50],
                          color: colors.gray[700],
                          border: `1px solid ${colors.gray[200]}`
                        }}
                      >
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </div>
                    ))}
                    {hotel.amenities.length > 6 && (
                      <span className="text-xs px-2 py-1" style={{ color: colors.gray[500] }}>
                        +{hotel.amenities.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Features */}
              <div className="flex items-center space-x-4 text-xs" style={{ color: colors.gray[500] }}>
                <div className="flex items-center space-x-1">
                  <Bed className="w-3 h-3" />
                  <span>Rooms available</span>
                </div>
                {mainOffer && (
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>Best rate</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Section */}
            <div className="text-right">
              {mainOffer && mainOffer.price && mainOffer.price.total ? (
                <div className="mb-4">
                  <div className="text-2xl font-bold" style={{ color: textColors.primary }}>
                    {formatCurrency(parseFloat(mainOffer.price.total), mainOffer.price.currency)}
                  </div>
                  <div className="text-sm" style={{ color: textColors.muted }}>
                    per night
                  </div>
                  <div className="text-xs mt-1" style={{ color: textColors.light }}>
                    taxes included
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="text-lg font-medium" style={{ color: textColors.primary }}>
                    Price Available
                  </div>
                  <div className="text-sm" style={{ color: textColors.muted }}>
                    on booking
                  </div>
                </div>
              )}
              
              <Button
                onClick={() => onSelect(hotel)}
                className="w-full lg:w-auto px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
                style={{ 
                  backgroundColor: colors.primary[600],
                  color: 'white',
                  boxShadow: shadows.sm
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default HotelCard
