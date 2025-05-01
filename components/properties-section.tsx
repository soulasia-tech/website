"use client"

import { useEffect, useState } from "react"
import { PropertyCard } from "@/components/property-card"

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
            <div key={i} className="animate-pulse w-full">
              <div className="aspect-[1/1] rounded-xl bg-gray-200 mb-3" />
              <div className="h-5 w-2/3 rounded bg-gray-200 mb-1" />
              <div className="h-5 w-1/2 rounded bg-gray-200 mb-1" />
              <div className="h-5 w-1/4 rounded bg-gray-200" />
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