'use client'

import React, { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { FloatingActionButton } from './MicroInteractions'

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <FloatingActionButton
          icon={<ArrowUp className="w-6 h-6" />}
          onClick={scrollToTop}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg"
        />
      )}
    </AnimatePresence>
  )
}

export default ScrollToTopButton
