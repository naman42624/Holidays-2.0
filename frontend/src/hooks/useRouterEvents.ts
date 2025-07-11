'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLoading } from '@/contexts/LoadingContext'

/**
 * Hook that listens to router events and shows loading state
 * This provides automatic loading states for all navigation
 */
export function useRouterEvents() {
  const router = useRouter()
  const { showLoader, hideLoader } = useLoading()

  useEffect(() => {
    // Handle programmatic navigation loading
    const originalPush = router.push
    const originalReplace = router.replace

    // Override router.push to show loading
    router.push = async (href, options) => {
      showLoader('Navigating...')
      try {
        await originalPush(href, options)
      } finally {
        // Hide loader after a brief delay to allow page to render
        setTimeout(() => {
          hideLoader()
        }, 500)
      }
    }

    // Override router.replace to show loading
    router.replace = async (href, options) => {
      showLoader('Navigating...')
      try {
        await originalReplace(href, options)
      } finally {
        // Hide loader after a brief delay to allow page to render
        setTimeout(() => {
          hideLoader()
        }, 500)
      }
    }

    // Listen for browser back/forward navigation
    const handlePopstate = () => {
      showLoader('Loading page...')
      setTimeout(() => {
        hideLoader()
      }, 500)
    }

    window.addEventListener('popstate', handlePopstate)

    // Cleanup
    return () => {
      router.push = originalPush
      router.replace = originalReplace
      window.removeEventListener('popstate', handlePopstate)
    }
  }, [router, showLoader, hideLoader])
}
