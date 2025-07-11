'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedBackgroundProps {
  children: React.ReactNode
  className?: string
  pattern?: 'dots' | 'waves' | 'grid' | 'particles'
  patternColor?: string
  backgroundColor?: string
  patternSize?: string
  patternOpacity?: number
  speed?: 'slow' | 'medium' | 'fast'
}

export function AnimatedBackground({
  children,
  className,
  pattern = 'dots',
  patternColor = '#2563eb',
  backgroundColor = '#ffffff',
  patternSize = '20px',
  patternOpacity = 0.1,
  speed = 'medium'
}: AnimatedBackgroundProps) {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; speed: number }>>([])

  // Set animation speed in milliseconds
  const animationSpeed = {
    slow: '30s',
    medium: '20s',
    fast: '10s'
  }

  // Generate random particles for the particle pattern
  useEffect(() => {
    if (pattern === 'particles') {
      const newParticles = Array.from({ length: 50 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 5 + 1,
        speed: Math.random() * 5 + 1
      }))
      setParticles(newParticles)
    }
  }, [pattern])

  // Pattern styles
  const getPatternStyle = () => {
    switch (pattern) {
      case 'dots':
        return {
          backgroundImage: `radial-gradient(${patternColor} ${patternOpacity * 30}%, transparent ${patternOpacity * 30}%)`,
          backgroundSize: patternSize,
          animation: `moveBackground ${animationSpeed[speed]} linear infinite`
        }
      case 'waves':
        return {
          backgroundImage: `linear-gradient(90deg, ${patternColor} ${patternOpacity * 10}%, transparent ${patternOpacity * 50}%)`,
          backgroundSize: `${patternSize} ${patternSize}`,
          animation: `waveBackground ${animationSpeed[speed]} linear infinite`
        }
      case 'grid':
        return {
          backgroundImage: `linear-gradient(${patternColor} ${patternOpacity * 10}%, transparent ${patternOpacity * 10}%),
                           linear-gradient(90deg, ${patternColor} ${patternOpacity * 10}%, transparent ${patternOpacity * 10}%)`,
          backgroundSize: `${patternSize} ${patternSize}`,
          animation: `gridBackground ${animationSpeed[speed]} linear infinite`
        }
      default:
        return {
          backgroundColor
        }
    }
  }

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        backgroundColor,
        position: 'relative',
        ...getPatternStyle()
      }}
    >
      {pattern === 'particles' && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          {particles.map((particle, index) => (
            <div
              key={index}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: patternColor,
                opacity: patternOpacity,
                animation: `float ${particle.speed * 5}s infinite linear`
              }}
            />
          ))}
        </div>
      )}
      <style jsx global>{`
        @keyframes moveBackground {
          0% { background-position: 0 0; }
          100% { background-position: ${patternSize} ${patternSize}; }
        }
        
        @keyframes waveBackground {
          0% { background-position: 0 0; }
          100% { background-position: ${patternSize} 0; }
        }
        
        @keyframes gridBackground {
          0% { background-position: 0 0; }
          100% { background-position: ${patternSize} ${patternSize}; }
        }
        
        @keyframes float {
          0% { transform: translate(0, 0); }
          25% { transform: translate(${patternSize}, ${patternSize}); }
          50% { transform: translate(0, ${patternSize}); }
          75% { transform: translate(-${patternSize}, 0); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default AnimatedBackground
