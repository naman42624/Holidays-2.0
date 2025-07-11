'use client'

import { useRouterEvents } from '@/hooks/useRouterEvents'

/**
 * Component that initializes global router event listeners
 * This should be placed in the root layout to enable automatic loading states
 */
export default function RouterEventListener({ children }: { children: React.ReactNode }) {
  useRouterEvents()
  
  return <>{children}</>
}
