# Advanced Loading System Documentation

## Overview

The Amadeus Travel Platform features a comprehensive, multi-layered loading system inspired by the beautiful "Earth" animation from Uiverse.io. This system provides both global and component-level loading states with advanced features like progress tracking, timeout handling, and error recovery.

## Architecture

### Core Components

1. **LoadingContext** - Global state management for app-wide loading states
2. **FullScreenLoader** - Beautiful animated Earth loader for major operations
3. **Loading Service** - Advanced async operation handling with timeouts and progress
4. **HOC Components** - Higher-order components for wrapping any component with loading
5. **Router Integration** - Automatic loading states for page transitions

## Quick Start

### Basic Global Loading

```tsx
import { useLoading } from '@/contexts/LoadingContext'

function MyComponent() {
  const { showLoader, hideLoader } = useLoading()
  
  const handleAsyncOperation = async () => {
    showLoader('Processing...')
    try {
      await myAsyncFunction()
    } finally {
      hideLoader()
    }
  }
}
```

### Advanced Loading Service

```tsx
import { useLoadingService } from '@/services/loadingService'

function MyComponent() {
  const { executeWithLoading, executeWithProgress } = useLoadingService()
  
  // Basic with timeout
  const handleSimpleOperation = () => {
    executeWithLoading(
      () => fetchData(),
      { 
        message: 'Loading data...', 
        timeout: 5000 
      }
    )
  }
  
  // With progress messages
  const handleComplexOperation = () => {
    executeWithProgress(
      () => complexAsyncOperation(),
      {
        messages: [
          'Initializing...',
          'Processing data...',
          'Finalizing...'
        ]
      }
    )
  }
}
```

## API Reference

### LoadingContext

| Method | Parameters | Description |
|--------|------------|-------------|
| `showLoader(message?)` | `message: string` | Show global full-screen loader |
| `hideLoader()` | - | Hide global loader |
| `setLoadingMessage(message)` | `message: string` | Update loader message |

### Loading Service

#### `executeWithLoading<T>(asyncFn, options)`

Execute an async function with loading state and optional timeout protection.

**Parameters:**
- `asyncFn: () => Promise<T>` - The async function to execute
- `options: LoadingOptions` - Configuration options

**LoadingOptions:**
```typescript
interface LoadingOptions {
  message?: string        // Loading message (default: 'Loading...')
  timeout?: number        // Timeout in ms (default: 30000)
  onTimeout?: () => void  // Timeout callback
  silent?: boolean        // Don't show global loader (default: false)
}
```

#### `executeWithProgress<T>(asyncFn, options)`

Execute an async function with progressive loading messages.

**Parameters:**
- `asyncFn: () => Promise<T>` - The async function to execute
- `options: ProgressOptions` - Progress configuration

**ProgressOptions:**
```typescript
interface ProgressOptions {
  messages: string[]      // Array of progress messages
  interval?: number       // Time between messages (default: 1500ms)
  randomDelay?: boolean   // Add random delay variation (default: true)
}
```

#### `createLoadingState(initialMessage)`

Create a manual loading state controller.

**Returns:**
```typescript
{
  start: (message?, autoHide?) => void
  stop: () => void
  updateMessage: (message) => void
  isLoading: () => boolean
}
```

#### `executeBatch(operations, options)`

Execute multiple async operations with combined loading state.

**Parameters:**
```typescript
operations: Array<{
  fn: () => Promise<T>
  name: string
}>
```

### Higher-Order Components

#### `withLoading(Component)`

Wrap any component with loading functionality.

**Props added to wrapped component:**
```typescript
interface WithLoadingProps {
  isLoading?: boolean
  loadingMessage?: string
  showInlineLoader?: boolean
  loadingComponent?: React.ComponentType
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>
  minLoadingTime?: number
}
```

**Example:**
```tsx
const MyLoadingCard = withLoading(MyCard)

// Usage
<MyLoadingCard 
  isLoading={isLoading}
  loadingMessage="Loading card data..."
  showInlineLoader={true}
  {...cardProps}
/>
```

#### `useAsyncData(asyncFn, dependencies)`

Hook for handling async data with automatic loading states.

**Returns:**
```typescript
{
  data?: T
  error?: Error
  isLoading: boolean
  retry: () => void
}
```

**Example:**
```tsx
const { data, error, isLoading, retry } = useAsyncData(
  () => fetchUserProfile(userId),
  [userId]
)
```

#### `AsyncDataRenderer`

Component for rendering async data with loading and error states.

**Props:**
```typescript
{
  children: (data: T) => React.ReactNode
  data?: T
  error?: Error
  isLoading: boolean
  retry: () => void
  loadingComponent?: React.ComponentType
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>
  loadingMessage?: string
}
```

**Example:**
```tsx
<AsyncDataRenderer
  data={userData}
  error={userError}
  isLoading={userLoading}
  retry={retryUser}
>
  {(user) => <UserProfile user={user} />}
</AsyncDataRenderer>
```

### Inline Loading Components

#### Basic Loading Spinner

```tsx
import { Loading } from '@/components/ui/loading'

<Loading message="Loading..." size="md" />
```

#### Inline Loader

```tsx
import { InlineLoader } from '@/components/ui/loading'

<InlineLoader message="Processing..." />
```

#### Skeleton Loader

```tsx
import { SkeletonLoader } from '@/components/ui/loading'

<SkeletonLoader lines={3} />
```

## Usage Patterns

### Page-Level Loading

```tsx
// app/my-page/page.tsx
'use client'

import { usePageTransitionLoader } from '@/hooks/useLoaders'

export default function MyPage() {
  usePageTransitionLoader() // Automatic page transition loading
  
  return <div>My Page Content</div>
}
```

### API Operation Loading

```tsx
import { useApiLoader } from '@/hooks/useLoaders'

export default function MyComponent() {
  const { executeWithLoader } = useApiLoader()
  
  const handleSubmit = () => {
    executeWithLoader(
      () => submitForm(formData),
      'Submitting form...'
    )
  }
}
```

### Form Loading States

```tsx
import { useDebouncedLoading } from '@/components/hoc/withLoading'

export default function SearchForm() {
  const { shouldShowLoading, setIsLoading } = useDebouncedLoading(500)
  
  const handleSearch = (query: string) => {
    setIsLoading(true)
    // Search will show loading after 500ms delay
    performSearch(query).finally(() => setIsLoading(false))
  }
  
  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {shouldShowLoading && <InlineLoader message="Searching..." />}
    </div>
  )
}
```

### Error Handling

```tsx
import { useLoadingService } from '@/services/loadingService'

export default function DataComponent() {
  const { executeWithLoading } = useLoadingService()
  
  const loadData = () => {
    executeWithLoading(
      () => fetchData(),
      {
        message: 'Loading data...',
        timeout: 10000,
        onTimeout: () => {
          alert('Request timed out. Please try again.')
        }
      }
    ).catch(error => {
      console.error('Failed to load data:', error)
      // Handle error appropriately
    })
  }
}
```

## Best Practices

### When to Use Each Loader Type

1. **FullScreenLoader** (Global)
   - Page transitions
   - Major app operations (login, logout)
   - Initial app loading
   - Long-running operations that affect the entire app

2. **InlineLoader** (Component-level)
   - Form submissions
   - Button actions
   - Component data fetching
   - Quick operations within a specific component

3. **SkeletonLoader** (Content placeholders)
   - Data lists/tables
   - Card layouts
   - Content that has a predictable structure

### Performance Considerations

1. **Debounced Loading**: Use for search inputs or rapid user interactions
2. **Minimum Loading Time**: Prevent flash of loading states for very quick operations
3. **Silent Loading**: For background operations that don't need user attention
4. **Progressive Messages**: For long operations to keep users engaged

### Error Handling

1. Always provide retry mechanisms for failed operations
2. Use timeout protection for operations that might hang
3. Show meaningful error messages to users
4. Log errors appropriately for debugging

### Accessibility

1. Loading states are announced to screen readers
2. Proper ARIA labels on loading elements
3. Keyboard navigation support in error states
4. High contrast loading indicators

## Migration Guide

### From Previous Loading System

If you have existing loading states, here's how to migrate:

**Old:**
```tsx
const [loading, setLoading] = useState(false)

const handleClick = async () => {
  setLoading(true)
  await apiCall()
  setLoading(false)
}
```

**New:**
```tsx
const { executeWithLoading } = useLoadingService()

const handleClick = () => {
  executeWithLoading(() => apiCall(), { message: 'Processing...' })
}
```

### Integration Checklist

- [ ] Wrap app in `LoadingProvider`
- [ ] Add `RouterEventListener` to root layout
- [ ] Replace manual loading states with loading service
- [ ] Add error boundaries where appropriate
- [ ] Test loading states with slow network conditions
- [ ] Verify accessibility with screen readers

## Troubleshooting

### Common Issues

1. **Loader not appearing**: Check if component is wrapped in `LoadingProvider`
2. **Multiple loaders**: Ensure proper cleanup of loading states
3. **Performance issues**: Use debounced loading for frequent operations
4. **Router events not working**: Verify `RouterEventListener` is in layout

### Debug Mode

Enable debug logging:

```tsx
// In development
if (process.env.NODE_ENV === 'development') {
  window.debugLoading = true
}
```

This will log all loading operations to the console.

## Examples

See the complete examples at:
- `/demo-loaders` - Basic loading system demonstration
- `/advanced-loading-demo` - Advanced features and patterns

## Contributing

When adding new loading features:

1. Follow the established patterns
2. Add TypeScript types
3. Include error handling
4. Add to demo pages
5. Update this documentation
