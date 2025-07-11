import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Login - Travel Platform',
  description: 'Login to the admin portal',
}

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
