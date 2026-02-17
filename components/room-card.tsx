"use client"

import React, {useEffect, useState} from "react"
import Image from "next/image"
import {ChevronLeft, ChevronRight} from "lucide-react"
import {cn} from "@/lib/utils"
import {Gallery} from "@/components/Gallery";

interface RoomCardProps {
    roomName: string
    propertyName?: string
    placeHint?: string
    photos: {
        url: string
        caption?: string
    }[]
    rate?: number
    amenities?: string[]
}

export function RoomCard({roomName, propertyName, placeHint, photos, rate}: RoomCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [fullScreen, setFullScreen] = useState(false)

    const hasPrev = currentImageIndex > 0;
    const hasNext = currentImageIndex < photos.length - 1;

    useEffect(() => {
        if (photos.length > 0) {
            setCurrentImageIndex(0);
        }
    }, [photos]);

    const handleNext = () => {
        setCurrentImageIndex((prev) =>
            prev < photos.length - 1 ? prev + 1 : prev
        );
    };

    const handlePrev = () => {
        setCurrentImageIndex((prev) =>
            prev > 0 ? prev - 1 : prev
        );
    };

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
        <div className="flex-shrink-0 overflow-hidden space-y-[16px] lp:space-y-[20px]">
            <div className="relative w-full aspect-[4/3] full:aspect-[16/9]">
                {photos.length > 0 ? (
                    <>
                        {/* Shimmer Skeleton Loader */}
                        {!imageLoaded && (
                            <div className="absolute inset-0 skeleton-shimmer z-10"/>
                        )}
                        {/* Only render the first image until it's loaded */}
                        {!imageLoaded && (
                            <Image
                                fill
                                quality={90}
                                src={photos[0].url}
                                alt={photos[0].caption || roomName}
                                sizes="(max-width: 768px) 100vw, 400px"
                                className={cn(
                                    "object-cover transition-opacity rounded-xl duration-700",
                                    imageLoaded ? "opacity-100" : "opacity-0"
                                )}
                                priority
                                onLoad={() => setImageLoaded(true)}
                                onClick={() => setFullScreen(true)}
                            />
                        )}
                        {/* After first image is loaded, render the carousel */}
                        {imageLoaded && (
                            <>
                                {
                                    placeHint && false && (
                                        <div
                                            className="absolute z-2 max-w-[90%] top-2 lp:top-3 left-2 lp:left-3 bg-white/90 text-gray-900 text-[10px] inline-block w-fit tb:text-xs lp:text-base leading-tight font-medium px-2 lp:px-3 py-0.5 lp:py-1 rounded-full shadow">
                                            {placeHint}
                                        </div>
                                    )
                                }

                                <Image
                                    src={photos[currentImageIndex].url}
                                    alt={photos[currentImageIndex].caption || roomName}
                                    fill
                                    quality={90}
                                    sizes="(max-width: 768px) 100vw, 400px"
                                    className={cn(
                                        "object-cover transition-opacity rounded-xl duration-700",
                                        "opacity-100"
                                    )}
                                    onClick={() => setFullScreen(true)}
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
                                            <ChevronLeft className="h-4 w-4"/>
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
                                            <ChevronRight className="h-4 w-4"/>
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
                                {photos.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => {
                                                handlePrev()
                                            }}
                                            className={cn("absolute left-2 top-1/2 -translate-y-1/2 z-10 cursor-pointer mb-2 flex items-center rounded-md justify-center aspect-[1/1] w-[32px] lp:w-[40px]",
                                                !hasPrev ? "bg-white/20" : "bg-white")}>
                                            <Image
                                                src={`/icons/arrow-${!hasPrev ? 'light' : 'dark'}.svg`}
                                                alt="Prev"
                                                className="transform rotate-180"
                                                width={16}
                                                height={16}
                                            />
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleNext()
                                            }}
                                            className={cn("cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 z-10 mb-2 flex items-center rounded-md justify-center aspect-[1/1] w-[32px] lp:w-[40px] custom-next",
                                                !hasNext ? "bg-white/20" : "bg-white")}>
                                            <Image
                                                src={`/icons/arrow-${!hasNext ? 'light' : 'dark'}.svg`}
                                                alt="Next"
                                                width={16}
                                                height={16}
                                            />
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <Image
                        src={'/rooms/room.svg'}
                        alt={roomName}
                        fill
                        quality={90}
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover rounded-xl"
                    />
                )}
            </div>
            <div className="space-y-[6px] lp:space-y-[10px]">
                <h3 className="h3 font-semibold">{roomName}</h3>
                <div className="font-normal text-[#3b4a68] text-sm tb:text-base lp:text-lg full:text-xl max-w-fit">
                    {propertyName}
                </div>
                <div
                    className="inline-flex items-center text-[#0E3599] font-semibold text-base tb:text-lg lp:text-xl hover:underline gap-2">
                    MYR {rate?.toFixed(2)} <span
                    className="font-normal text-[#3b4a68] text-xs tb:text-base">per night</span>
                </div>
            </div>
            {imageLoaded && photos && fullScreen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#141826] p-5 lp:p-10"
                    tabIndex={-1}
                    aria-modal="true"
                    role="dialog"
                >
                    <Gallery
                        selectedIndex={currentImageIndex}
                        images={photos.map(photo => ({src: photo.url, alt: photo.caption}))}
                        onClose={() => {
                            setFullScreen(false);
                        }}
                    ></Gallery>
                </div>
            )}
        </div>
    );
}
