'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useLoading } from '@/contexts/LoadingContext'

// Hook to show loading during page transitions
export function usePageTransitionLoader() {
  const pathname = usePathname()
  const { showLoader, hideLoader } = useLoading()

  useEffect(() => {
    // Show loader for a brief moment during navigation
    showLoader('Loading page...')
    
    // Hide loader after a short delay to allow page to render
    const timer = setTimeout(() => {
      hideLoader()
    }, 500)

    return () => {
      clearTimeout(timer)
      hideLoader()
    }
  }, [pathname, showLoader, hideLoader])
}

// Hook for API calls that shows full screen loader
export function useApiLoader() {
  const { showLoader, hideLoader, setLoadingMessage } = useLoading()

  const executeWithLoader = async <T>(
    apiCall: () => Promise<T>,
    loadingMessage: string = 'Processing...'
  ): Promise<T> => {
    try {
      showLoader(loadingMessage)
      const result = await apiCall()
      return result
    } finally {
      hideLoader()
    }
  }

  const executeWithProgressLoader = async <T>(
    apiCall: () => Promise<T>,
    messages: string[]
  ): Promise<T> => {
    try {
      let messageIndex = 0
      showLoader(messages[messageIndex])

      // Update message every 2 seconds
      const messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length
        setLoadingMessage(messages[messageIndex])
      }, 2000)

      const result = await apiCall()
      clearInterval(messageInterval)
      return result
    } finally {
      hideLoader()
    }
  }

  return {
    executeWithLoader,
    executeWithProgressLoader,
  }
}
