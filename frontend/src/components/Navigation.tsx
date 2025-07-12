'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { User, LogOut, Menu } from 'lucide-react'

export default function Navigation() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  // const navigation = [
  //   { name: 'Flights', href: '/flights', icon: Plane },
  //   { name: 'Hotels', href: '/hotels', icon: Hotel },
  //   { name: 'Activities', href: '/activities', icon: Map },
  //   { name: 'Tour Packages', href: '/tour-packages', icon: Map },
  //   { name: 'Services', href: '/services', icon: Grid },
  //   { name: 'About', href: '/about', icon: Info },
  //   { name: 'Contact', href: '/contact', icon: Phone },
  // ]
  const navigation = []

  // Add test page link in development
  const isDev = process.env.NODE_ENV === 'development'
  if (isDev) {
    navigation.push({ name: 'Test', href: '/test', icon: Menu })
    navigation.push({ name: 'Loaders', href: '/demo-loaders', icon: Menu })
    navigation.push({ name: 'Test Suite', href: '/loading-test', icon: Menu })
  }

  // Check if user has admin access
  const hasAdminAccess = user && ['admin', 'super-admin', 'website-editor'].includes(user.role)

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/logo.png" 
                  alt="Holidays by Bells" 
                  width={160}
                  height={40}
                  className="h-10 w-auto"
                />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors"
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden lg:inline">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Hello, {user.firstName}
                </span>
                {hasAdminAccess && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="text-amber-700 border-amber-700 hover:bg-amber-50">
                      Admin Portal
                    </Button>
                  </Link>
                )}
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login">
                  <Button variant="ghost" className="hover:bg-amber-50 hover:text-amber-600">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">Sign up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </Link>
              )
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div className="space-y-1">
                <div className="px-3 py-2">
                  <div className="text-base font-medium text-gray-800">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
                {hasAdminAccess && (
                  <Link
                    href="/admin"
                    className="flex items-center px-3 py-2 text-base font-medium text-amber-700 hover:bg-amber-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    </svg>
                    Admin Portal
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4 mr-3" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
