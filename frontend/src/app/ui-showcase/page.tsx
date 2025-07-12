'use client'

import React, { useState } from 'react'
import ShimmerButton from '@/components/ui/shimmer-button'
import GradientBackground from '@/components/ui/gradient-background'
import AnimatedBackground from '@/components/ui/animated-background'
import FadeIn from '@/components/ui/fade-in'

export default function UIShowcase() {
  const [selectedComponent, setSelectedComponent] = useState<string>('shimmer-button')

  const renderComponentDemo = () => {
    switch (selectedComponent) {
      case 'shimmer-button':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold mb-4">Shimmer Button</h2>
            <p className="text-gray-600 mb-6">
              A button component with customizable shimmer effect.
            </p>
            
            <div className="flex flex-col gap-4 items-center">
              <ShimmerButton>Default Shimmer Button</ShimmerButton>
              
              <ShimmerButton
                shimmerColor="#ffff00"
                background="linear-gradient(110deg, #22c55e, #16a34a, #15803d)"
              >
                Green Shimmer Button
              </ShimmerButton>
              
              <ShimmerButton
                shimmerColor="#ff00ff"
                background="linear-gradient(110deg, #7e22ce, #6d28d9, #4c1d95)"
                shimmerSize="0.2em"
                shimmerDuration="1.5s"
              >
                Purple Fast Shimmer Button
              </ShimmerButton>
              
              <ShimmerButton
                shimmerColor="#ffffff"
                background="linear-gradient(110deg, #ef4444, #dc2626, #b91c1c)"
                shimmerSize="0.05em"
                shimmerDuration="3s"
              >
                Red Slow Shimmer Button
              </ShimmerButton>
            </div>
          </div>
        )
      
      case 'gradient-background':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold mb-4">Gradient Background</h2>
            <p className="text-gray-600 mb-6">
              A component that adds customizable gradient backgrounds.
            </p>
            
            <div className="space-y-6">
              <GradientBackground className="p-8 rounded-lg text-white">
                <h3 className="text-xl font-medium mb-2">Default Gradient</h3>
                <p>This uses the default blue gradient colors.</p>
              </GradientBackground>
              
              <GradientBackground 
                className="p-8 rounded-lg text-white"
                colors={['#ef4444', '#f97316', '#f59e0b', '#eab308']}
                direction="to-b"
              >
                <h3 className="text-xl font-medium mb-2">Warm Gradient (Top to Bottom)</h3>
                <p>A warm gradient from red to yellow.</p>
              </GradientBackground>
              
              <GradientBackground 
                className="p-8 rounded-lg text-white"
                colors={['#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9']}
                direction="to-br"
                animate={true}
              >
                <h3 className="text-xl font-medium mb-2">Animated Gradient</h3>
                <p>This gradient slowly animates between colors.</p>
              </GradientBackground>
            </div>
          </div>
        )
        
      case 'animated-background':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold mb-4">Animated Background</h2>
            <p className="text-gray-600 mb-6">
              A component that adds different animated patterns to backgrounds.
            </p>
            
            <div className="space-y-6">
              <AnimatedBackground 
                className="p-8 rounded-lg"
                pattern="dots"
              >
                <h3 className="text-xl font-medium mb-2">Dots Pattern</h3>
                <p>A subtle dotted background pattern.</p>
              </AnimatedBackground>
              
              <AnimatedBackground 
                className="p-8 rounded-lg"
                pattern="waves"
                patternColor="#3b82f6"
                speed="fast"
              >
                <h3 className="text-xl font-medium mb-2">Fast Waves Pattern</h3>
                <p>An animated wave pattern with faster movement.</p>
              </AnimatedBackground>
              
              <AnimatedBackground 
                className="p-8 rounded-lg text-white"
                pattern="grid"
                backgroundColor="#1e293b"
                patternColor="#ffffff"
                patternOpacity={0.05}
                patternSize="30px"
              >
                <h3 className="text-xl font-medium mb-2">Grid Pattern on Dark</h3>
                <p>A subtle grid pattern on a dark background.</p>
              </AnimatedBackground>
              
              <AnimatedBackground 
                className="p-8 rounded-lg min-h-[200px]"
                pattern="particles"
                patternColor="#6d28d9"
                patternOpacity={0.3}
              >
                <h3 className="text-xl font-medium mb-2">Particles</h3>
                <p>Floating particle effect.</p>
              </AnimatedBackground>
            </div>
          </div>
        )
        
      case 'fade-in':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold mb-4">Fade In</h2>
            <p className="text-gray-600 mb-6">
              A component that fades in content when it becomes visible in the viewport.
            </p>
            
            <div className="space-y-12">
              <FadeIn direction="up" className="p-6 bg-white shadow-md rounded-lg">
                <h3 className="text-xl font-medium mb-2">Fade from Bottom</h3>
                <p>This content fades in from the bottom.</p>
              </FadeIn>
              
              <FadeIn direction="down" delay={0.2} className="p-6 bg-white shadow-md rounded-lg">
                <h3 className="text-xl font-medium mb-2">Fade from Top</h3>
                <p>This content fades in from the top with a slight delay.</p>
              </FadeIn>
              
              <FadeIn direction="left" duration={0.8} className="p-6 bg-white shadow-md rounded-lg">
                <h3 className="text-xl font-medium mb-2">Fade from Right</h3>
                <p>This content fades in from the right with a longer duration.</p>
              </FadeIn>
              
              <FadeIn direction="right" distance="40px" className="p-6 bg-white shadow-md rounded-lg">
                <h3 className="text-xl font-medium mb-2">Fade from Left</h3>
                <p>This content fades in from the left with a greater distance.</p>
              </FadeIn>
              
              <FadeIn direction="none" className="p-6 bg-white shadow-md rounded-lg">
                <h3 className="text-xl font-medium mb-2">Simple Fade</h3>
                <p>This content simply fades in without movement.</p>
              </FadeIn>
            </div>
          </div>
        )
        
      default:
        return <div>Select a component to view its demo</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">UI Component Showcase</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A demonstration of custom UI components created for the Holidays Travel Platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm rounded-lg p-4">
              <h2 className="text-lg font-medium mb-4">Components</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedComponent('shimmer-button')}
                  className={`w-full text-left px-4 py-2 rounded-md ${selectedComponent === 'shimmer-button' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                >
                  Shimmer Button
                </button>
                <button
                  onClick={() => setSelectedComponent('gradient-background')}
                  className={`w-full text-left px-4 py-2 rounded-md ${selectedComponent === 'gradient-background' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                >
                  Gradient Background
                </button>
                <button
                  onClick={() => setSelectedComponent('animated-background')}
                  className={`w-full text-left px-4 py-2 rounded-md ${selectedComponent === 'animated-background' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                >
                  Animated Background
                </button>
                <button
                  onClick={() => setSelectedComponent('fade-in')}
                  className={`w-full text-left px-4 py-2 rounded-md ${selectedComponent === 'fade-in' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                >
                  Fade In
                </button>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <div className="bg-white shadow-sm rounded-lg p-6">
              {renderComponentDemo()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}