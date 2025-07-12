# UI Design System Guidelines

## Responsive Design Patterns

### Icons
- **Mobile (< 640px)**: `w-3 h-3` or `w-4 h-4`
- **Desktop (≥ 640px)**: `w-4 h-4` or `w-5 h-5`
- **Pattern**: `w-3 h-3 sm:w-4 sm:h-4` or `w-4 h-4 sm:w-5 sm:h-5`

### Form Elements
- **Input Height**: `h-10 sm:h-12`
- **Input Padding**: `px-2 sm:px-3` or `pl-8 sm:pl-10` (with icons)
- **Icon Position**: `left-2 sm:left-3`
- **Font Size**: `text-sm sm:text-base`

### Buttons
- **Height**: `h-10 sm:h-12`
- **Padding**: `px-4 sm:px-6`
- **Font Size**: `text-sm sm:text-base`
- **Icon Size**: `w-4 h-4 sm:w-5 sm:h-5`

### Typography
- **Body Text**: `text-sm sm:text-base`
- **Headings**: Scale appropriately with breakpoints
- **Labels**: `text-sm font-medium`

## Color Consistency

### Primary Colors
- **Blue**: `bg-blue-600 hover:bg-blue-700`
- **Text**: `text-gray-900` (primary), `text-gray-600` (secondary)
- **Borders**: `border-gray-300 focus:border-blue-500`

### Error States
- **Border**: `border-red-500`
- **Text**: `text-red-500`
- **Background**: `bg-red-50`

## Component Standards

### Search Inputs
- Use `EnhancedSearchInput` component
- Consistent icon sizing and positioning
- Proper focus states and animations

### Form Inputs
- Use `FormInput` component for text inputs
- Use `FormSelect` component for dropdowns
- Include labels and error states

### Navigation
- Responsive icon sizing
- Hide text labels on smaller screens where appropriate
- Consistent hover states

## Layout Patterns

### Container Widths
- **Full Width**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Narrow**: `max-w-md mx-auto`
- **Wide**: `max-w-4xl mx-auto`

### Spacing
- **Section Padding**: `py-6 sm:py-8 lg:py-12`
- **Element Margins**: `mb-4 sm:mb-6`
- **Grid Gaps**: `gap-4 sm:gap-6`

### Grid Systems
- **Forms**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Cards**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- **Responsive**: Always include breakpoint variants

## Interaction Guidelines

### Hover States
- **Buttons**: Scale or color change
- **Cards**: Shadow elevation
- **Links**: Color transition

### Focus States
- **Inputs**: Border color change + ring
- **Buttons**: Ring outline
- **Links**: Underline or color change

### Loading States
- **Spinners**: Consistent size and color
- **Skeleton**: Match content structure
- **Disabled**: Opacity and cursor changes

## Accessibility

### Touch Targets
- **Minimum Size**: 44px × 44px on mobile
- **Button Padding**: Ensure adequate touch area
- **Spacing**: Sufficient between interactive elements

### Color Contrast
- **Text**: Minimum 4.5:1 ratio
- **Interactive Elements**: Minimum 3:1 ratio
- **Error States**: High contrast for visibility

### Keyboard Navigation
- **Tab Order**: Logical flow
- **Focus Indicators**: Clear and visible
- **Skip Links**: Where appropriate

## Animation Guidelines

### Durations
- **Micro-interactions**: 150-200ms
- **Page transitions**: 300-400ms
- **Loading states**: Continuous, subtle

### Easing
- **UI interactions**: `ease-in-out`
- **Entrances**: `ease-out`
- **Exits**: `ease-in`

## Implementation Checklist

### For New Components
- [ ] Responsive icon sizing
- [ ] Consistent spacing and typography
- [ ] Proper focus and hover states
- [ ] Error state handling
- [ ] Accessibility attributes
- [ ] Loading states where applicable

### For Existing Components
- [ ] Audit for responsive issues
- [ ] Check icon consistency
- [ ] Verify color usage
- [ ] Test on multiple screen sizes
- [ ] Validate accessibility compliance
