'use client'

import React from 'react'
import { useLoadingPerformance } from '@/hooks/useLoadingPerformance'

/**
 * Component that displays loading performance metrics (for development)
 */
export function LoadingPerformancePanel() {
  const { 
    getMetrics, 
    getAverageLoadingTime, 
    getSlowOperations, 
    getFailedOperations, 
    clearMetrics 
  } = useLoadingPerformance()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const metrics = getMetrics()
  const avgTime = getAverageLoadingTime()
  const slowOps = getSlowOperations()
  const failedOps = getFailedOperations()

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-sm">Loading Metrics</h3>
        <button 
          onClick={clearMetrics}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Clear
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-gray-600">Total Operations:</span> {metrics.length}
        </div>
        <div>
          <span className="text-gray-600">Avg Time:</span> {avgTime.toFixed(0)}ms
        </div>
        <div>
          <span className="text-gray-600">Slow Operations:</span> {slowOps.length}
        </div>
        <div>
          <span className="text-gray-600">Failed Operations:</span> {failedOps.length}
        </div>
        
        {slowOps.length > 0 && (
          <div className="mt-2 pt-2 border-t">
            <div className="text-orange-600 font-medium">Slow Operations:</div>
            {slowOps.slice(-3).map((op, i) => (
              <div key={i} className="text-orange-600">
                {op.operation}: {op.duration?.toFixed(0)}ms
              </div>
            ))}
          </div>
        )}
        
        {failedOps.length > 0 && (
          <div className="mt-2 pt-2 border-t">
            <div className="text-red-600 font-medium">Recent Failures:</div>
            {failedOps.slice(-2).map((op, i) => (
              <div key={i} className="text-red-600">
                {op.operation}: {op.error}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
