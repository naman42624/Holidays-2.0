import { Loader2 } from 'lucide-react'

interface LoadingProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Loading({ message = 'Loading...', size = 'md', className = '' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin mr-2`} />
      <span>{message}</span>
    </div>
  )
}

export function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loading message={message} size="lg" />
    </div>
  )
}

export function LoadingCard({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="bg-white rounded-lg border p-8">
      <Loading message={message} className="text-gray-600" />
    </div>
  )
}

// Inline loader for buttons and small components
export function InlineLoader({ message, className = '' }: { message?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Loader2 className="w-4 h-4 animate-spin" />
      {message && <span className="text-sm">{message}</span>}
    </div>
  )
}

// Skeleton loader for content that's loading
export function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 rounded-md h-4 mb-2"></div>
      <div className="bg-gray-200 rounded-md h-4 mb-2 w-3/4"></div>
      <div className="bg-gray-200 rounded-md h-4 w-1/2"></div>
    </div>
  )
}
