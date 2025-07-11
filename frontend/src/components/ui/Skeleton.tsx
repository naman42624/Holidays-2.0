'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  animate?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  animate = true 
}) => {
  return (
    <motion.div
      className={`bg-gray-200 rounded ${className}`}
      animate={animate ? {
        opacity: [0.5, 1, 0.5],
      } : {}}
      transition={animate ? {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      } : {}}
    />
  )
}

export const FlightCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-16 h-3" />
          </div>
        </div>
        <div className="text-right">
          <Skeleton className="w-24 h-6 mb-1" />
          <Skeleton className="w-16 h-3" />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="space-y-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-12 h-5" />
          <Skeleton className="w-20 h-3" />
        </div>
        <div className="flex items-center justify-center">
          <Skeleton className="w-24 h-8" />
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-12 h-5" />
          <Skeleton className="w-20 h-3" />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Skeleton className="w-12 h-6" />
          <Skeleton className="w-12 h-6" />
          <Skeleton className="w-12 h-6" />
        </div>
        <Skeleton className="w-24 h-10" />
      </div>
    </div>
  )
}

export const HotelCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <Skeleton className="w-full h-48" />
      <div className="p-6">
        <div className="mb-4">
          <Skeleton className="w-3/4 h-6 mb-2" />
          <Skeleton className="w-1/2 h-4" />
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            <Skeleton className="w-20 h-4" />
          </div>
          <div className="text-right">
            <Skeleton className="w-24 h-6 mb-1" />
            <Skeleton className="w-16 h-3" />
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <Skeleton className="w-full h-3" />
          <Skeleton className="w-2/3 h-3" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Skeleton className="w-12 h-6" />
            <Skeleton className="w-12 h-6" />
          </div>
          <Skeleton className="w-24 h-10" />
        </div>
      </div>
    </div>
  )
}

export const ActivityCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <Skeleton className="w-full h-48" />
      <div className="p-6">
        <div className="mb-4">
          <Skeleton className="w-3/4 h-6 mb-2" />
          <Skeleton className="w-1/2 h-4" />
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            <Skeleton className="w-20 h-4" />
          </div>
          <div className="text-right">
            <Skeleton className="w-24 h-6 mb-1" />
            <Skeleton className="w-16 h-3" />
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <Skeleton className="w-full h-3" />
          <Skeleton className="w-3/4 h-3" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Skeleton className="w-16 h-6" />
            <Skeleton className="w-16 h-6" />
          </div>
          <Skeleton className="w-24 h-10" />
        </div>
      </div>
    </div>
  )
}

export const SearchResultsSkeleton: React.FC<{ 
  type: 'flights' | 'hotels' | 'activities'
  count?: number 
}> = ({ type, count = 5 }) => {
  const SkeletonComponent = type === 'flights' ? FlightCardSkeleton : 
                           type === 'hotels' ? HotelCardSkeleton : 
                           ActivityCardSkeleton

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3, 
            delay: index * 0.1,
            ease: 'easeOut'
          }}
        >
          <SkeletonComponent />
        </motion.div>
      ))}
    </div>
  )
}

export default Skeleton
