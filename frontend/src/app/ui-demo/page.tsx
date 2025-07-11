'use client'

import React, { useState } from 'react'
import { PageTransition, FadeInUp } from '@/components/ui/PageTransition'
import { SearchResultsSkeleton } from '@/components/ui/Skeleton'
import { FlightEmptyState, ErrorEmptyState } from '@/components/ui/EmptyState'
import { MicroInteraction, PulseButton, RippleButton, ProgressButton } from '@/components/ui/MicroInteractions'
import { useNotifications } from '@/components/ui/NotificationSystem'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Sparkles
} from 'lucide-react'

export default function UIShowcasePage() {
  const { addNotification } = useNotifications()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showSkeletons, setShowSkeletons] = useState(false)

  const handleProgressDemo = () => {
    setIsLoading(true)
    setProgress(0)
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsLoading(false)
          addNotification({
            type: 'success',
            title: 'Process Complete!',
            message: 'Your action has been completed successfully.',
            duration: 3000
          })
          return 0
        }
        return prev + 10
      })
    }, 200)
  }

  const showcaseNotifications = [
    {
      type: 'success' as const,
      title: 'Success Notification',
      message: 'Your booking has been confirmed successfully!'
    },
    {
      type: 'error' as const,
      title: 'Error Notification',
      message: 'There was an error processing your request.'
    },
    {
      type: 'warning' as const,
      title: 'Warning Notification',
      message: 'Your session will expire in 5 minutes.'
    },
    {
      type: 'info' as const,
      title: 'Info Notification',
      message: 'New features are now available in your dashboard.'
    }
  ]

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                UI Component Showcase
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Explore the modern UI components that power our travel platform
              </p>
            </div>
          </FadeInUp>

          <div className="grid gap-8">
            {/* Notifications Section */}
            <FadeInUp delay={0.1}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    <span>Notification System</span>
                  </CardTitle>
                  <CardDescription>
                    Toast notifications for user feedback and system messages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {showcaseNotifications.map((notification, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => addNotification(notification)}
                        className="h-20 flex flex-col items-center justify-center text-center"
                      >
                        <div className="font-medium">{notification.type}</div>
                        <div className="text-xs text-gray-500">Click to show</div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FadeInUp>

            {/* Micro-Interactions Section */}
            <FadeInUp delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle>Micro-Interactions</CardTitle>
                  <CardDescription>
                    Delightful interactions that provide instant feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-6 items-center">
                    <div className="flex items-center space-x-2">
                      <MicroInteraction
                        type="like"
                        onToggle={(state) => 
                          addNotification({
                            type: 'info',
                            title: state ? 'Liked!' : 'Unliked!',
                            message: state ? 'Added to favorites' : 'Removed from favorites',
                            duration: 2000
                          })
                        }
                      />
                      <span className="text-sm text-gray-600">Like</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MicroInteraction
                        type="bookmark"
                        onToggle={(state) => 
                          addNotification({
                            type: 'info',
                            title: state ? 'Bookmarked!' : 'Unbookmarked!',
                            message: state ? 'Saved for later' : 'Removed from saved',
                            duration: 2000
                          })
                        }
                      />
                      <span className="text-sm text-gray-600">Bookmark</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MicroInteraction
                        type="rating"
                        onToggle={(state) => 
                          addNotification({
                            type: 'success',
                            title: state ? 'Rated!' : 'Rating removed!',
                            message: 'Thank you for your feedback',
                            duration: 2000
                          })
                        }
                      />
                      <span className="text-sm text-gray-600">Rating</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MicroInteraction
                        type="share"
                        onToggle={() => 
                          addNotification({
                            type: 'info',
                            title: 'Shared!',
                            message: 'Link copied to clipboard',
                            duration: 2000
                          })
                        }
                      />
                      <span className="text-sm text-gray-600">Share</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInUp>

            {/* Button Variations Section */}
            <FadeInUp delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle>Button Variations</CardTitle>
                  <CardDescription>
                    Enhanced buttons with animations and feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <PulseButton 
                      variant="primary"
                      onClick={() => addNotification({
                        type: 'success',
                        title: 'Primary Action',
                        message: 'Primary button clicked!',
                        duration: 2000
                      })}
                    >
                      Primary Button
                    </PulseButton>
                    
                    <PulseButton 
                      variant="secondary"
                      onClick={() => addNotification({
                        type: 'info',
                        title: 'Secondary Action',
                        message: 'Secondary button clicked!',
                        duration: 2000
                      })}
                    >
                      Secondary Button
                    </PulseButton>
                    
                    <RippleButton
                      onClick={() => addNotification({
                        type: 'info',
                        title: 'Ripple Effect',
                        message: 'Button with ripple animation!',
                        duration: 2000
                      })}
                    >
                      Ripple Button
                    </RippleButton>
                    
                    <ProgressButton
                      isLoading={isLoading}
                      progress={progress}
                      onClick={handleProgressDemo}
                    >
                      Progress Button
                    </ProgressButton>
                  </div>
                </CardContent>
              </Card>
            </FadeInUp>

            {/* Loading States Section */}
            <FadeInUp delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle>Loading States</CardTitle>
                  <CardDescription>
                    Skeleton screens and loading indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowSkeletons(!showSkeletons)}
                      >
                        {showSkeletons ? 'Hide' : 'Show'} Skeleton Demo
                      </Button>
                    </div>
                    
                    {showSkeletons && (
                      <div className="grid gap-4">
                        <h4 className="font-medium text-gray-900">Flight Cards Loading</h4>
                        <SearchResultsSkeleton type="flights" count={3} />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </FadeInUp>

            {/* Empty States Section */}
            <FadeInUp delay={0.5}>
              <Card>
                <CardHeader>
                  <CardTitle>Empty States</CardTitle>
                  <CardDescription>
                    Helpful messages when there&apos;s no content to display
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Flight Empty State</h4>
                      <FlightEmptyState
                        onNewSearch={() => addNotification({
                          type: 'info',
                          title: 'New Search',
                          message: 'Starting a new flight search...',
                          duration: 2000
                        })}
                        onRefresh={() => addNotification({
                          type: 'info',
                          title: 'Refreshing',
                          message: 'Refreshing flight results...',
                          duration: 2000
                        })}
                      />
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Error State</h4>
                      <ErrorEmptyState
                        onRetry={() => addNotification({
                          type: 'info',
                          title: 'Retrying',
                          message: 'Attempting to retry the operation...',
                          duration: 2000
                        })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInUp>

            {/* Accessibility Section */}
            <FadeInUp delay={0.6}>
              <Card>
                <CardHeader>
                  <CardTitle>Accessibility Features</CardTitle>
                  <CardDescription>
                    Built-in accessibility tools for better user experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Look for the accessibility button in the bottom-left corner of the screen to access:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
                      <li>Font size adjustment (12px - 24px)</li>
                      <li>High contrast mode for better visibility</li>
                      <li>Dark mode toggle</li>
                      <li>Reduced motion settings</li>
                      <li>Keyboard navigation support</li>
                      <li>Screen reader compatibility</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </FadeInUp>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
