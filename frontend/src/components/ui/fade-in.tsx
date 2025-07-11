'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface FadeInProps {
  children: React.ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  duration?: number
  delay?: number
  threshold?: number
  once?: boolean
  distance?: string
}

export function FadeIn({
  children,
  className,
  direction = 'up',
  duration = 0.5,
  delay = 0,
  threshold = 0.1,
  once = true,
  distance = '20px'
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const domRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if ((entry.isIntersecting || entry.intersectionRatio > threshold) && (!once || !hasAnimated)) {
            setIsVisible(true)
            if (once) setHasAnimated(true)
          } else if (!once) {
            setIsVisible(false)
          }
        })
      },
      { threshold }
    )
    
    const { current } = domRef
    if (current) {
      observer.observe(current)
    }
    
    return () => {
      if (current) {
        observer.unobserve(current)
      }
    }
  }, [threshold, once, hasAnimated])

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return `translateY(${distance})`
      case 'down':
        return `translateY(-${distance})`
      case 'left':
        return `translateX(${distance})`
      case 'right':
        return `translateX(-${distance})`
      default:
        return 'none'
    }
  }

  return (
    <div
      ref={domRef}
      className={cn(className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : getTransform(),
        transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`,
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </div>
  )
}

export default FadeIn
