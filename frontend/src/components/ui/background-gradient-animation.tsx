"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export const BackgroundGradientAnimation = ({
  gradientBackgroundStart = "rgb(255, 255, 255)",
  gradientBackgroundEnd = "rgb(243, 243, 243)",
  firstColor = "255, 215, 0",  // Gold
  secondColor = "255, 223, 0", // Slightly different gold
  thirdColor = "255, 255, 255", // White
  fourthColor = "255, 200, 0", // Darker gold
  fifthColor = "255, 235, 122", // Light gold
  pointerColor = "255, 215, 0", // Gold for pointer
  size = "80%",
  blendingValue = "soft-light" as const, // Softer blending to be more subtle
  children,
  className,
  interactive = true,
  containerClassName,
}: {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  blendingValue?: string;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  containerClassName?: string;
}) => {
  const interactiveRef = useRef<HTMLDivElement>(null);
  
  // Current and target positions for the pointer
  const [curX, setCurX] = useState(0);
  const [curY, setCurY] = useState(0);
  const [tgX, setTgX] = useState(0);
  const [tgY, setTgY] = useState(0);
  
  // Creating a container ref to properly set CSS variables on the component itself
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Set CSS variables for consistent styling
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    container.style.setProperty("--gradient-background-start", gradientBackgroundStart);
    container.style.setProperty("--gradient-background-end", gradientBackgroundEnd);
    container.style.setProperty("--first-color", firstColor);
    container.style.setProperty("--second-color", secondColor);
    container.style.setProperty("--third-color", thirdColor);
    container.style.setProperty("--fourth-color", fourthColor);
    container.style.setProperty("--fifth-color", fifthColor);
    container.style.setProperty("--pointer-color", pointerColor);
    container.style.setProperty("--size", size);
    container.style.setProperty("--blending-value", blendingValue);
  }, [gradientBackgroundStart, gradientBackgroundEnd, firstColor, secondColor, thirdColor, 
      fourthColor, fifthColor, pointerColor, size, blendingValue]);

  // Smooth movement effect
  useEffect(() => {
    if (!interactive) return;
    
    function move() {
      if (interactiveRef.current) {
        setCurX(curX + (tgX - curX) / 20);
        setCurY(curY + (tgY - curY) / 20);
        interactiveRef.current.style.transform = `translate(${Math.round(curX - 350)}px, ${Math.round(curY - 350)}px)`;
      }
      requestAnimationFrame(move);
    }

    const animationId = requestAnimationFrame(move);
    return () => cancelAnimationFrame(animationId);
  }, [curX, curY, tgX, tgY, interactive]);

  // Handle mouse movement
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    setTgX(event.clientX - rect.left);
    setTgY(event.clientY - rect.top);
  };
  
  // Check if browser is Safari for special CSS handling
  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "h-full w-full relative overflow-hidden bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))]",
        containerClassName
      )}
      onMouseMove={handleMouseMove}
    >
      {/* SVG filter for advanced blur effects */}
      <svg className="hidden">
        <defs>
          <filter id="blurMe">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Content layer */}
      <div className={cn("relative z-10 w-full h-full", className)}>
        {children}
      </div>
      
      {/* Gradients container - exactly matching the reference */}
      <div
        className={cn(
          "gradients-container absolute inset-0 h-full w-full overflow-hidden blur-lg",
          isSafari ? "blur-2xl" : "[filter:url(#blurMe)_blur(40px)]"
        )}
      >
        {/* First gradient blob */}
        {/* <div 
          className="absolute animation-first"
          style={{
            background: `radial-gradient(circle at center, rgba(${firstColor}, 1) 0%, rgba(${firstColor}, 0.5) 50%) no-repeat`,
            mixBlendMode: blendingValue as any,
            width: size,
            height: size,
            top: `calc(50% - ${parseInt(size.toString()) / 2}px)`,
            left: `calc(50% - ${parseInt(size.toString()) / 2}px)`,
            transformOrigin: 'center center',
            opacity: 1,
          }}
        /> */}
        
        {/* Second gradient blob */}
        {/* <div 
          className="absolute animation-second"
          style={{
            background: `radial-gradient(circle at center, rgba(${secondColor}, 1) 0%, rgba(${secondColor}, 0) 50%) no-repeat`,
            mixBlendMode: blendingValue as any,
            width: size,
            height: size,
            top: `calc(50% - ${parseInt(size.toString()) / 2}px)`,
            left: `calc(50% - ${parseInt(size.toString()) / 2}px)`,
            transformOrigin: 'calc(50% - 400px)',
            opacity: 1,
            animation: `second 15s ease-in-out infinite`
          }}
        /> */}
        
        {/* Third gradient blob */}
        {/* <div 
          className="absolute animation-third"
          style={{
            background: `radial-gradient(circle at center, rgba(${thirdColor}, 1) 0%, rgba(${thirdColor}, 0) 50%) no-repeat`,
            mixBlendMode: blendingValue as any,
            width: size,
            height: size,
            top: `calc(50% - ${parseInt(size.toString()) / 2}px)`,
            left: `calc(50% - ${parseInt(size.toString()) / 2}px)`,
            transformOrigin: 'calc(50% + 400px)',
            opacity: 1
          }}
        /> */}
        
        {/* Fourth gradient blob */}
        {/* <div 
          className="absolute animation-fourth"
          style={{
            background: `radial-gradient(circle at center, rgba(${fourthColor}, 1) 0%, rgba(${fourthColor}, 0) 50%) no-repeat`,
            mixBlendMode: blendingValue as any,
            width: size,
            height: size,
            top: `calc(50% - ${parseInt(size.toString()) / 2}px)`,
            left: `calc(50% - ${parseInt(size.toString()) / 2}px)`,
            transformOrigin: 'calc(50% - 200px)',
            opacity: 0.9
          }}
        /> */}
        
        {/* Fifth gradient blob */}
        {/* <div 
          className="absolute animation-fifth"
          style={{
            background: `radial-gradient(circle at center, rgba(${fifthColor}, 1) 0%, rgba(${fifthColor}, 0) 50%) no-repeat`,
            mixBlendMode: blendingValue as any,
            width: size,
            height: size,
            top: `calc(50% - ${parseInt(size.toString()) / 2}px)`,
            left: `calc(50% - ${parseInt(size.toString()) / 2}px)`,
            transformOrigin: 'calc(50% - 800px) calc(50% + 800px)',
            opacity: 1
          }}
        /> */}
        
        {/* Interactive mouse-following gradient */}
        {interactive && (
          <div
            ref={interactiveRef}
            className={cn(
              `absolute opacity-70`,
              `[background:radial-gradient(circle_at_center,_rgba(var(--pointer-color),_0.8)_0,_rgba(var(--pointer-color),_0)_50%)_no-repeat]`,
              `[mix-blend-mode:var(--blending-value)] w-[700px] h-[700px]`,
              `will-change-transform`
            )}
            style={{
              transform: 'translate(0px, 0px)'
            }}
          />
        )}
      </div>
    </div>
  );
};
