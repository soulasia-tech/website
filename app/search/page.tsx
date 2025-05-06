'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { BookingWidget } from '@/components/booking-widget';
import { PropertyInformation } from '@/components/property-information';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface RoomResult {
  id: string;
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  available: boolean;
  images: string[];
  amenities: string[];
}

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const [property, setProperty] = useState<{ propertyId: string, propertyName: string } | null>(null);
  const [results, setResults] = useState<RoomResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rates, setRates] = useState<{ [roomTypeID: string]: number }>({});
  const [selectedRoomImages, setSelectedRoomImages] = useState<string[] | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const swiperRef = useRef<any>(null);
  const swiperInitialized = useRef(false);

  // Get search parameters
  const propertyId = searchParams.get('propertyId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const guests = searchParams.get('guests');

  // Create initial search params object for BookingWidget
  const initialSearchParams = {
    propertyId: propertyId || '',
    startDate: startDate || '',
    endDate: endDate || '',
    guests: guests || '1'
  };

  useEffect(() => {
    // Validate search parameters
    if (!propertyId || !startDate || !endDate || !guests) {
      router.push('/');
      return;
    }

    // Fetch property info
    const fetchProperty = async () => {
      setPropertyLoading(true);
      try {
        const res = await fetch('/api/cloudbeds-properties');
        const data = await res.json();
        if (data.success && Array.isArray(data.properties)) {
          const found = data.properties.find((p: { propertyId: string, propertyName: string }) => p.propertyId === propertyId);
          setProperty(found || null);
        } else {
          setProperty(null);
        }
      } catch {
        setProperty(null);
      }
      setPropertyLoading(false);
    };
    fetchProperty();

    // Fetch live room types from Cloudbeds
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/cloudbeds/room-types?propertyId=${propertyId}`);
        const data = await res.json();
        if (data.success) {
          const mapped = data.roomTypes.map((room: {
            roomTypeID: string;
            roomTypeName: string;
            roomTypeDescription: string;
            maxGuests: number;
            roomTypePhotos?: string[];
            roomTypeFeatures?: Record<string, string>;
          }) => ({
            id: room.roomTypeID,
            name: room.roomTypeName,
            description: room.roomTypeDescription,
            price: 0, // Will be set after fetching rates
            maxGuests: room.maxGuests,
            available: true, // You can check availability separately if needed
            images: room.roomTypePhotos || [],
            amenities: Object.values(room.roomTypeFeatures || {})
          }));
          setResults(mapped);
        } else {
          setResults([]);
          setError('Failed to load rooms');
        }
      } catch {
        setResults([]);
        setError('Failed to load rooms');
      }
      setLoading(false);
    };
    fetchRooms();

    // Fetch rates for the property and dates
    const fetchRates = async () => {
      if (!propertyId || !startDate || !endDate) return;
      try {
        const res = await fetch(`/api/cloudbeds/rate-plans?propertyId=${propertyId}&startDate=${startDate}&endDate=${endDate}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.ratePlans)) {
          // Map: roomTypeID -> lowest totalRate
          const rateMap: { [roomTypeID: string]: number } = {};
          data.ratePlans.forEach((rate: { roomTypeID: string; totalRate: number }) => {
            if (!rateMap[rate.roomTypeID] || rate.totalRate < rateMap[rate.roomTypeID]) {
              rateMap[rate.roomTypeID] = rate.totalRate;
            }
          });
          setRates(rateMap);
        } else {
          setRates({});
        }
      } catch {
        setRates({});
      }
    };
    fetchRates();
  }, [propertyId, startDate, endDate, guests, router]);

  useEffect(() => {
    if (!selectedRoomImages) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedRoomImages(null);
        setCarouselIndex(0);
      } else if (e.key === 'ArrowLeft') {
        setCarouselIndex((prev) => prev > 0 ? prev - 1 : selectedRoomImages.length - 1);
      } else if (e.key === 'ArrowRight') {
        setCarouselIndex((prev) => prev < selectedRoomImages.length - 1 ? prev + 1 : 0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRoomImages]);

  // Sync Swiper with carouselIndex
  useEffect(() => {
    if (swiperRef.current && selectedRoomImages && swiperInitialized.current) {
      swiperRef.current.slideTo(carouselIndex);
    }
  }, [carouselIndex, selectedRoomImages]);

  const handleBookNow = (roomId: string) => {
    router.push(`/booking?roomId=${roomId}&startDate=${startDate}&endDate=${endDate}&propertyId=${propertyId}&guests=${guests}`);
  };

  // Parse guests as integer, default to 1 if not set
  const numGuests = guests ? parseInt(guests, 10) : 1;
  // Filter rooms based on both rate and guest capacity
  const filteredRooms = results.filter(
    room => rates[room.id] !== undefined && room.maxGuests >= numGuests
  );

  // Calculate number of nights
  const numberOfNights = startDate && endDate ? Math.max(1, Math.ceil((parseISO(endDate).getTime() - parseISO(startDate).getTime()) / (1000 * 60 * 60 * 24))) : 1;

  if (propertyLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <BookingWidget initialSearchParams={initialSearchParams} />
          </div>
          <div className="animate-pulse space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <BookingWidget initialSearchParams={initialSearchParams} />
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {property ? property.propertyName : 'Property'}
          </h1>
          <div className="text-gray-600 mb-2">
            {startDate && endDate && (
              <span>
                {format(parseISO(startDate), 'MMM d, yyyy')} - {format(parseISO(endDate), 'MMM d, yyyy')}
              </span>
            )}
            {guests && (
              <span> &middot; {guests} guest{guests === '1' ? '' : 's'}</span>
            )}
          </div>
          {error && <div className="text-red-500 mb-2">{error}</div>}
        </div>
        <div className="space-y-6">
          {!error && filteredRooms.length === 0 && (
            <div className="text-gray-500 text-center py-8">
              No rooms found for your search criteria. Try another property or reduce the number of guests.
            </div>
          )}
          {filteredRooms.map(room => (
            <Card key={room.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-64 relative">
                  <Image 
                    src={`${room.images[0]}?w=600&h=400&fit=crop`}
                    alt={room.name}
                    width={600}
                    height={400}
                    className="object-cover cursor-pointer"
                    onClick={() => setSelectedRoomImages(room.images)}
                  />
                </div>
                <div className="p-6 md:w-2/3 flex flex-col">
                  <div className="flex-grow">
                    <h2 className="text-xl font-semibold mb-2">{room.name}</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {room.amenities.map((amenity, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">Up to {room.maxGuests} guests</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div>
                      <p className="text-2xl font-bold">
                        {rates[room.id] !== undefined ? `MYR ${(rates[room.id] / numberOfNights).toFixed(2)}` : 'N/A'}
                      </p>
                      <p className="text-gray-600">per night</p>
                      <p className="text-lg font-medium mt-1">
                        {rates[room.id] !== undefined ? `MYR ${rates[room.id].toFixed(2)} total` : 'N/A'}
                      </p>
                    </div>
                    <Button 
                      onClick={() => handleBookNow(room.id)}
                      disabled={!room.available}
                      size="lg"
                      variant="outline"
                      className="border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-black transition"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        {/* Property Information Section */}
        {propertyId && <PropertyInformation propertyId={propertyId} />}
        {selectedRoomImages && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => { setSelectedRoomImages(null); setCarouselIndex(0); }}>
            <div className="relative max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
              <button
                className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full shadow p-2"
                onClick={() => { setSelectedRoomImages(null); setCarouselIndex(0); }}
                aria-label="Close image preview"
              >
                ✕
              </button>
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                className="rounded-xl"
                onSlideChange={(swiper) => setCarouselIndex(swiper.activeIndex)}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                  if (!swiperInitialized.current) {
                    swiper.slideTo(carouselIndex);
                    swiperInitialized.current = true;
                  }
                }}
              >
                {selectedRoomImages.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <img src={img} alt={`Room image ${idx + 1}`} className="w-full h-[60vw] max-h-[80vh] object-contain rounded-xl" />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchResults />
    </Suspense>
  );
}