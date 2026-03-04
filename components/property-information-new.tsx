import React, {useEffect, useRef, useState} from "react";
import Image from "next/image";
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation} from 'swiper/modules';
import type {Swiper as SwiperType} from "swiper";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import {Gallery} from "@/components/Gallery";
import {PropertiesMap} from "@/components/PropertiesMap";
import {cn} from "@/lib/utils";

interface PropertyInformationProps {
    propertyId: string;
}

// Map amenity names to Lucide icons (add more as needed)
const amenityIconMap: Record<string, string> = {
    "ATM on site": '/icons/amenities/atm.svg',
    "Baggage storage": '/icons/amenities/trolley.svg',
    "Concierge": '/icons/amenities/concierge.svg',
    "Elevator": '/icons/amenities/elevator.svg',
    "Fitness center": '/icons/amenities/gym.svg',
    "Internet": '/icons/amenities/wifi.svg',
    "Sauna": '/icons/amenities/sauna.svg',
    "Swimming pool": '/icons/amenities/pool.svg',
    "Air conditioning": '/icons/amenities/air-purifier.svg',
    "Laundry service": '/icons/amenities/styler.svg',
    "Lounge": '/icons/amenities/lounge.svg',
    "Printer": '/icons/amenities/print.svg',
    "Room service": '/icons/amenities/contact-phone.svg',
    "24-hour front desk": '/icons/amenities/pace.svg',
    "24-hour check-in": '/icons/amenities/pace.svg',
    "24-hour security": '/icons/amenities/shield.svg',
    "All rooms disinfected daily": '/icons/amenities/household-supplies.svg',
    "Coffee Shop": '/icons/amenities/coffee.svg',
    "Guest parking": '/icons/amenities/parking.svg',

    "Meeting rooms": '/icons/amenities/chair.svg',
};

// Define interfaces for property data
interface PropertyImage {
    image: string;
}

interface PropertyAddress {
    propertyAddress1: string;
    propertyCity: string;
    propertyState: string;
    propertyPostalCode: string;
    propertyCountry: string;
}

interface PropertyContact {
    phone?: string;
    email?: string;
}

interface PropertyAmenity {
    amenityName?: string;

    /** extra keys coming from the Cloudbeds API */
    [key: string]: string | number | boolean | undefined;
}

interface PropertyPolicy {
    policyName?: string;
    policy?: string;

    /** extra keys coming from the Cloudbeds API */
    [key: string]: string | number | boolean | undefined;
}

interface Property {
    propertyName?: string;
    propertyImage?: PropertyImage[];
    propertyAdditionalPhotos?: PropertyImage[];
    propertyAmenities?: PropertyAmenity[];
    propertyAddress?: PropertyAddress;
    propertyContact?: PropertyContact;
    checkInTime?: string;
    checkOutTime?: string;
    propertyPolicies?: PropertyPolicy[];
    termsAndConditions?: string;
}

interface PropertyApiResponse {
    success: boolean;
    hotel?: Property;
    error?: string;
}

// Helper function to map property images with type control
function mapPropertyImages(images: unknown, caption: string): { url: string; caption?: string }[] {
    if (!Array.isArray(images)) return [];
    return (images as PropertyImage[]).map((img) => ({
        url: img.image,
        caption,
    }));
}

export function PropertyInformationNew({propertyId}: PropertyInformationProps) {
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    // Modal state for image preview
    const [selectedIdx, setSelectedIdx] = useState<number>(0);
    const [selectedImages, setSelectedImages] = useState<{ url: string; caption?: string }[] | null>(null);
    const [mapPosition, setMapPosition] = useState<{ lat: number; lng: number } | null>(null);

    const prevRef = useRef<HTMLButtonElement | null>(null);
    const nextRef = useRef<HTMLButtonElement | null>(null);
    const [hasPrev, setHasPrev] = useState(false);
    const [hasNext, setHasNext] = useState(true);

    useEffect(() => {
        const fetchProperty = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/cloudbeds/property?propertyId=${propertyId}`);
                const data: PropertyApiResponse = await res.json();
                if (data.success && data.hotel) {
                    setProperty(data.hotel);
                } else {
                    setError("Failed to load property information");
                }
            } catch {
                setError("Failed to load property information");
            }
            setLoading(false);
        };
        fetchProperty();
    }, [propertyId]);

    useEffect(() => {
        if (!property) return;
        const address = property.propertyAddress;
        if (!address) return;
        const addressString = [
            address.propertyAddress1,
            address.propertyCity,
            address.propertyState,
            address.propertyPostalCode,
            address.propertyCountry
        ].filter(Boolean).join(", ");
        // Only geocode if not already set
        if (!mapPosition && addressString) {
            (async () => {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}`);
                const geoData: { lat: string; lon: string }[] = await geoRes.json();
                if (geoData && geoData.length > 0) {
                    setMapPosition({lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon)});
                }
            })();
        }
    }, [property, mapPosition]);

    if (loading) {
        return (
            <div className="py-4">
                <div className="h-64 bg-gray-200 animate-pulse rounded-xl mb-8"/>
                <div className="h-6 w-1/3 bg-gray-200 animate-pulse rounded mb-4"/>
                <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded mb-2"/>
                <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded mb-2"/>
                <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded mb-2"/>
            </div>
        );
    }
    if (error || !property) {
        return <div className="text-red-500 py-12">{error || "No property information available."}</div>;
    }

    // Photos
    const photos = [
        ...mapPropertyImages(property.propertyImage, "Main"),
        ...mapPropertyImages(property.propertyAdditionalPhotos, "")
    ];

    // Amenities
    const amenities = property.propertyAmenities || [];
    const shownAmenities = showAllAmenities ? amenities : amenities.slice(0, 12);

    // Address & Contact
    const address = property.propertyAddress;
    const contact = property.propertyContact;

    // Policies
    const checkIn = property.checkInTime;
    const checkOut = property.checkOutTime;
    const policies: PropertyPolicy[] = property.propertyPolicies || [];
    const terms = property.termsAndConditions || null;

    return (
        <section className="w-full">
            <div className="w-full px-0 mx-0">
                <h2 className="text-2xl font-bold mb-5">{property.propertyName ? `${property.propertyName}` : 'Property Information'}</h2>
                {/* Responsive grid of property photos */}
                {photos.length > 0 && (
                    <div className="mb-5 w-full relative">
                        <button
                            ref={prevRef}
                            className={cn("absolute left-2 top-1/2 -translate-y-1/2 z-10 cursor-pointer mb-2 flex items-center rounded-sm lp:rounded-md justify-center aspect-[1/1] w-[20px] lp:w-[28px]",
                                !hasPrev ? "bg-white/20" : "bg-white")}>
                            <Image
                                src={`/icons/arrow-${!hasPrev ? 'light' : 'dark'}.svg`}
                                alt="Prev"
                                className="transform rotate-180"
                                width={12}
                                height={12}
                            />
                        </button>


                        {/* arrows */}
                        <button
                            ref={nextRef}
                            className={cn("cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 z-10 mb-2 flex items-center rounded-sm lp:rounded-md justify-center aspect-[1/1] w-[20px] lp:w-[28px] custom-next",
                                !hasNext ? "bg-white/20" : "bg-white")}>
                            <Image
                                src={`/icons/arrow-${!hasNext ? 'light' : 'dark'}.svg`}
                                alt="Next"
                                width={12}
                                height={12}
                            />
                        </button>

                        <Swiper
                            modules={[Navigation]}
                            navigation={{
                                prevEl: prevRef.current,
                                nextEl: nextRef.current,
                            }}
                            onBeforeInit={(swiper: SwiperType) => {
                                // @ts-expect-error Swiper types do not include dynamic navigation element assignment
                                swiper.params.navigation.prevEl = prevRef.current;
                                // @ts-expect-error Swiper types do not include dynamic navigation element assignment
                                swiper.params.navigation.nextEl = nextRef.current;
                            }}
                            onSlideChange={(swiper) => {
                                setHasPrev(!swiper.isBeginning);
                                setHasNext(!swiper.isEnd);
                            }}
                            spaceBetween={16}
                            breakpoints={{
                                0: {slidesPerView: 2},
                                640: {slidesPerView: 3},
                                1024: {slidesPerView: 4},
                            }}
                            className="rounded-xl"
                        >
                            {photos.map((photo, idx) => (
                                <SwiperSlide key={idx}>
                                    <div
                                        className="relative aspect-square rounded-xl shadow bg-white overflow-hidden cursor-pointer group"
                                        tabIndex={0}
                                        aria-label="View image"
                                    >
                                        <Image
                                            src={photo.url}
                                            onClick={() => {
                                                console.log(idx)
                                                setSelectedIdx(idx)
                                                setSelectedImages(photos)
                                            }}
                                            alt={photo.caption || "Property photo"}
                                            fill
                                            className="object-cover rounded-xl group-hover:opacity-80 transition"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                                            priority={idx === 0}
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                )}
                {/* Modal for image preview */}
                {selectedImages && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#141826] p-5 lp:p-10"
                        tabIndex={-1}
                        aria-modal="true"
                        role="dialog"
                    >
                        <Gallery
                            images={selectedImages.map(img => ({src: img.url, alt: ''}))}
                            selectedIndex={selectedIdx}
                            onClose={() => {
                                setSelectedImages(null);
                            }}
                        ></Gallery>
                    </div>
                )}
                <div className="flex flex-col gap-5">
                    {/* Amenities as grid with icons */}
                    <div className="border border-[#dee3ed]"></div>
                    {amenities.length > 0 && (
                        <div className="flex flex-col gap-2.5 tb:gap-5">
                            <h2 className="text-xl lp:text-2xl font-semibold text-[#101828]">Amenities</h2>
                            <ul className="grid grid-cols-2 lp:grid-cols-3 gap-5 text-[#101828]">
                                {shownAmenities?.map((amenity, idx) => {
                                    const name = amenity.amenityName || (typeof amenity === 'string' ? amenity : '');
                                    const srcIcon = amenityIconMap[name] ?? '/icons/amenities/check-box.svg';
                                    console.log(srcIcon)
                                    return (
                                        <li key={idx} className="flex items-center gap-2 tb:gap-3 ">
                                            <Image src={srcIcon} alt=""
                                                   className="flex justify-center aspect-[1/1] w-4 tb:w-6 lp:w-8" width={40}
                                                   height={40} priority/>
                                            <span
                                                className="font-normal text-sm tb:text-lg">{name}</span>
                                        </li>
                                    )
                                })}
                            </ul>
                            {amenities.length > 12 && !showAllAmenities && (
                                <div className="flex justify-end w-full">
                                    <button
                                        className="border border-[#4A4F5B] rounded-full text-xs tb:text-sm cursor-pointer font-medium mt-2 px-3 py-1 tb:px-5 tb:py-2 text-[#4A4F5B] hover:bg-black/5 transition"
                                        onClick={() => setShowAllAmenities(true)}
                                    >
                                        View All ({amenities.length}) →
                                    </button>
                                </div>

                            )}
                        </div>
                    )}
                    {/* Address & Contact + Map */}
                    <div className="border border-[#dee3ed]"></div>
                    <div className="flex flex-col gap-2.5 tb:gap-5">
                        <div className="gap-1 tb:gap-2.5 items-start">
                        <h2 className="text-xl lp:text-2xl font-semibold text-[#101828]">Address & Contact</h2>
                            {address && (
                                <div className="text-sm tb:text-base text-[#4a4f5b] font-normal">
                                    {address.propertyAddress1}, {address.propertyCity}, {address.propertyState} {address.propertyPostalCode}, {address.propertyCountry}
                                </div>
                            )}
                            {contact && (
                                <div className="text-sm tb:text-base text-[#4a4f5b] font-normal">
                                    {contact.phone && <div>Phone: {contact.phone}</div>}
                                    {contact.email && <div>Email: {contact.email}</div>}
                                </div>
                            )}                        </div>
                        {/* Map */}
                        <div
                            className="w-full aspect-[4/3] tb:aspect-[16/9] rounded-lg overflow-hidden shadow bg-white flex items-center justify-center">
                            {mapPosition ? (
                                <PropertiesMap propertyMarkers={[{
                                    ...mapPosition,
                                    name: property.propertyName || "Property Location"
                                }]}></PropertiesMap>
                            ) : (
                                <span
                                    className="text-gray-400 text-sm text-center px-2">Location not found on map.</span>
                            )}
                        </div>
                    </div>
                    {/* Check-In/Check-Out Policies */}
                    {(checkIn || checkOut) && (
                        <>
                            <div className="border border-[#dee3ed]"></div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Check-In & Check-Out</h3>
                                <div className="text-gray-700">
                                    {checkIn && <div>Check-In: {checkIn}</div>}
                                    {checkOut && <div>Check-Out: {checkOut}</div>}
                                </div>
                            </div>
                        </>
                    )}
                    {/* Property & Cancellation Policies */}
                    {policies.length > 0 && (
                        <>
                            <div className="border border-[#dee3ed]"></div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Property & Cancellation Policies</h3>
                                <ul className="list-disc pl-6 text-gray-700">
                                    {policies.map((p, i) => (
                                        <li key={i}>{p.policyName || p.policy || (typeof p === 'string' ? p : '')}</li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    )}
                    {/* Terms & Conditions */}
                    {terms && (
                        <>
                            <div className="border border-[#dee3ed]"></div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Terms & Conditions</h3>
                                <div className="text-gray-700 whitespace-pre-line">{terms}</div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
} 
