'use client'

import React from 'react'
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"

export default function HeroBackgroundGradient({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full relative overflow-hidden">
      <BackgroundGradientAnimation
        gradientBackgroundStart="rgb(255, 255, 255)" // White background
        gradientBackgroundEnd="rgb(252, 248, 232)" // Very subtle cream
        firstColor="255, 215, 0"   // Gold (main color from logo)
        secondColor="255, 223, 0"  // Slightly different gold
        thirdColor="255, 255, 255" // White for contrast
        fourthColor="255, 200, 0"  // Darker gold
        fifthColor="255, 235, 122" // Light gold
        pointerColor="255, 215, 0" // Gold for pointer
        blendingValue="hard-light" // Better blending to see the gradients
        size="80%" // Proper size for the gradients
        containerClassName="w-full py-20 min-h-[500px]" // Set minimum height to ensure full visibility
      >
        {children}
      </BackgroundGradientAnimation>
    </div>
  )
}
