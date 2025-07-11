'use client'

import React, { useState, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface SmoothTransitionProps {
  isLoading: boolean
  loadingComponent?: ReactNode
  children: ReactNode
  className?: string
  delay?: number
}

export default function SmoothTransition({ 
  isLoading, 
  loadingComponent, 
  children, 
  className = '',
  delay = 0 
}: SmoothTransitionProps) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowContent(true)
      }, delay)
      return () => clearTimeout(timer)
    } else {
      setShowContent(false)
    }
  }, [isLoading, delay])

  const defaultLoader = (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {loadingComponent || defaultLoader}
          </motion.div>
        ) : showContent ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

// Staggered animation for lists
export function StaggeredList({ 
  children, 
  className = '',
  stagger = 0.1 
}: { 
  children: ReactNode[], 
  className?: string,
  stagger?: number 
}) {
  return (
    <motion.div 
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: stagger
          }
        }
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// Fade in animation for individual items
export function FadeIn({ 
  children, 
  delay = 0, 
  className = '' 
}: { 
  children: ReactNode, 
  delay?: number, 
  className?: string 
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay, 
        ease: 'easeOut' 
      }}
    >
      {children}
    </motion.div>
  )
}
