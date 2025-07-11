'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Activity } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { MapPin, Star, Clock, Users, Camera, Tag, ExternalLink, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { colors, shadows, borderRadius, textColors } from '@/styles/designSystem'

interface ActivityCardProps {
  activity: Activity
  index: number
  onSelect: (activity: Activity) => void
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

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, index, onSelect }) => {
  const hasImage = activity.pictures && activity.pictures.length > 0
  const mainPrice = activity.price
  
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
        {/* Activity Image */}
        <div className="lg:w-1/3 h-48 lg:h-auto relative bg-gray-100">
          {hasImage ? (
            <Image
              src={activity.pictures![0]}
              alt={activity.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: colors.gray[100] }}
            >
              <div className="text-center">
                <Camera className="w-8 h-8 mx-auto mb-2" style={{ color: colors.gray[400] }} />
                <p className="text-sm" style={{ color: colors.gray[500] }}>
                  Activity Photo
                </p>
              </div>
            </div>
          )}
          
          {/* Rating badge */}
          {activity.rating && (
            <div 
              className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: colors.primary[600],
                color: 'white'
              }}
            >
              ⭐ {activity.rating}
            </div>
          )}
        </div>

        {/* Activity Details */}
        <div className="lg:w-2/3 p-6">
          <div className="flex justify-between items-start h-full">
            <div className="flex-1 pr-4">
              {/* Activity Name */}
              <h3 className="text-xl font-semibold mb-2" style={{ color: textColors.primary }}>
                {activity.name}
              </h3>

              {/* Rating */}
              <div className="mb-3">
                {renderStars(activity.rating)}
              </div>

              {/* Location */}
              {activity.location && (
                <div className="flex items-start space-x-2 mb-3">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors.gray[400] }} />
                  <p className="text-sm" style={{ color: colors.gray[600] }}>
                    {activity.location.latitude.toFixed(4)}, {activity.location.longitude.toFixed(4)}
                  </p>
                </div>
              )}

              {/* Description */}
              {activity.description && (
                <p className="text-sm mb-4 line-clamp-3" style={{ color: colors.gray[600] }}>
                  {activity.description}
                </p>
              )}

              {/* Activity Info */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Duration */}
                {activity.duration && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" style={{ color: colors.gray[400] }} />
                    <span className="text-sm" style={{ color: colors.gray[600] }}>
                      {activity.duration.minimum} minimum
                    </span>
                  </div>
                )}

                {/* Booking Options */}
                {activity.bookingLink && (
                  <div className="flex items-center space-x-2">
                    <ExternalLink className="w-4 h-4" style={{ color: colors.gray[400] }} />
                    <span className="text-sm" style={{ color: colors.gray[600] }}>
                      Online booking
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {activity.tags && activity.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {activity.tags.slice(0, 4).map((tag, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs"
                        style={{ 
                          backgroundColor: colors.primary[50],
                          color: colors.primary[700],
                          border: `1px solid ${colors.primary[200]}`
                        }}
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                      </div>
                    ))}
                    {activity.tags.length > 4 && (
                      <span className="text-xs px-2 py-1" style={{ color: colors.gray[500] }}>
                        +{activity.tags.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Features */}
              <div className="flex items-center space-x-4 text-xs" style={{ color: colors.gray[500] }}>
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>Group friendly</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Available today</span>
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="text-right">
              {mainPrice && (
                <div className="mb-4">
                  <div className="text-2xl font-bold" style={{ color: textColors.primary }}>
                    {formatCurrency(parseFloat(mainPrice.amount), mainPrice.currency)}
                  </div>
                  <div className="text-sm" style={{ color: textColors.muted }}>
                    per person
                  </div>
                </div>
              )}
              
              <Button
                onClick={() => onSelect(activity)}
                className="w-full lg:w-auto px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
                style={{ 
                  backgroundColor: colors.primary[600],
                  color: 'white',
                  boxShadow: shadows.sm
                }}
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ActivityCard
