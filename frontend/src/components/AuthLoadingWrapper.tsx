'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import FullScreenLoader from '@/components/ui/FullScreenLoader'

interface AuthLoadingWrapperProps {
  children: React.ReactNode
}

export default function AuthLoadingWrapper({ children }: AuthLoadingWrapperProps) {
  const { loading } = useAuth()

  if (loading) {
    return <FullScreenLoader message="Initializing your travel experience..." />
  }

  return <>{children}</>
}
