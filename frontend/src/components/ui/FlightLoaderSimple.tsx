'use client'

import React, { useEffect, useState } from 'react'

interface FlightLoaderProps {
  origin: string
  destination: string
  className?: string
}

export default function FlightLoader({ origin, destination, className = '' }: FlightLoaderProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0 // Reset animation for continuous loop
        }
        return prev + 2 // Smooth animation speed
      })
    }, 80) // Smooth animation interval

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`relative min-h-[60vh] flex flex-col justify-center items-center bg-gradient-to-br from-sky-100 via-sky-200 to-blue-300 rounded-2xl p-8 mx-auto ${className}`}>
      {/* Main Flight Component */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-6 mb-12">
        {/* Origin */}
        <div className="text-center min-w-[120px]">
          <span className="text-2xl md:text-3xl font-semibold text-slate-700 drop-shadow-sm">
            {origin}
          </span>
        </div>

        {/* Flight Track */}
        <div className="flex-1 relative h-12 mx-4">
          {/* Track Background */}
          <div className="absolute inset-0 bg-slate-400 rounded-full opacity-60"></div>
          
          {/* Progress Track */}
          <div 
            className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-75"
            style={{ width: `${progress}%`, minWidth: '8px' }}
          ></div>
          
          {/* Airplane */}
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-75 z-10"
            style={{ 
              left: `${progress}%`,
              transform: `translateX(-50%) translateY(-50%) scale(${1 + 0.3 * Math.sin(Math.PI * progress / 100)})`,
            }}
          >
            <div className="relative w-16 h-16">
              {/* Airplane SVG */}
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                className="w-full h-full text-blue-600 drop-shadow-lg"
                style={{
                  filter: `drop-shadow(${2 + Math.sin(Math.PI * progress / 100)}px ${1.5 + Math.sin(Math.PI * progress / 100) * 0.8}px ${1 + Math.sin(Math.PI * progress / 100)}px rgba(0,0,0,0.3))`
                }}
              >
                <path 
                  fill="currentColor" 
                  d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                />
              </svg>
            </div>
          </div>

          {/* Animated Clouds */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Cloud 1 */}
            <div 
              className="absolute top-0 w-8 h-4 bg-white rounded-full opacity-70 transform -translate-y-6"
              style={{ 
                left: `${(progress * 0.7 + 20) % 120}%`,
                animation: 'float 3s ease-in-out infinite'
              }}
            >
              <div className="absolute -left-2 top-1 w-6 h-3 bg-white rounded-full"></div>
              <div className="absolute -right-1 top-0.5 w-4 h-2.5 bg-white rounded-full"></div>
            </div>

            {/* Cloud 2 */}
            <div 
              className="absolute bottom-0 w-6 h-3 bg-white rounded-full opacity-60 transform translate-y-6"
              style={{ 
                left: `${(progress * 0.5 + 60) % 120}%`,
                animation: 'float 4s ease-in-out infinite reverse'
              }}
            >
              <div className="absolute -left-1 top-0.5 w-4 h-2 bg-white rounded-full"></div>
              <div className="absolute -right-0.5 top-0 w-3 h-2 bg-white rounded-full"></div>
            </div>

            {/* Cloud 3 */}
            <div 
              className="absolute top-2 w-5 h-2.5 bg-white rounded-full opacity-50"
              style={{ 
                left: `${(progress * 0.3 + 80) % 120}%`,
                animation: 'float 5s ease-in-out infinite'
              }}
            >
              <div className="absolute -left-1 top-0 w-3 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Destination */}
        <div className="text-center min-w-[120px]">
          <span className="text-2xl md:text-3xl font-semibold text-slate-700 drop-shadow-sm">
            {destination}
          </span>
        </div>
      </div>

      {/* Loading Text */}
      <div className="text-center">
        <p className="text-xl font-medium text-slate-700 mb-4 drop-shadow-sm">
          Searching for the best flights...
        </p>
        
        {/* Loading Dots */}
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      {/* Additional CSS for cloud float animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  )
}
