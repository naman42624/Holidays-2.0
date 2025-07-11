'use client'

import { useLoading } from '@/contexts/LoadingContext'

export interface LoadingOptions {
  message?: string
  timeout?: number
  onTimeout?: () => void
  silent?: boolean
}

export interface ProgressOptions {
  messages: string[]
  interval?: number
  randomDelay?: boolean
}

/**
 * Advanced loading service with timeout, progress tracking, and error handling
 */
export function useLoadingService() {
  const { showLoader, hideLoader, setLoadingMessage } = useLoading()

  /**
   * Execute an async function with loading state and timeout protection
   */
  const executeWithLoading = async <T>(
    asyncFn: () => Promise<T>,
    options: LoadingOptions = {}
  ): Promise<T> => {
    const { 
      message = 'Loading...', 
      timeout = 30000, 
      onTimeout,
      silent = false 
    } = options

    let timeoutId: NodeJS.Timeout | null = null
    let hasCompleted = false

    try {
      if (!silent) {
        showLoader(message)
      }

      // Set up timeout protection
      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          if (!hasCompleted) {
            hasCompleted = true
            hideLoader()
            if (onTimeout) {
              onTimeout()
            } else {
              throw new Error(`Operation timed out after ${timeout}ms`)
            }
          }
        }, timeout)
      }

      const result = await asyncFn()
      hasCompleted = true
      
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      return result
    } catch (error) {
      hasCompleted = true
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      throw error
    } finally {
      if (!silent) {
        hideLoader()
      }
    }
  }

  /**
   * Execute an async function with progressive loading messages
   */
  const executeWithProgress = async <T>(
    asyncFn: () => Promise<T>,
    options: ProgressOptions
  ): Promise<T> => {
    const { 
      messages, 
      interval = 1500, 
      randomDelay = true 
    } = options

    if (messages.length === 0) {
      throw new Error('Progress messages array cannot be empty')
    }

    let messageIndex = 0
    let intervalId: NodeJS.Timeout | null = null
    let hasCompleted = false

    const getNextDelay = () => {
      if (randomDelay) {
        return interval + Math.random() * 1000 // Add 0-1s random delay
      }
      return interval
    }

    try {
      // Start with first message
      showLoader(messages[0])

      // Set up progressive message updates
      const updateMessage = () => {
        if (!hasCompleted && messageIndex < messages.length - 1) {
          messageIndex++
          setLoadingMessage(messages[messageIndex])
          
          // Schedule next update
          if (messageIndex < messages.length - 1) {
            intervalId = setTimeout(updateMessage, getNextDelay())
          }
        }
      }

      // Start message progression
      if (messages.length > 1) {
        intervalId = setTimeout(updateMessage, getNextDelay())
      }

      const result = await asyncFn()
      hasCompleted = true

      if (intervalId) {
        clearTimeout(intervalId)
      }

      return result
    } catch (error) {
      hasCompleted = true
      if (intervalId) {
        clearTimeout(intervalId)
      }
      throw error
    } finally {
      hideLoader()
    }
  }

  /**
   * Create a loading state manager for manual control
   */
  const createLoadingState = (initialMessage = 'Loading...') => {
    let isActive = false
    let currentTimeout: NodeJS.Timeout | null = null

    const start = (message = initialMessage, autoHide?: number) => {
      if (isActive) return

      isActive = true
      showLoader(message)

      if (autoHide && autoHide > 0) {
        currentTimeout = setTimeout(() => {
          stop()
        }, autoHide)
      }
    }

    const stop = () => {
      if (!isActive) return

      isActive = false
      if (currentTimeout) {
        clearTimeout(currentTimeout)
        currentTimeout = null
      }
      hideLoader()
    }

    const updateMessage = (message: string) => {
      if (isActive) {
        setLoadingMessage(message)
      }
    }

    const isLoading = () => isActive

    return {
      start,
      stop,
      updateMessage,
      isLoading
    }
  }

  /**
   * Batch multiple async operations with combined loading state
   */
  const executeBatch = async <T>(
    operations: Array<{
      fn: () => Promise<T>
      name: string
    }>,
    options: LoadingOptions = {}
  ): Promise<T[]> => {
    const { message = 'Processing operations...' } = options

    return executeWithLoading(
      async () => {
        const results: T[] = []
        
        for (let i = 0; i < operations.length; i++) {
          const operation = operations[i]
          setLoadingMessage(`${message} (${operation.name} ${i + 1}/${operations.length})`)
          
          const result = await operation.fn()
          results.push(result)
        }

        return results
      },
      options
    )
  }

  return {
    executeWithLoading,
    executeWithProgress,
    createLoadingState,
    executeBatch
  }
}
