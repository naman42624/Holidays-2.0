'use client'

import React, { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  children: React.ReactNode
  className?: string
}

export function ShimmerButton({
  shimmerColor = '#ffffff',
  shimmerSize = '0.1em',
  borderRadius = '0.5rem',
  shimmerDuration = '2s',
  background = 'linear-gradient(110deg, #2563eb, #3b82f6, #60a5fa)',
  children,
  className,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      className={cn(
        'relative inline-flex h-10 items-center justify-center overflow-hidden rounded-md px-6 font-medium text-white shadow-md transition-all',
        className
      )}
      style={{
        background,
        borderRadius
      }}
      {...props}
    >
      <div
        className="absolute inset-0"
        style={{
          overflow: 'hidden',
          background: 'transparent'
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
            backgroundSize: `${shimmerSize} 100%`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: '-100% 0',
            animation: `shimmer ${shimmerDuration} infinite`,
          }}
        />
        <style jsx>{`
          @keyframes shimmer {
            0% {
              background-position: -100% 0;
            }
            100% {
              background-position: 300% 0;
            }
          }
        `}</style>
      </div>
      <span className="relative z-10">{children}</span>
    </button>
  )
}

export default ShimmerButton
