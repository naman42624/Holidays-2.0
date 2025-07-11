'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLoadingService } from '@/services/loadingService'
import { useMonitoredLoading } from '@/hooks/useLoadingPerformance'
import { withLoading, useAsyncData } from '@/components/hoc/withLoading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InlineLoader, SkeletonLoader } from '@/components/ui/loading'

// Test component for HOC
const TestCard = withLoading(({ message }: { message: string }) => (
  <Card>
    <CardContent className="p-6">
      <p className="text-center">{message}</p>
    </CardContent>
  </Card>
))

export default function LoadingSystemTest() {
  const router = useRouter()
  const [testState, setTestState] = useState('')
  const [cardLoading, setCardLoading] = useState(false)
  
  const {
    executeWithLoading,
    executeWithProgress,
    createLoadingState,
    executeBatch
  } = useLoadingService()

  const { executeWithMonitoring } = useMonitoredLoading()

  // Test async data hook
  const {
    data: testData,
    error: testError,
    isLoading: testLoading,
    retry: retryTest
  } = useAsyncData(
    () => new Promise<string>(resolve => 
      setTimeout(() => resolve('Async data loaded successfully!'), 2000)
    ),
    []
  )

  const manualLoader = createLoadingState()

  const addTestResult = (result: string) => {
    setTestState(prev => prev + `\n${new Date().toLocaleTimeString()}: ${result}`)
  }

  // Test functions
  const testBasicLoading = async () => {
    try {
      await executeWithLoading(
        () => new Promise(resolve => setTimeout(resolve, 2000)),
        { message: 'Testing basic loading...' }
      )
      addTestResult('✅ Basic loading test passed')
    } catch {
      addTestResult('❌ Basic loading test failed')
    }
  }

  const testProgressLoading = async () => {
    try {
      await executeWithProgress(
        () => new Promise(resolve => setTimeout(resolve, 6000)),
        {
          messages: [
            'Starting comprehensive test...',
            'Running diagnostics...',
            'Validating system...',
            'Finalizing results...'
          ],
          interval: 1500
        }
      )
      addTestResult('✅ Progress loading test passed')
    } catch {
      addTestResult('❌ Progress loading test failed')
    }
  }

  const testTimeoutHandling = async () => {
    try {
      await executeWithLoading(
        () => new Promise(resolve => setTimeout(resolve, 5000)),
        {
          message: 'Testing timeout (will fail after 2s)...',
          timeout: 2000,
          onTimeout: () => addTestResult('⚠️ Timeout handling working correctly')
        }
      )
      addTestResult('❌ Timeout test failed - should have timed out')
    } catch {
      addTestResult('✅ Timeout error handling working correctly')
    }
  }

  const testBatchOperations = async () => {
    try {
      const operations = [
        { fn: () => new Promise(resolve => setTimeout(() => resolve('Op 1'), 800)), name: 'Operation 1' },
        { fn: () => new Promise(resolve => setTimeout(() => resolve('Op 2'), 1200)), name: 'Operation 2' },
        { fn: () => new Promise(resolve => setTimeout(() => resolve('Op 3'), 600)), name: 'Operation 3' }
      ]

      await executeBatch(operations, { message: 'Testing batch operations...' })
      addTestResult('✅ Batch operations test passed')
    } catch {
      addTestResult('❌ Batch operations test failed')
    }
  }

  const testManualControl = () => {
    manualLoader.start('Manual loader active...', 3000)
    setTimeout(() => {
      manualLoader.updateMessage('Updating message...')
    }, 1500)
    addTestResult('✅ Manual loader control test started')
  }

  const testPerformanceMonitoring = async () => {
    try {
      await executeWithMonitoring(
        () => new Promise(resolve => setTimeout(resolve, 1500)),
        'performance-test-operation'
      )
      addTestResult('✅ Performance monitoring test passed')
    } catch {
      addTestResult('❌ Performance monitoring test failed')
    }
  }

  const testRouterNavigation = () => {
    // This will trigger the router event loader
    router.push('/flights')
  }

  const testCardLoading = () => {
    setCardLoading(true)
    setTimeout(() => {
      setCardLoading(false)
      addTestResult('✅ HOC loading test passed')
    }, 2000)
  }

  const testErrorScenario = async () => {
    try {
      await executeWithLoading(
        () => Promise.reject(new Error('Simulated error')),
        { message: 'Testing error handling...' }
      )
      addTestResult('❌ Error test failed - should have thrown')
    } catch {
      addTestResult('✅ Error handling test passed')
    }
  }

  const runAllTests = async () => {
    setTestState('Starting comprehensive loading system test...\n')
    
    await testBasicLoading()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testErrorScenario()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    testManualControl()
    await new Promise(resolve => setTimeout(resolve, 4000))
    
    await testPerformanceMonitoring()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    testCardLoading()
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    await testBatchOperations()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    addTestResult('🎉 All basic tests completed!')
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Loading System Test Suite</h1>
        <p className="text-gray-600">
          Comprehensive testing of all loading system features
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Test Suite</CardTitle>
          <CardDescription>
            Run all tests or individual test scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Button onClick={runAllTests} className="bg-green-600 hover:bg-green-700">
              Run All Tests
            </Button>
            <Button onClick={testProgressLoading} variant="outline">
              Progress Test
            </Button>
            <Button onClick={testTimeoutHandling} variant="outline">
              Timeout Test
            </Button>
            <Button onClick={testRouterNavigation} variant="outline">
              Router Test
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={testBasicLoading} variant="secondary">
              Basic Loading
            </Button>
            <Button onClick={testBatchOperations} variant="secondary">
              Batch Operations
            </Button>
            <Button onClick={testManualControl} variant="secondary">
              Manual Control
            </Button>
            <Button onClick={testPerformanceMonitoring} variant="secondary">
              Performance
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Individual Test Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* HOC Test */}
        <Card>
          <CardHeader>
            <CardTitle>Higher-Order Component Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TestCard
              message="This card shows HOC loading state"
              isLoading={cardLoading}
              loadingMessage="Card is loading..."
              showInlineLoader={true}
            />
            <Button onClick={testCardLoading} variant="outline" className="w-full">
              Test Card Loading
            </Button>
          </CardContent>
        </Card>

        {/* Async Data Test */}
        <Card>
          <CardHeader>
            <CardTitle>Async Data Hook Test</CardTitle>
          </CardHeader>
          <CardContent>
            {testLoading && <InlineLoader message="Loading async data..." />}
            {testError && (
              <div className="text-red-600 text-center">
                <p>Error: {testError.message}</p>
                <Button onClick={retryTest} size="sm" className="mt-2">
                  Retry
                </Button>
              </div>
            )}
            {testData && (
              <div className="text-green-600 text-center">
                <p>{testData}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skeleton Loader Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Skeleton Loader Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <SkeletonLoader />
            <SkeletonLoader />
            <SkeletonLoader />
            <SkeletonLoader />
          </CardContent>
        </Card>

        {/* Inline Loader Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Inline Loader Demo</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <InlineLoader message="Always loading example" />
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>
            Real-time log of test execution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 rounded p-4 h-64 overflow-y-auto font-mono text-sm">
            {testState || 'No tests run yet. Click &quot;Run All Tests&quot; to start.'}
          </div>
          <Button
            onClick={() => setTestState('')}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Clear Results
          </Button>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold">Automated Tests:</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Click &quot;Run All Tests&quot; to execute the complete test suite</li>
                <li>Individual tests can be run using the specific buttons</li>
                <li>Watch the test results panel for real-time feedback</li>
                <li>Performance metrics are tracked automatically (check bottom-right panel)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold">Manual Tests:</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Navigate between pages to test router loading</li>
                <li>Use browser back/forward buttons to test popstate handling</li>
                <li>Try slow network conditions in DevTools</li>
                <li>Test on mobile devices for responsive loading states</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">What to Look For:</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Smooth loading animations without flicker</li>
                <li>Appropriate loading messages for each operation</li>
                <li>Proper error handling and recovery</li>
                <li>Performance metrics tracking in the bottom panel</li>
                <li>No memory leaks or hanging loading states</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
