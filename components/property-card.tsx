"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PropertyCardProps {
  /** Add this — optional so old code still compiles */
  propertyId?: string
  propertyName: string
  location: string
  photos: { url: string; caption?: string }[]
  pricePerDay?: number
  /** Optional override if you want a custom link */
  href?: string
}

export function PropertyCard({
  propertyId,
  propertyName,
  location,
  photos,
  pricePerDay,
  href,
}: PropertyCardProps) {
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

  // Build the link. Prefer explicit href, else use propertyId, else no-op "#"
  const link = href ?? (propertyId ? `/properties/${propertyId}` : "#")

  return (
    <Link href={link} className="block w-full group">
      {/* Image Carousel */}
      <div className="relative aspect-[1/1] overflow-hidden rounded-xl mb-3">
        {photos.length > 0 ? (
          <>
            {!imageLoaded && <div className="absolute inset-0 skeleton-shimmer rounded-xl z-10" />}
            {!imageLoaded && (
              <Image
                src={photos[0].url}
                alt={photos[0].caption || propertyName}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={cn("object-cover transition-opacity duration-700", imageLoaded ? "opacity-100" : "opacity-0")}
                priority
                onLoad={() => setImageLoaded(true)}
              />
            )}
            {imageLoaded && (
              <>
                <Image
                  src={photos[currentImageIndex].url}
                  alt={photos[currentImageIndex].caption || propertyName}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-opacity duration-700 opacity-100"
                />
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

      {/* Property Name and Location */}
      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-[15px] leading-5">{propertyName}</h3>
        <p className="text-[15px] leading-5 text-gray-500">{location}</p>
        {pricePerDay !== undefined && (
          <p className="text-[15px] leading-5 mt-1">
            <span className="font-medium">From MYR {pricePerDay.toFixed(2)}</span>
            <span className="text-gray-500"> night</span>
          </p>
        )}
      </div>
    </Link>
  )
}
