import React from 'react'

export const metadata = {
  title: 'UI Component Showcase | Holidays Travel Platform',
  description: 'Demonstration of custom UI components for the Holidays Travel Platform',
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
