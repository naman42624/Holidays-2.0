'use client'

import React, { useState } from 'react'
import { useLoadingService } from '@/services/loadingService'
import { withLoading, useAsyncData, AsyncDataRenderer, useDebouncedLoading } from '@/components/hoc/withLoading'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Example component wrapped with loading HOC
const LoadingWrappedCard = withLoading(({ title, content }: { title: string; content: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p>{content}</p>
    </CardContent>
  </Card>
))

// Simulate API calls
const simulateQuickAPI = () => new Promise<string>(resolve => 
  setTimeout(() => resolve('Quick API response!'), 1000)
)

const simulateBatchAPI = (id: string, delay: number) => 
  new Promise<string>(resolve => 
    setTimeout(() => resolve(`Batch operation ${id} completed`), delay)
  )

export default function AdvancedLoadingDemo() {
  const {
    executeWithLoading,
    executeWithProgress,
    createLoadingState,
    executeBatch
  } = useLoadingService()

  const [results, setResults] = useState<string[]>([])
  const [cardLoading, setCardLoading] = useState(false)
  
  // Debounced loading example
  const { shouldShowLoading, setIsLoading: setSearchLoading } = useDebouncedLoading(500)

  // Async data hook example
  const {
    data: asyncData,
    error: asyncError,
    isLoading: asyncLoading,
    retry: retryAsync
  } = useAsyncData(simulateQuickAPI, [])

  // Manual loading state
  const manualLoader = createLoadingState('Manual operation in progress...')

  const addResult = (result: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const demoTimeout = async () => {
    try {
      await executeWithLoading(
        () => new Promise(resolve => setTimeout(resolve, 5000)),
        {
          message: 'This will timeout in 3 seconds...',
          timeout: 3000,
          onTimeout: () => addResult('Operation timed out!')
        }
      )
      addResult('Operation completed (this should not appear)')
    } catch (error) {
      addResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const demoProgressLoader = async () => {
    try {
      await executeWithProgress(
        () => new Promise(resolve => setTimeout(resolve, 8000)),
        {
          messages: [
            'Initializing advanced operation...',
            'Connecting to remote servers...',
            'Processing complex calculations...',
            'Optimizing results...',
            'Finalizing response...',
            'Almost done...'
          ],
          interval: 1200,
          randomDelay: true
        }
      )
      addResult('Progressive loading completed!')
    } catch (error) {
      addResult(`Progress error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const demoBatchOperations = async () => {
    try {
      const operations = [
        { fn: () => simulateBatchAPI('A', 1000), name: 'User Data' },
        { fn: () => simulateBatchAPI('B', 1500), name: 'Settings' },
        { fn: () => simulateBatchAPI('C', 800), name: 'Preferences' },
        { fn: () => simulateBatchAPI('D', 1200), name: 'Analytics' }
      ]

      const results = await executeBatch(operations, {
        message: 'Processing batch operations...'
      })

      addResult(`Batch completed: ${results.join(', ')}`)
    } catch (error) {
      addResult(`Batch error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const demoManualLoader = () => {
    manualLoader.start('Manual loading started...', 3000) // Auto-hide after 3 seconds
    
    setTimeout(() => {
      manualLoader.updateMessage('Updating manual loader message...')
    }, 1500)

    addResult('Manual loader demo started')
  }

  const demoCardLoading = async () => {
    setCardLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      addResult('Card loading demo completed')
    } finally {
      setCardLoading(false)
    }
  }

  const demoSearchLoading = () => {
    setSearchLoading(true)
    setTimeout(() => {
      setSearchLoading(false)
      addResult('Debounced search completed')
    }, 2000)
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Advanced Loading System Demo</h1>
        <p className="text-gray-600">
          Comprehensive demonstration of all loading features and patterns
        </p>
      </div>

      {/* Service Features */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Service Features</CardTitle>
          <CardDescription>
            Advanced loading patterns with timeout, progress tracking, and batch operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button onClick={demoTimeout} variant="outline">
              Timeout Demo
            </Button>
            <Button onClick={demoProgressLoader} variant="outline">
              Progress Messages
            </Button>
            <Button onClick={demoBatchOperations} variant="outline">
              Batch Operations
            </Button>
            <Button onClick={demoManualLoader} variant="outline">
              Manual Control
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* HOC Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Higher-Order Component Examples</CardTitle>
          <CardDescription>
            Components wrapped with loading functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LoadingWrappedCard
              title="Loading HOC Demo"
              content="This card can show loading states"
              isLoading={cardLoading}
              loadingMessage="Card is loading..."
              showInlineLoader={true}
            />
            
            <div>
              <Button onClick={demoCardLoading} className="mb-4">
                Toggle Card Loading
              </Button>
              <p className="text-sm text-gray-600">
                Click to see the HOC loading state in action
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Async Data Renderer */}
      <Card>
        <CardHeader>
          <CardTitle>Async Data Renderer</CardTitle>
          <CardDescription>
            Automatic loading and error handling for async data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AsyncDataRenderer
            data={asyncData}
            error={asyncError}
            isLoading={asyncLoading}
            retry={retryAsync}
            loadingMessage="Loading async data..."
          >
            {(data) => (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-800">
                  <strong>Async Data:</strong> {data}
                </p>
              </div>
            )}
          </AsyncDataRenderer>
        </CardContent>
      </Card>

      {/* Debounced Loading */}
      <Card>
        <CardHeader>
          <CardTitle>Debounced Loading</CardTitle>
          <CardDescription>
            Loading state that only shows after a delay (good for search/input)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={demoSearchLoading} variant="outline">
              Trigger Search Loading
            </Button>
            {shouldShowLoading && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Searching...</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Loading indicator only appears after 500ms delay
          </p>
        </CardContent>
      </Card>

      {/* Error Handling Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Error Handling</CardTitle>
          <CardDescription>
            Demonstration of error states and retry functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AsyncDataRenderer
            data={undefined}
            error={new Error('Simulated API error - click retry to test')}
            isLoading={false}
            retry={() => addResult('Retry button clicked!')}
            loadingMessage="Loading error demo..."
          >
            {() => <div>This should not appear</div>}
          </AsyncDataRenderer>
        </CardContent>
      </Card>

      {/* Results Log */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Results Log</CardTitle>
          <CardDescription>
            Real-time log of demo operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded p-4 max-h-64 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-gray-500 text-center">No operations logged yet</p>
            ) : (
              <div className="space-y-1">
                {results.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
          {results.length > 0 && (
            <Button
              onClick={() => setResults([])}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Clear Log
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Guide</CardTitle>
          <CardDescription>
            How to use these advanced loading features in your components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Loading Service</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• <code>executeWithLoading()</code> - Basic async operations</li>
                <li>• <code>executeWithProgress()</code> - Progressive messages</li>
                <li>• <code>createLoadingState()</code> - Manual control</li>
                <li>• <code>executeBatch()</code> - Multiple operations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Components & HOCs</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• <code>withLoading()</code> - Wrap any component</li>
                <li>• <code>useAsyncData()</code> - Auto data loading</li>
                <li>• <code>AsyncDataRenderer</code> - Render with states</li>
                <li>• <code>useDebouncedLoading()</code> - Delayed loading</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
