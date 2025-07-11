'use client'

import { useEffect, useRef } from 'react'

interface LoadingMetrics {
  operation: string
  startTime: number
  endTime?: number
  duration?: number
  success: boolean
  error?: string
}

class LoadingPerformanceMonitor {
  private static instance: LoadingPerformanceMonitor
  private metrics: LoadingMetrics[] = []
  private activeOperations = new Map<string, LoadingMetrics>()

  static getInstance(): LoadingPerformanceMonitor {
    if (!LoadingPerformanceMonitor.instance) {
      LoadingPerformanceMonitor.instance = new LoadingPerformanceMonitor()
    }
    return LoadingPerformanceMonitor.instance
  }

  startOperation(operation: string): string {
    const id = `${operation}_${Date.now()}_${Math.random()}`
    const metric: LoadingMetrics = {
      operation,
      startTime: performance.now(),
      success: false
    }
    
    this.activeOperations.set(id, metric)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Loading started: ${operation}`)
    }
    
    return id
  }

  endOperation(id: string, success: boolean = true, error?: string): void {
    const metric = this.activeOperations.get(id)
    if (!metric) return

    const endTime = performance.now()
    const completedMetric: LoadingMetrics = {
      ...metric,
      endTime,
      duration: endTime - metric.startTime,
      success,
      error
    }

    this.metrics.push(completedMetric)
    this.activeOperations.delete(id)

    if (process.env.NODE_ENV === 'development') {
      const emoji = success ? '✅' : '❌'
      console.log(`${emoji} Loading ${success ? 'completed' : 'failed'}: ${metric.operation} (${completedMetric.duration?.toFixed(2)}ms)`)
      
      if (error) {
        console.error(`Error: ${error}`)
      }
    }

    // Store metrics in localStorage for analysis
    this.saveMetrics()
  }

  getMetrics(): LoadingMetrics[] {
    return [...this.metrics]
  }

  getAverageLoadingTime(operation?: string): number {
    const relevantMetrics = operation 
      ? this.metrics.filter(m => m.operation === operation && m.success && m.duration)
      : this.metrics.filter(m => m.success && m.duration)

    if (relevantMetrics.length === 0) return 0

    const totalDuration = relevantMetrics.reduce((sum, m) => sum + (m.duration || 0), 0)
    return totalDuration / relevantMetrics.length
  }

  getSlowOperations(threshold: number = 2000): LoadingMetrics[] {
    return this.metrics.filter(m => m.duration && m.duration > threshold)
  }

  getFailedOperations(): LoadingMetrics[] {
    return this.metrics.filter(m => !m.success)
  }

  clearMetrics(): void {
    this.metrics = []
    localStorage.removeItem('loading-metrics')
  }

  private saveMetrics(): void {
    try {
      // Keep only last 100 metrics to prevent localStorage overflow
      const recentMetrics = this.metrics.slice(-100)
      localStorage.setItem('loading-metrics', JSON.stringify(recentMetrics))
    } catch (error) {
      console.warn('Failed to save loading metrics:', error)
    }
  }

  private loadMetrics(): void {
    try {
      const saved = localStorage.getItem('loading-metrics')
      if (saved) {
        this.metrics = JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Failed to load loading metrics:', error)
    }
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadMetrics()
    }
  }
}

/**
 * Hook for monitoring loading performance in components
 */
export function useLoadingPerformance() {
  const monitor = useRef(LoadingPerformanceMonitor.getInstance())

  useEffect(() => {
    // Enable global error tracking
    const handleError = (event: ErrorEvent) => {
      monitor.current.endOperation('global-error', false, event.message)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  return {
    startOperation: (operation: string) => monitor.current.startOperation(operation),
    endOperation: (id: string, success?: boolean, error?: string) => 
      monitor.current.endOperation(id, success, error),
    getMetrics: () => monitor.current.getMetrics(),
    getAverageLoadingTime: (operation?: string) => 
      monitor.current.getAverageLoadingTime(operation),
    getSlowOperations: (threshold?: number) => 
      monitor.current.getSlowOperations(threshold),
    getFailedOperations: () => monitor.current.getFailedOperations(),
    clearMetrics: () => monitor.current.clearMetrics()
  }
}

/**
 * Enhanced loading service with performance monitoring
 */
export function useMonitoredLoading() {
  const { startOperation, endOperation } = useLoadingPerformance()

  const executeWithMonitoring = async <T>(
    asyncFn: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const id = startOperation(operationName)
    
    try {
      const result = await asyncFn()
      endOperation(id, true)
      return result
    } catch (error) {
      endOperation(id, false, error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  return {
    executeWithMonitoring,
    ...useLoadingPerformance()
  }
}
