'use client'

import React, { useState, useEffect, ComponentType, useCallback, useRef } from 'react'
import { useLoadingService } from '@/services/loadingService'
import { InlineLoader } from '@/components/ui/loading'

export interface WithLoadingProps {
  isLoading?: boolean
  loadingMessage?: string
  showInlineLoader?: boolean
  loadingComponent?: React.ComponentType
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>
  minLoadingTime?: number
}

export interface AsyncDataProps<T> {
  data?: T
  error?: Error
  isLoading: boolean
  retry: () => void
}

/**
 * Higher-order component that adds loading functionality to any component
 */
export function withLoading<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  return function LoadingWrapper(props: P & WithLoadingProps) {
    const {
      isLoading = false,
      loadingMessage = 'Loading...',
      showInlineLoader = false,
      loadingComponent: LoadingComponent,
      minLoadingTime = 0,
      ...componentProps
    } = props

    const [showLoading, setShowLoading] = useState(isLoading)

    useEffect(() => {
      if (isLoading && minLoadingTime > 0) {
        // Ensure minimum loading time for better UX
        const timer = setTimeout(() => {
          if (!isLoading) {
            setShowLoading(false)
          }
        }, minLoadingTime)

        return () => clearTimeout(timer)
      } else {
        setShowLoading(isLoading)
      }
    }, [isLoading, minLoadingTime])

    if (showLoading) {
      if (LoadingComponent) {
        return <LoadingComponent />
      }
      
      if (showInlineLoader) {
        return (
          <div className="flex items-center justify-center p-8">
            <InlineLoader message={loadingMessage} />
          </div>
        )
      }

      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{loadingMessage}</p>
          </div>
        </div>
      )
    }

    return <WrappedComponent {...(componentProps as P)} />
  }
}

/**
 * Hook for handling async data with loading states
 */
export function useAsyncData<T>(
  asyncFn: () => Promise<T>,
  dependencies: React.DependencyList = []
): AsyncDataProps<T> {
  const [data, setData] = useState<T | undefined>(undefined)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const { executeWithLoading } = useLoadingService()
  const depsRef = useRef(dependencies)

  // Update deps ref when dependencies change
  useEffect(() => {
    depsRef.current = dependencies
  }, [dependencies])

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(undefined)
      
      const result = await executeWithLoading(asyncFn, { silent: true })
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [asyncFn, executeWithLoading])

  useEffect(() => {
    fetchData()
  }, [fetchData]) // Remove the spread dependencies to avoid the warning

  return {
    data,
    error,
    isLoading,
    retry: fetchData
  }
}

/**
 * Component that renders async data with loading and error states
 */
export function AsyncDataRenderer<T>({
  children,
  data,
  error,
  isLoading,
  retry,
  loadingComponent,
  errorComponent,
  loadingMessage = 'Loading...'
}: {
  children: (data: T) => React.ReactNode
  data?: T
  error?: Error
  isLoading: boolean
  retry: () => void
  loadingComponent?: React.ComponentType
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>
  loadingMessage?: string
}) {
  if (isLoading) {
    if (loadingComponent) {
      const LoadingComponent = loadingComponent
      return <LoadingComponent />
    }
    
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    )
  }

  if (error) {
    if (errorComponent) {
      const ErrorComponent = errorComponent
      return <ErrorComponent error={error} retry={retry} />
    }
    
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={retry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  return <>{children(data)}</>
}

/**
 * Hook for managing loading state with debouncing
 */
export function useDebouncedLoading(delay = 300) {
  const [isLoading, setIsLoading] = useState(false)
  const [shouldShowLoading, setShouldShowLoading] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isLoading) {
      timer = setTimeout(() => {
        setShouldShowLoading(true)
      }, delay)
    } else {
      setShouldShowLoading(false)
    }

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [isLoading, delay])

  return {
    isLoading,
    shouldShowLoading,
    setIsLoading
  }
}
