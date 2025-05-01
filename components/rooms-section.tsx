"use client"

import { useEffect, useState } from "react"
import { RoomCard } from "@/components/room-card"

interface Property {
  propertyId: string
  propertyName: string
}

interface RoomType {
  roomTypeID: string
  roomTypeName: string
  propertyName: string
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
          const roomsRes = await fetch(`/api/test-cloudbeds-roomtypes?propertyId=${property.propertyId}`)
          const roomsData = await roomsRes.json()
          
          if (roomsData.success && roomsData.roomTypes) {
            // Transform room data to match our interface
            const transformedRooms = roomsData.roomTypes.map((room: any) => ({
              roomTypeID: room.roomTypeID,
              roomTypeName: room.roomTypeName,
              propertyName: property.propertyName,
              roomTypePhotos: room.roomTypePhotos || []
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
              <div className="h-5 w-1/2 rounded bg-gray-200" />
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
          />
        ))}
      </div>
    </section>
  )
} 