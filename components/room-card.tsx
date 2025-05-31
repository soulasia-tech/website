"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface RoomCardProps {
  roomName: string
  propertyName?: string
  photos: {
    url: string
    caption?: string
  }[]
  rate?: number
  amenities?: string[]
}

export function RoomCard({ roomName, propertyName, photos, rate, amenities }: RoomCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % photos.length)
    setImageLoaded(false)
  }

  const previousImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length)
    setImageLoaded(false)
  }

  return (
    <div className="w-full group">
      {/* Image Carousel */}
      <div className="relative aspect-[1/1] overflow-hidden rounded-xl mb-3">
        {photos.length > 0 ? (
          <>
            {/* Shimmer Skeleton Loader */}
            {!imageLoaded && (
              <div className="absolute inset-0 skeleton-shimmer rounded-xl z-10" />
            )}
            {/* Only render the first image until it's loaded */}
            {!imageLoaded && (
              <Image
                src={photos[0].url}
                alt={photos[0].caption || roomName}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={cn(
                  "object-cover transition-opacity duration-700",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                priority
                onLoad={() => setImageLoaded(true)}
              />
            )}
            {/* After first image is loaded, render the carousel */}
            {imageLoaded && (
              <>
                <Image
                  src={photos[currentImageIndex].url}
                  alt={photos[currentImageIndex].caption || roomName}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={cn(
                    "object-cover transition-opacity duration-700",
                    "opacity-100"
                  )}
                />
                {/* Navigation Buttons - Show if there are multiple images */}
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={previousImage}
                      className={cn(
                        "absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-1.5 shadow-md transition-opacity duration-200",
                        "opacity-0 group-hover:opacity-100 hover:scale-110",
                        currentImageIndex === 0 && "hidden"
                      )}
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-1.5 shadow-md transition-opacity duration-200",
                        "opacity-0 group-hover:opacity-100 hover:scale-110",
                        currentImageIndex === photos.length - 1 && "hidden"
                      )}
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
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
        {propertyName && (
          <p className="text-[15px] leading-5 text-gray-500">{propertyName}</p>
        )}
        {rate !== undefined && (
          <p className="text-[15px] leading-5 mt-1">
            <span className="font-medium">MYR {rate.toFixed(2)}</span>
            <span className="text-gray-500"> night</span>
          </p>
        )}
        {amenities && amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {amenities.slice(0, 6).map((amenity: string, idx: number) => (
              <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {amenity}
              </span>
            ))}
            {amenities.length > 6 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">+{amenities.length - 6} more</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 