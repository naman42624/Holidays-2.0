'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Plane, Clock, Search, X } from 'lucide-react'
import { Location } from '@/types'

interface SearchSuggestionsProps {
  suggestions: Location[]
  isVisible: boolean
  onSelect: (location: Location) => void
  onClose: () => void
  searchType?: 'flights' | 'hotels' | 'activities'
  className?: string
}

export default function SearchSuggestions({
  suggestions,
  isVisible,
  onSelect,
  onClose,
  searchType = 'flights',
  className = ''
}: SearchSuggestionsProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1)
  }, [suggestions])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible || suggestions.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            onSelect(suggestions[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isVisible, suggestions, selectedIndex, onSelect, onClose])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, onClose])

  const getIcon = (location: Location) => {
    if (location.type === 'AIRPORT' || location.iataCode) {
      return <Plane className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
    }
    return <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
  }

  const getLocationTypeBadge = (location: Location) => {
    const type = location.type || 'CITY'
    const colorMap: { [key: string]: string } = {
      AIRPORT: 'bg-amber-100 text-amber-800',
      CITY: 'bg-green-100 text-green-800',
      HOTEL: 'bg-purple-100 text-purple-800',
      POI: 'bg-orange-100 text-orange-800',
    }
    
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorMap[type] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    )
  }

  const formatSubtext = (location: Location) => {
    const parts = []
    if (location.city) parts.push(location.city)
    if (location.country) parts.push(location.country)
    if (location.iataCode) parts.push(`(${location.iataCode})`)
    return parts.join(', ')
  }

  return (
    <AnimatePresence>
      {isVisible && suggestions.length > 0 && (
        <motion.div
          ref={suggestionsRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`absolute top-full left-0 right-0 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto mt-2 min-w-[300px] sm:min-w-[500px] ${className}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center space-x-2">
              <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            </button>
          </div>

          {/* Suggestions List */}
          <div className="py-2">
            {suggestions.map((location, index) => (
              <motion.button
                key={location.id}
                type="button"
                onClick={() => onSelect(location)}
                onMouseEnter={() => setSelectedIndex(index)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={`w-full px-4 py-3 text-left hover:bg-amber-50 transition-all duration-150 border-l-2 ${
                  selectedIndex === index
                    ? 'bg-amber-50 border-amber-500'
                    : 'border-transparent hover:border-amber-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(location)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="font-semibold text-gray-900 text-sm">
                        {location.name}
                      </div>
                      {getLocationTypeBadge(location)}
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      {formatSubtext(location)}
                    </div>
                    
                    {location.detailedName && (
                      <div className="text-xs text-gray-500 mt-1">
                        {location.detailedName}
                      </div>
                    )}
                  </div>

                  {/* Additional info for flights */}
                  {searchType === 'flights' && location.iataCode && (
                    <div className="flex-shrink-0 text-right">
                      <div className="text-sm font-mono font-semibold text-gray-700">
                        {location.iataCode}
                      </div>
                      {location.timeZone && (
                        <div className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {location.timeZone}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Footer with keyboard shortcuts */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Use ↑↓ to navigate, Enter to select</span>
              <span>ESC to close</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
