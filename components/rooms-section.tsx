"use client"

import { useEffect, useState } from "react"
import { RoomCard } from "@/components/room-card"
import { addDays, format } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface RoomType {
  roomTypeID: string
  roomTypeName: string
  propertyName: string
  roomTypePhotos: string[]
  rate?: number
}

interface CloudbedsRoomType {
  roomTypeID: string
  roomTypeName: string
  roomTypePhotos: string[]
}

export function RoomsSection() {
  const [rooms, setRooms] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // First, get properties
        const propertiesRes = await fetch('/api/cloudbeds-properties')
        const propertiesData = await propertiesRes.json()
        
        if (!propertiesData.success) {
          throw new Error('Failed to load properties')
        }

        // Then, fetch rooms for each property
        const allRooms: RoomType[] = []
        for (const property of propertiesData.properties) {
          // Get room types
          const roomsRes = await fetch(`/api/cloudbeds/room-types?propertyId=${property.propertyId}`)
          const roomsData = await roomsRes.json()
          
          if (roomsData.success && roomsData.roomTypes) {
            // Get rates for the next 5 days
            const startDate = format(new Date(), 'yyyy-MM-dd')
            const endDate = format(addDays(new Date(), 5), 'yyyy-MM-dd')
            const ratesRes = await fetch(
              `/api/cloudbeds/rate-plans?propertyId=${property.propertyId}&startDate=${startDate}&endDate=${endDate}`
            )
            const ratesData = await ratesRes.json()

            // Create a map of room type ID to lowest rate
            const rateMap: { [roomTypeID: string]: number } = {}
            if (ratesData.success && Array.isArray(ratesData.ratePlans)) {
              ratesData.ratePlans.forEach((rate: { roomTypeID: string; totalRate: number }) => {
                if (!rateMap[rate.roomTypeID] || rate.totalRate < rateMap[rate.roomTypeID]) {
                  rateMap[rate.roomTypeID] = Math.round(rate.totalRate)
                }
              })
            }

            // Transform room data to match our interface
            const transformedRooms = roomsData.roomTypes.map((room: CloudbedsRoomType) => ({
              roomTypeID: room.roomTypeID,
              roomTypeName: room.roomTypeName,
              propertyName: property.propertyName,
              roomTypePhotos: room.roomTypePhotos || [],
              rate: rateMap[room.roomTypeID]
            }))
            allRooms.push(...transformedRooms)
          }
        }

        setRooms(allRooms)
      } catch (err) {
        console.error('Error fetching rooms:', err)
        setError('Failed to fetch rooms')
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
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
        {rooms.map((room) => (
          <RoomCard
            key={room.roomTypeID}
            roomName={room.roomTypeName}
            propertyName={room.propertyName}
            photos={room.roomTypePhotos.map(url => ({ url, caption: '' }))}
            rate={room.rate}
          />
        ))}
      </div>
    </section>
  )
} 