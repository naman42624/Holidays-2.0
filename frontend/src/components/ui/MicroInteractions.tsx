'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Share2, Bookmark, Star, ChevronUp, ChevronDown } from 'lucide-react'

interface MicroInteractionProps {
  type: 'like' | 'share' | 'bookmark' | 'rating' | 'expand'
  initialState?: boolean
  onToggle?: (state: boolean) => void
  disabled?: boolean
  className?: string
}

export const MicroInteraction: React.FC<MicroInteractionProps> = ({
  type,
  initialState = false,
  onToggle,
  disabled = false,
  className = ''
}) => {
  const [isActive, setIsActive] = useState(initialState)

  const handleToggle = () => {
    if (disabled) return
    
    const newState = !isActive
    setIsActive(newState)
    onToggle?.(newState)
  }

  const getIcon = () => {
    switch (type) {
      case 'like':
        return (
          <Heart 
            className={`w-5 h-5 transition-colors ${
              isActive ? 'text-red-500 fill-red-500' : 'text-gray-400'
            }`}
          />
        )
      case 'share':
        return <Share2 className="w-5 h-5 text-gray-400" />
      case 'bookmark':
        return (
          <Bookmark 
            className={`w-5 h-5 transition-colors ${
              isActive ? 'text-blue-500 fill-blue-500' : 'text-gray-400'
            }`}
          />
        )
      case 'rating':
        return (
          <Star 
            className={`w-5 h-5 transition-colors ${
              isActive ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
            }`}
          />
        )
      case 'expand':
        return isActive ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )
      default:
        return null
    }
  }

  const getAnimation = () => {
    switch (type) {
      case 'like':
        return isActive ? { scale: [1, 1.2, 1] } : { scale: [1, 0.9, 1] }
      case 'bookmark':
        return isActive ? { scale: [1, 1.1, 1] } : { scale: [1, 0.95, 1] }
      case 'rating':
        return isActive ? { scale: [1, 1.2, 1], rotate: [0, 10, 0] } : { scale: [1, 0.9, 1] }
      default:
        return { scale: [1, 0.95, 1] }
    }
  }

  return (
    <motion.button
      onClick={handleToggle}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={getAnimation()}
      transition={{ duration: 0.2 }}
      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      {getIcon()}
    </motion.button>
  )
}

export const PulseButton: React.FC<{
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  disabled?: boolean
  className?: string
}> = ({ children, onClick, variant = 'primary', disabled = false, className = '' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white'
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white'
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white'
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white'
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${getVariantStyles()} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {children}
    </motion.button>
  )
}

export const FloatingActionButton: React.FC<{
  icon: React.ReactNode
  onClick?: () => void
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}> = ({ icon, onClick, className = '', position = 'bottom-right' }) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-right':
        return 'fixed bottom-6 right-6'
      case 'bottom-left':
        return 'fixed bottom-6 left-6'
      case 'top-right':
        return 'fixed top-6 right-6'
      case 'top-left':
        return 'fixed top-6 left-6'
      default:
        return 'fixed bottom-6 right-6'
    }
  }

  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`
        ${getPositionStyles()} 
        z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white 
        rounded-full shadow-lg flex items-center justify-center 
        ${className}
      `}
    >
      {icon}
    </motion.button>
  )
}

export const ProgressButton: React.FC<{
  children: React.ReactNode
  onClick?: () => void
  isLoading?: boolean
  progress?: number
  className?: string
}> = ({ children, onClick, isLoading = false, progress = 0, className = '' }) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={isLoading}
      whileHover={{ scale: isLoading ? 1 : 1.02 }}
      whileTap={{ scale: isLoading ? 1 : 0.98 }}
      className={`
        relative overflow-hidden px-6 py-3 rounded-lg font-medium 
        bg-blue-600 hover:bg-blue-700 text-white transition-colors
        ${isLoading ? 'cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {/* Progress bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 left-0 h-1 bg-white/30"
      />
      
      {/* Button content */}
      <div className="relative z-10">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </div>
    </motion.button>
  )
}

export const RippleButton: React.FC<{
  children: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
}> = ({ children, onClick, className = '' }) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()

    setRipples(prev => [...prev, { x, y, id }])
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id))
    }, 600)

    onClick?.(e)
  }

  return (
    <button
      onClick={handleClick}
      className={`
        relative overflow-hidden px-6 py-3 rounded-lg font-medium 
        bg-blue-600 hover:bg-blue-700 text-white transition-colors
        ${className}
      `}
    >
      {children}
      
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute w-8 h-8 bg-white rounded-full pointer-events-none"
          style={{
            left: ripple.x - 16,
            top: ripple.y - 16,
          }}
        />
      ))}
    </button>
  )
}

export default MicroInteraction
