"use client"

import { useEffect, useState } from "react"
import { RoomCard } from "@/components/room-card"
import { addDays, format } from "date-fns"

interface Property {
  propertyId: string
  propertyName: string
}

interface RoomType {
  roomTypeID: string
  roomTypeName: string
  propertyName: string
  roomTypePhotos: string[]
  rate?: number
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
          const roomsRes = await fetch(`/api/test-cloudbeds-roomtypes?propertyId=${property.propertyId}`)
          const roomsData = await roomsRes.json()
          
          if (roomsData.success && roomsData.roomTypes) {
            // Get rates for the next 5 days
            const startDate = format(new Date(), 'yyyy-MM-dd')
            const endDate = format(addDays(new Date(), 5), 'yyyy-MM-dd')
            const ratesRes = await fetch(
              `/api/test-cloudbeds-rateplans?propertyId=${property.propertyId}&startDate=${startDate}&endDate=${endDate}`
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
            const transformedRooms = roomsData.roomTypes.map((room: any) => ({
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