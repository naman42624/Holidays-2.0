// Color Standardization Utility
// This file provides utility functions and constants for maintaining consistent colors across the app

export const BRAND_COLORS = {
  // Primary blue theme (unified across the app)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Accent colors (sky blue for variation)
  accent: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Success (green)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Warning (yellow - only for warnings)
  warning: {
    50: '#fefce8',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Error (red)
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Neutral (gray)
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  }
}

// Utility functions for consistent color usage
export const getIconColors = (variant: 'primary' | 'accent' | 'success' | 'warning' | 'error' = 'primary') => {
  const colors = BRAND_COLORS[variant]
  return {
    background: colors[100],
    icon: colors[600],
    hover: colors[200]
  }
}

export const getButtonColors = (variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' = 'primary'): { background: string; hover: string; text: string } => {
  switch (variant) {
    case 'primary':
      return {
        background: BRAND_COLORS.primary[600],
        hover: BRAND_COLORS.primary[700],
        text: 'white'
      }
    case 'secondary':
      return {
        background: BRAND_COLORS.neutral[100],
        hover: BRAND_COLORS.neutral[200],
        text: BRAND_COLORS.neutral[700]
      }
    case 'success':
      return {
        background: BRAND_COLORS.success[600],
        hover: BRAND_COLORS.success[700],
        text: 'white'
      }
    case 'warning':
      return {
        background: BRAND_COLORS.warning[500],
        hover: BRAND_COLORS.warning[600],
        text: 'white'
      }
    case 'error':
      return {
        background: BRAND_COLORS.error[600],
        hover: BRAND_COLORS.error[700],
        text: 'white'
      }
    default:
      return getButtonColors('primary')
  }
}

export const getStatusColors = (status: 'published' | 'draft' | 'pending' | 'confirmed' | 'cancelled') => {
  switch (status) {
    case 'published':
    case 'confirmed':
      return {
        background: BRAND_COLORS.success[100],
        text: BRAND_COLORS.success[800]
      }
    case 'draft':
    case 'pending':
      return {
        background: BRAND_COLORS.warning[100],
        text: BRAND_COLORS.warning[800]
      }
    case 'cancelled':
      return {
        background: BRAND_COLORS.error[100],
        text: BRAND_COLORS.error[800]
      }
    default:
      return {
        background: BRAND_COLORS.neutral[100],
        text: BRAND_COLORS.neutral[800]
      }
  }
}

// CSS class generators
export const generateTailwindClasses = {
  icon: (variant: 'primary' | 'accent' | 'success' | 'warning' | 'error' = 'primary') => {
    const variantMap = {
      primary: 'bg-blue-100 text-blue-600',
      accent: 'bg-sky-100 text-sky-600',
      success: 'bg-green-100 text-green-600',
      warning: 'bg-yellow-100 text-yellow-600',
      error: 'bg-red-100 text-red-600'
    }
    return variantMap[variant]
  },
  
  button: (variant: 'primary' | 'secondary' | 'success' | 'warning' | 'error' = 'primary') => {
    const variantMap = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
      success: 'bg-green-600 hover:bg-green-700 text-white',
      warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      error: 'bg-red-600 hover:bg-red-700 text-white'
    }
    return variantMap[variant]
  },
  
  status: (status: 'published' | 'draft' | 'pending' | 'confirmed' | 'cancelled') => {
    const statusMap = {
      published: 'bg-green-100 text-green-800',
      confirmed: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return statusMap[status] || 'bg-gray-100 text-gray-800'
  }
}

// Validation function to check if colors follow the design system
export const validateColorUsage = (element: string, colorList: string[]) => {
  const approvedColors = [
    ...Object.values(BRAND_COLORS.primary),
    ...Object.values(BRAND_COLORS.accent),
    ...Object.values(BRAND_COLORS.success),
    ...Object.values(BRAND_COLORS.error),
    ...Object.values(BRAND_COLORS.neutral),
    ...Object.values(BRAND_COLORS.warning)
  ]
  
  const invalidColors = colorList.filter(color => !approvedColors.includes(color))
  
  if (invalidColors.length > 0) {
    console.warn(`❌ Invalid colors found in ${element}:`, invalidColors)
    console.log(`✅ Consider using approved colors from the design system`)
    return false
  }
  
  return true
}
