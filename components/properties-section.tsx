"use client"

import { useEffect, useState } from "react"
import { PropertyCard } from "@/components/property-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Property {
  propertyId: string
  propertyName: string
  location: string
  pricePerDay?: number
  photos: {
    url: string
    caption?: string
  }[]
}

export function PropertiesSection() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // First, get properties list
        const propertiesRes = await fetch('/api/cloudbeds-properties')
        const propertiesData = await propertiesRes.json()
        
        if (!propertiesData.success) {
          throw new Error('Failed to load properties')
        }

        // Then, fetch details for each property
        const allProperties: Property[] = []
        for (const property of propertiesData.properties) {
          // Get property details including photos
          const detailsRes = await fetch(`/api/test-cloudbeds-property?propertyId=${property.propertyId}`)
          const detailsData = await detailsRes.json()
          
          if (detailsData.success && detailsData.hotel) {
            const hotel = detailsData.hotel
            
            // Combine main property image and additional photos
            const allPhotos = []
            if (hotel.propertyImage && hotel.propertyImage[0]) {
              allPhotos.push({
                url: hotel.propertyImage[0].image,
                caption: 'Main Property Image'
              })
            }
            if (hotel.propertyAdditionalPhotos) {
              allPhotos.push(...hotel.propertyAdditionalPhotos.map((photo: { image: string }) => ({
                url: photo.image,
                caption: ''
              })))
            }

            // Get location from address
            const address = hotel.propertyAddress
            const location = address ? [
              address.propertyCity,
              address.propertyState,
              address.propertyCountry
            ].filter(Boolean).join(', ') : ''

            // Transform property data
            const transformedProperty: Property = {
              propertyId: property.propertyId,
              propertyName: hotel.propertyName,
              location,
              photos: allPhotos,
              pricePerDay: property.price_per_day
            }
            allProperties.push(transformedProperty)
          }
        }

        setProperties(allProperties)
      } catch (err) {
        console.error('Error fetching properties:', err)
        setError('Failed to fetch properties')
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-full group">
              {/* Image Skeleton */}
              <div className="relative aspect-[1/1] overflow-hidden rounded-xl mb-3 bg-gray-200 animate-pulse">
                {/* Navigation Buttons */}
                <button
                  className={cn(
                    "absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-md",
                    "opacity-0 group-hover:opacity-100"
                  )}
                >
                  <ChevronLeft className="h-4 w-4 text-gray-400" />
                </button>
                <button
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-md",
                    "opacity-0 group-hover:opacity-100"
                  )}
                >
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="h-1.5 w-1.5 rounded-full bg-white/50"
                    />
                  ))}
                </div>
              </div>
              {/* Text Skeletons */}
              <div className="space-y-2">
                <div className="h-5 w-3/4 rounded bg-gray-200 animate-pulse" />
                <div className="h-5 w-1/2 rounded bg-gray-200 animate-pulse" />
                <div className="h-5 w-1/3 rounded bg-gray-200 animate-pulse mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-red-500">
        {error}
      </div>
    )
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.propertyId}
            propertyName={property.propertyName}
            location={property.location}
            photos={property.photos}
            pricePerDay={property.pricePerDay}
          />
        ))}
      </div>
    </section>
  )
} 