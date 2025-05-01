"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface RoomCardProps {
  roomName: string
  propertyName: string
  photos: {
    url: string
    caption?: string
  }[]
}

export function RoomCard({ roomName, propertyName, photos }: RoomCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % photos.length)
  }

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  return (
    <div className="group relative flex flex-col gap-2">
      {/* Image Carousel */}
      <div className="relative aspect-square overflow-hidden rounded-xl">
        {photos.length > 0 ? (
          <>
            <Image
              src={photos[currentImageIndex].url}
              alt={photos[currentImageIndex].caption || roomName}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            {/* Navigation Buttons - Only show on hover if there are multiple images */}
            {photos.length > 1 && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={previousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white p-1.5 shadow-md transition hover:scale-110"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white p-1.5 shadow-md transition hover:scale-110"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
            {/* Image Indicators */}
            {photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1">
                {photos.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full bg-white transition",
                      index === currentImageIndex ? "opacity-100" : "opacity-50"
                    )}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100">
            <p className="text-sm text-gray-500">No image available</p>
          </div>
        )}
        {/* Favorite Button */}
        <button className="absolute right-4 top-4 rounded-full bg-white p-1.5 shadow-md transition hover:scale-110">
          <Heart className="h-4 w-4" />
        </button>
      </div>
      {/* Room and Property Names */}
      <div className="flex flex-col">
        <h3 className="text-lg font-medium">{roomName}</h3>
        <p className="text-sm text-gray-500">{propertyName}</p>
      </div>
    </div>
  )
} 