"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
    <div className="w-full">
      {/* Image Carousel */}
      <div className="relative aspect-[1/1] overflow-hidden rounded-xl mb-3">
        {photos.length > 0 ? (
          <>
            <Image
              src={photos[currentImageIndex].url}
              alt={photos[currentImageIndex].caption || roomName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority
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
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
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
      </div>
      {/* Room and Property Names */}
      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-[15px] leading-5">{roomName}</h3>
        <p className="text-[15px] leading-5 text-gray-500">{propertyName}</p>
      </div>
    </div>
  )
} 