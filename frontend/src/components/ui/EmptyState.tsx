'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plane, Hotel, MapPin, Search, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { textColors } from '@/styles/designSystem'

interface EmptyStateProps {
  type: 'flights' | 'hotels' | 'activities' | 'search' | 'error'
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  showRefresh?: boolean
  onRefresh?: () => void
  suggestions?: string[]
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
  showRefresh = false,
  onRefresh,
  suggestions = []
}) => {
  const getIcon = () => {
    switch (type) {
      case 'flights':
        return <Plane className="w-16 h-16 text-blue-400" />
      case 'hotels':
        return <Hotel className="w-16 h-16 text-green-400" />
      case 'activities':
        return <MapPin className="w-16 h-16 text-purple-400" />
      case 'search':
        return <Search className="w-16 h-16 text-gray-400" />
      case 'error':
        return <RefreshCw className="w-16 h-16 text-red-400" />
      default:
        return <Search className="w-16 h-16 text-gray-400" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'flights':
        return 'bg-blue-50'
      case 'hotels':
        return 'bg-green-50'
      case 'activities':
        return 'bg-purple-50'
      case 'search':
        return 'bg-gray-50'
      case 'error':
        return 'bg-red-50'
      default:
        return 'bg-gray-50'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`w-full max-w-md mx-auto text-center py-12 px-6 rounded-xl ${getBackgroundColor()}`}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        className="mb-6"
      >
        {getIcon()}
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className={`text-xl font-semibold mb-3 ${textColors.primary}`}
      >
        {title}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className={`text-sm mb-6 ${textColors.secondary}`}
      >
        {description}
      </motion.p>

      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-6"
        >
          <p className={`text-sm font-medium mb-3 ${textColors.primary}`}>
            Try searching for:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm border border-gray-200"
              >
                {suggestion}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-col space-y-3"
      >
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {actionLabel}
          </Button>
        )}
        
        {showRefresh && onRefresh && (
          <Button
            onClick={onRefresh}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </motion.div>
    </motion.div>
  )
}

export const FlightEmptyState: React.FC<{
  onNewSearch?: () => void
  onRefresh?: () => void
}> = ({ onNewSearch, onRefresh }) => {
  return (
    <EmptyState
      type="flights"
      title="No flights found"
      description="We couldn't find any flights matching your search criteria. Try adjusting your dates or destinations."
      actionLabel="Search Again"
      onAction={onNewSearch}
      showRefresh={true}
      onRefresh={onRefresh}
      suggestions={['Delhi to Mumbai', 'Mumbai to Bangalore', 'Delhi to Goa']}
    />
  )
}

export const HotelEmptyState: React.FC<{
  onNewSearch?: () => void
  onRefresh?: () => void
}> = ({ onNewSearch, onRefresh }) => {
  return (
    <EmptyState
      type="hotels"
      title="No hotels found"
      description="We couldn't find any hotels matching your search criteria. Try adjusting your location or dates."
      actionLabel="Search Again"
      onAction={onNewSearch}
      showRefresh={true}
      onRefresh={onRefresh}
      suggestions={['New York', 'London', 'Paris', 'Tokyo']}
    />
  )
}

export const ActivityEmptyState: React.FC<{
  onNewSearch?: () => void
  onRefresh?: () => void
}> = ({ onNewSearch, onRefresh }) => {
  return (
    <EmptyState
      type="activities"
      title="No activities found"
      description="We couldn't find any activities matching your search criteria. Try searching for a different location."
      actionLabel="Search Again"
      onAction={onNewSearch}
      showRefresh={true}
      onRefresh={onRefresh}
      suggestions={['Museums', 'Tours', 'Adventure', 'Cultural']}
    />
  )
}

export const SearchEmptyState: React.FC<{
  searchType: 'flights' | 'hotels' | 'activities'
  onGetStarted?: () => void
}> = ({ searchType, onGetStarted }) => {
  const getTitle = () => {
    switch (searchType) {
      case 'flights':
        return 'Search for flights'
      case 'hotels':
        return 'Find your perfect stay'
      case 'activities':
        return 'Discover amazing experiences'
      default:
        return 'Start your search'
    }
  }

  const getDescription = () => {
    switch (searchType) {
      case 'flights':
        return 'Enter your departure and destination cities to find the best flight deals.'
      case 'hotels':
        return 'Enter your destination and dates to find the perfect accommodation.'
      case 'activities':
        return 'Enter your destination to discover exciting activities and tours.'
      default:
        return 'Enter your search criteria to get started.'
    }
  }

  return (
    <EmptyState
      type={searchType}
      title={getTitle()}
      description={getDescription()}
      actionLabel="Get Started"
      onAction={onGetStarted}
    />
  )
}

export const ErrorEmptyState: React.FC<{
  onRetry?: () => void
}> = ({ onRetry }) => {
  return (
    <EmptyState
      type="error"
      title="Something went wrong"
      description="We're having trouble loading your search results. Please try again in a moment."
      actionLabel="Try Again"
      onAction={onRetry}
      showRefresh={true}
      onRefresh={onRetry}
    />
  )
}

export default EmptyState
