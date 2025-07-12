'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, MapPin, Plane, Loader2 } from 'lucide-react'
import { Location } from '@/types'
import SearchSuggestions from './SearchSuggestions'

interface EnhancedSearchInputProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  onLocationSelect: (location: Location) => void
  suggestions: Location[]
  isLoading?: boolean
  searchType?: 'flights' | 'hotels' | 'activities'
  icon?: React.ReactNode
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export default function EnhancedSearchInput({
  placeholder,
  value,
  onChange,
  onLocationSelect,
  suggestions,
  isLoading = false,
  searchType = 'flights',
  icon,
  error,
  required = false,
  disabled = false,
  className = ''
}: EnhancedSearchInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Show suggestions when input is focused and has suggestions
  useEffect(() => {
    setShowSuggestions(isFocused && suggestions.length > 0 && value.length >= 2)
  }, [isFocused, suggestions.length, value.length])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
  }

  const handleLocationSelect = (location: Location) => {
    const locationValue = location.iataCode || location.name
    onChange(locationValue)
    onLocationSelect(location)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  const handleClear = () => {
    onChange('')
    inputRef.current?.focus()
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    // Delay blur to allow for suggestion selection
    setTimeout(() => {
      setIsFocused(false)
    }, 200)
  }

  const defaultIcon = searchType === 'flights' ? 
    <Plane className="w-4 h-4 sm:w-5 sm:h-5" /> : 
    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />

  return (
    <div ref={containerRef} className={`relative enhanced-search-input ${className}`}>
      {/* Input Container */}
      <div className="relative">
        <div
          className={`relative flex items-center overflow-hidden rounded-lg border-2 transition-all duration-200 ${
            error
              ? 'border-red-300 bg-red-50'
              : isFocused
              ? 'border-gray-400 bg-white shadow-sm'
              : 'border-gray-300 bg-white hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {/* Icon */}
          <div className={`flex-shrink-0 flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 ${
            error ? 'text-red-400' : isFocused ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {icon || defaultIcon}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`flex-1 h-10 sm:h-12 px-2 sm:px-3 py-2 text-sm sm:text-base text-gray-900 placeholder-gray-500 bg-transparent border-none outline-none ${
              disabled ? 'cursor-not-allowed' : ''
            }`}
            autoComplete="off"
          />

          {/* Loading Spinner */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="flex-shrink-0 flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10"
              >
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clear Button */}
          <AnimatePresence>
            {value && !isLoading && !disabled && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={handleClear}
                className="flex-shrink-0 flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Search Icon (when no custom icon) */}
          {!icon && !isLoading && !value && (
            <div className="flex-shrink-0 flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10">
              <Search className={`w-3 h-3 sm:w-4 sm:h-4 ${isFocused ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full mt-1 text-sm text-red-600"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions */}
      <SearchSuggestions
        suggestions={suggestions}
        isVisible={showSuggestions}
        onSelect={handleLocationSelect}
        onClose={() => setShowSuggestions(false)}
        searchType={searchType}
        className="mt-1"
      />
    </div>
  )
}
