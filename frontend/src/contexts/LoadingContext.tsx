'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import FullScreenLoader from '@/components/ui/FullScreenLoader'

interface LoadingContextType {
  isLoading: boolean
  message: string
  showLoader: (message?: string) => void
  hideLoader: () => void
  setLoadingMessage: (message: string) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('Loading...')

  const showLoader = (loadingMessage: string = 'Loading...') => {
    setMessage(loadingMessage)
    setIsLoading(true)
  }

  const hideLoader = () => {
    setIsLoading(false)
  }

  const setLoadingMessage = (newMessage: string) => {
    setMessage(newMessage)
  }

  const value = {
    isLoading,
    message,
    showLoader,
    hideLoader,
    setLoadingMessage,
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && <FullScreenLoader message={message} />}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

// Hook for managing loading states with automatic cleanup
export function useLoadingState(initialMessage: string = 'Loading...') {
  const { showLoader, hideLoader, setLoadingMessage } = useLoading()
  const [isActive, setIsActive] = useState(false)

  const start = (message: string = initialMessage) => {
    setIsActive(true)
    showLoader(message)
  }

  const stop = () => {
    setIsActive(false)
    hideLoader()
  }

  const updateMessage = (message: string) => {
    if (isActive) {
      setLoadingMessage(message)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isActive) {
        hideLoader()
      }
    }
  }, [isActive, hideLoader])

  return {
    start,
    stop,
    updateMessage,
    isActive,
  }
}
