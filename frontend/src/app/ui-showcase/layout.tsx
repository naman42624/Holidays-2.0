import React from 'react'

export const metadata = {
  title: 'UI Component Showcase | Amadeus Travel Platform',
  description: 'Demonstration of custom UI components for the Amadeus Travel Platform',
}

export default function UIShowcaseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className="flex min-h-screen flex-col">
      {children}
    </section>
  )
}
