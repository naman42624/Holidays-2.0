import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Simple test to verify Jest setup
describe('Jest Setup', () => {
  test('should render a simple component', () => {
    const TestComponent = () => <div>Test Component</div>
    render(<TestComponent />)
    
    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })
})
