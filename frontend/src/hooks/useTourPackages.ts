import { useState, useEffect } from 'react'
import api, { endpoints } from '@/lib/api'
import { TourPackage } from '@/types/tourPackage'

export function useTourPackages() {
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTourPackages = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await api.get(endpoints.tourPackages.all)
        
        if (response.data.success) {
          // Filter for published packages and get the first 3 for homepage
          const publishedPackages = response.data.data.filter((pkg: TourPackage) => pkg.isPublished)
          setTourPackages(publishedPackages.slice(0, 3))
        } else {
          throw new Error('Failed to fetch tour packages')
        }
      } catch (error) {
        console.error('Error fetching tour packages:', error)
        setError(error instanceof Error ? error.message : 'An error occurred')
        // Set empty array on error so UI can handle gracefully
        setTourPackages([])
      } finally {
        setLoading(false)
      }
    }

    fetchTourPackages()
  }, [])

  return { tourPackages, loading, error }
}
