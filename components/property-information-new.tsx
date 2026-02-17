import React, {useEffect, useState} from "react";
import Image from "next/image";
import {LucideIcon, icons} from "lucide-react";
import Map, {Marker, Popup} from 'react-map-gl';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface PropertyInformationProps {
    propertyId: string;
}

// Map amenity names to Lucide icons (add more as needed)
const amenityIconMap: Record<string, LucideIcon> = {
    "ATM on site": icons.PiggyBank,
    "Baggage storage": icons.Briefcase,
    "Concierge": icons.UserCheck,
    "Elevator": icons.ArrowUpDown,
    "Fitness center": icons.Dumbbell,
    "Laundry service": icons.Shirt,
    "Lounge": icons.Lamp,
    "Meeting rooms": icons.Users,
    "Printer": icons.Printer,
    "Room service": icons.Bell,
    "Swimming pool": icons.Waves,
    "24-hour front desk": icons.Clock,
    "24-hour security": icons.ShieldCheck,
    "Air conditioning": icons.Wind,
    "24-hour check-in": icons.Clock,
    "All rooms disinfected daily": icons.Sparkles,
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

export function PropertyInformation({propertyId}: PropertyInformationProps) {
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    // Modal state for image preview
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [mapPosition, setMapPosition] = useState<{ lat: number; lng: number } | null>(null);

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
            <div className="py-12">
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
    const amenities: PropertyAmenity[] = property.propertyAmenities || [];
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
        <section className="py-8 w-full">
            <div className="w-full px-0 mx-0">
                <h2 className="text-2xl font-bold mb-6">{property.propertyName ? `${property.propertyName} Information` : 'Property Information'}</h2>
                {/* Responsive grid of property photos */}
                {photos.length > 0 && (
                    <div className="mb-8 w-full">
                        <Swiper
                            modules={[Navigation, Pagination]}
                            navigation
                            pagination={{clickable: true}}
                            spaceBetween={16}
                            breakpoints={{
                                0: {slidesPerView: 1},
                                640: {slidesPerView: 3},
                                1024: {slidesPerView: 4},
                            }}
                            className="rounded-xl"
                        >
                            {photos.map((photo, idx) => (
                                <SwiperSlide key={idx}>
                                    <div
                                        className="relative aspect-square rounded-xl shadow bg-white overflow-hidden cursor-pointer group"
                                        onClick={() => setSelectedImage(photo.url)}
                                        tabIndex={0}
                                        aria-label="View image"
                                    >
                                        <Image
                                            src={photo.url}
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
                {selectedImage && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                        onClick={() => setSelectedImage(null)}
                        aria-modal="true"
                        role="dialog"
                    >
                        <div
                            className="relative max-w-3xl w-full mx-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full shadow p-2"
                                onClick={() => setSelectedImage(null)}
                                aria-label="Close image preview"
                            >
                                <icons.X className="w-6 h-6"/>
                            </button>
                            <div
                                className="relative w-full h-[60vw] max-h-[80vh] bg-white/90 rounded-xl flex items-center justify-center">
                                <Image
                                    src={selectedImage}
                                    alt="Enlarged property photo"
                                    fill
                                    className="object-contain rounded-xl"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                )}
                {/* Amenities as grid with icons */}
                {amenities.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4">{property.propertyName ? `${property.propertyName} Amenities` : 'Property Amenities'}</h3>
                        <div
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-4 mb-4">
                            {shownAmenities.map((a, i) => {
                                const name = a.amenityName || (typeof a === 'string' ? a : '');
                                const Icon = amenityIconMap[name] || icons.BadgeCheck;
                                return (
                                    <div key={i} className="flex items-center gap-3 text-gray-700">
                                        <Icon className="w-6 h-6 text-gray-500"/>
                                        <span className="text-base">{name}</span>
                                    </div>
                                );
                            })}
                        </div>
                        {amenities.length > 12 && !showAllAmenities && (
                            <button
                                className="mt-2 px-5 py-2 border border-green-500 text-green-600 rounded-full font-medium hover:bg-green-50 transition"
                                onClick={() => setShowAllAmenities(true)}
                            >
                                View All ({amenities.length}) →
                            </button>
                        )}
                    </div>
                )}
                {/* Address & Contact + Map */}
                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-2">Address & Contact</h3>
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="text-gray-700 mb-1 md:w-1/2">
                            {address && (
                                <div>
                                    {address.propertyAddress1}<br/>
                                    {address.propertyCity}, {address.propertyState} {address.propertyPostalCode}<br/>
                                    {address.propertyCountry}
                                </div>
                            )}
                            {contact && (
                                <div className="text-gray-700 mt-2">
                                    {contact.phone && <div>Phone: {contact.phone}</div>}
                                    {contact.email && <div>Email: {contact.email}</div>}
                                </div>
                            )}
                        </div>
                        {/* Map */}
                        <div
                            className="w-full md:w-1/2 min-h-[256px] h-64 rounded-xl overflow-hidden shadow bg-white flex items-center justify-center"
                            style={{minWidth: 240, minHeight: 200, position: 'relative', zIndex: 1}}>
                            {mapPosition ? (
                                <Map
                                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                                    initialViewState={{longitude: mapPosition.lng, latitude: mapPosition.lat, zoom: 15}}
                                    style={{width: '100%', height: '100%'}}
                                    mapStyle="mapbox://styles/mapbox/streets-v11"
                                >
                                    <Marker longitude={mapPosition.lng} latitude={mapPosition.lat} anchor="bottom">
                                        <Image
                                            src="/icons/marker.svg"
                                            alt="x"
                                            width={40}
                                            height={44}
                                            className="w-10 h-11 cursor-pointer"
                                        />
                                    </Marker>
                                    <Popup
                                        longitude={mapPosition.lng}
                                        latitude={mapPosition.lat}
                                        anchor="top"
                                        closeOnClick={false}
                                        focusAfterOpen={false}
                                    >
                                        {property.propertyName || "Property Location"}
                                    </Popup>
                                </Map>
                            ) : (
                                <span
                                    className="text-gray-400 text-sm text-center px-2">Location not found on map.</span>
                            )}
                        </div>
                    </div>
                </div>
                {/* Check-In/Check-Out Policies */}
                {(checkIn || checkOut) && (
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-2">Check-In & Check-Out</h3>
                        <div className="text-gray-700">
                            {checkIn && <div>Check-In: {checkIn}</div>}
                            {checkOut && <div>Check-Out: {checkOut}</div>}
                        </div>
                    </div>
                )}
                {/* Property & Cancellation Policies */}
                {policies.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-2">Property & Cancellation Policies</h3>
                        <ul className="list-disc pl-6 text-gray-700">
                            {policies.map((p, i) => (
                                <li key={i}>{p.policyName || p.policy || (typeof p === 'string' ? p : '')}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {/* Terms & Conditions */}
                {terms && (
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-2">Terms & Conditions</h3>
                        <div className="text-gray-700 whitespace-pre-line">{terms}</div>
                    </div>
                )}
            </div>
        </section>
    );
} 
