'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface GradientBackgroundProps {
  children: React.ReactNode
  className?: string
  colors?: string[]
  direction?: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-tr' | 'to-tl' | 'to-br' | 'to-bl'
  animate?: boolean
  animationDuration?: string
}

export function GradientBackground({
  children,
  className,
  colors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb'],
  direction = 'to-r',
  animate = false,
  animationDuration = '15s'
}: GradientBackgroundProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(${direction.replace('to-', 'to ')}, ${colors.join(', ')})`,
    backgroundSize: animate ? '200% 200%' : '100% 100%',
    animation: animate ? `gradient-animation ${animationDuration} ease infinite` : 'none'
  }

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      style={gradientStyle}
    >
      {animate && (
        <style jsx global>{`
          @keyframes gradient-animation {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
        `}</style>
      )}
      {children}
    </div>
  )
}

export default GradientBackground
