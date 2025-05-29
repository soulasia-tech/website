'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { BookingWidget } from '@/components/booking-widget';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import type { Swiper as SwiperType } from 'swiper';
import { calculateTotalGuests } from '@/lib/guest-utils';

interface RoomResult {
  id: string;
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  available: boolean;
  images: string[];
  amenities: string[];
  propertyName: string;
  propertyId: string;
  city: string;
}

interface RatePlan {
  roomTypeID: string;
  totalRate: number;
  roomsAvailable: number;
  ratePlanNamePublic?: string;
  [key: string]: unknown; // For any extra fields
}

// Add cart item type
interface CartItem {
  roomTypeID: string;
  roomName: string;
  price: number;
  quantity: number;
  maxAvailable: number;
}

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const [property, setProperty] = useState<{ propertyId: string, propertyName: string } | null>(null);
  const [results, setResults] = useState<RoomResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rates, setRates] = useState<{ [roomTypeID: string]: RatePlan }>({});
  const [selectedRoomImages, setSelectedRoomImages] = useState<string[] | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const swiperInitialized = useRef(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quantities, setQuantities] = useState<{ [roomTypeID: string]: number }>({});

  // Get search parameters
  const city = searchParams.get('city');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const adults = searchParams.get('adults');
  const children = searchParams.get('children');
  const propertyIdParam = searchParams.get('propertyId');
  const apartments = parseInt(searchParams.get('apartments') || '1', 10);

  // Create initial search params object for BookingWidget
  const initialSearchParams = {
    city: city || '',
    startDate: startDate || '',
    endDate: endDate || '',
    adults: adults || '2',
    children: children || '0',
    apartments: apartments.toString(),
  };

  useEffect(() => {
    // Validate search parameters
    if ((!city && !propertyIdParam) || !startDate || !endDate || !adults || !children) {
      router.push('/');
      return;
    }

    const fetchPropertiesAndRooms = async () => {
      setPropertyLoading(true);
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching properties and rooms...', { city, propertyIdParam, startDate, endDate, adults, children, apartments });
        const propRes = await fetch('/api/cloudbeds-properties');
        const propData = await propRes.json();
        if (!propData.success || !Array.isArray(propData.properties)) {
          setProperty(null);
          setResults([]);
          setRates({});
          setPropertyLoading(false);
          setLoading(false);
          setError('Failed to load properties');
          return;
        }
        let filteredProperties;
        if (propertyIdParam) {
          filteredProperties = propData.properties.filter((p: { propertyId: string }) => p.propertyId === propertyIdParam);
        } else {
          filteredProperties = propData.properties.filter((p: { city: string }) => p.city === city);
        }
        if (filteredProperties.length === 0) {
          setProperty(null);
          setResults([]);
          setRates({});
          setPropertyLoading(false);
          setLoading(false);
          setError(propertyIdParam ? 'No property found for this ID' : 'No properties found in this city');
          return;
        }
        setProperty(propertyIdParam ? { propertyId: propertyIdParam, propertyName: filteredProperties[0].propertyName } : { propertyId: '', propertyName: city });
        // Fetch rooms and rates for all filtered properties in parallel
        const allRooms: RoomResult[] = [];
        const allRates: { [roomTypeID: string]: RatePlan } = {};
        await Promise.all(filteredProperties.map(async (property: { propertyId: string; propertyName: string; city: string }) => {
          // Fetch room types
          const roomRes = await fetch(`/api/cloudbeds/room-types?propertyId=${property.propertyId}`);
          const roomData = await roomRes.json();
          if (roomData.success && Array.isArray(roomData.roomTypes)) {
            // Fetch rates for this property
            const rateRes = await fetch(`/api/cloudbeds/rate-plans?propertyId=${property.propertyId}&startDate=${startDate}&endDate=${endDate}`);
            const rateData = await rateRes.json();
            const propertyRates: { [roomTypeID: string]: RatePlan } = {};
            if (rateData.success && Array.isArray(rateData.ratePlans)) {
              rateData.ratePlans.forEach((rate: RatePlan) => {
                if (rate.ratePlanNamePublic === "Book Direct and Save – Up to 30% Cheaper Than Online Rates!" || rate.ratePlanNamePublic === "Book Direct and Save – Up to 35% Cheaper Than Online Rates!") {
                  propertyRates[rate.roomTypeID] = rate;
                  allRates[rate.roomTypeID] = rate;
                }
              });
            }
            // Map rooms and attach property info
            roomData.roomTypes.forEach((room: {
              roomTypeID: string;
              roomTypeName: string;
              roomTypeDescription: string;
              maxGuests: number;
              roomTypePhotos?: string[];
              roomTypeFeatures?: Record<string, string>;
            }) => {
              allRooms.push({
                id: room.roomTypeID,
                name: room.roomTypeName,
                description: room.roomTypeDescription,
                price: propertyRates[room.roomTypeID]?.totalRate || 0,
                maxGuests: room.maxGuests,
                available: propertyRates[room.roomTypeID] !== undefined,
                images: room.roomTypePhotos || [],
                amenities: Object.values(room.roomTypeFeatures || {}),
                propertyName: property.propertyName,
                propertyId: property.propertyId,
                city: property.city,
              });
            });
          }
        }));
        setResults(allRooms);
        setRates(allRates);
        setPropertyLoading(false);
        setLoading(false);
        console.log('Fetch complete');
      } catch (err) {
        setProperty(null);
        setResults([]);
        setRates({});
        setPropertyLoading(false);
        setLoading(false);
        setError('Failed to load rooms');
        console.error('Fetch error:', err);
      }
    };
    fetchPropertiesAndRooms();
  }, [city, propertyIdParam, startDate, endDate, adults, children, apartments, router]);

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

  // Parse adults and children as integers, default to 2 adults, 0 children
  const numAdults = adults ? parseInt(adults, 10) : 2;
  const numChildren = children ? parseInt(children, 10) : 0;
  const totalGuests = calculateTotalGuests(numAdults, numChildren);
  // Filter rooms based on both rate, guest capacity, and apartments availability
  const filteredRooms = results.filter(
    room => rates[room.id] !== undefined &&
            room.maxGuests >= totalGuests &&
            rates[room.id].roomsAvailable >= apartments
  );

  // Calculate number of nights
  const numberOfNights = startDate && endDate ? Math.max(1, Math.ceil((parseISO(endDate).getTime() - parseISO(startDate).getTime()) / (1000 * 60 * 60 * 24))) : 1;

  // Add to cart handler
  const handleAddToCart = (room: RoomResult) => {
    const qty = quantities[room.id] || 1;
    if (!rates[room.id] || qty < 1) return;
    setCart(prev => {
      const existing = prev.find(item => item.roomTypeID === room.id);
      if (existing) {
        // Update quantity (but not above maxAvailable)
        return prev.map(item =>
          item.roomTypeID === room.id
            ? { ...item, quantity: Math.min(item.quantity + qty, rates[room.id].roomsAvailable) }
            : item
        );
      } else {
        return [
          ...prev,
          {
            roomTypeID: room.id,
            roomName: room.name,
            price: rates[room.id].totalRate,
            quantity: qty,
            maxAvailable: rates[room.id].roomsAvailable,
          },
        ];
      }
    });
    // Reset quantity for this room
    setQuantities(q => ({ ...q, [room.id]: 1 }));
  };

  // Cart item quantity adjustment
  const handleCartQtyChange = (roomTypeID: string, newQty: number) => {
    setCart(prev => prev.map(item =>
      item.roomTypeID === roomTypeID
        ? { ...item, quantity: Math.max(1, Math.min(newQty, item.maxAvailable)) }
        : item
    ));
  };

  // Remove item from cart
  const handleRemoveFromCart = (roomTypeID: string) => {
    setCart(prev => prev.filter(item => item.roomTypeID !== roomTypeID));
  };

  // Proceed to guest details
  const handleProceed = () => {
    const bookingCart = {
      cart,
      checkIn: startDate,
      checkOut: endDate,
      adults: numAdults,
      children: numChildren,
      propertyId: property?.propertyId || '',
      city: city || '',
    };
    console.log('[SearchPage] Saving bookingCart to sessionStorage:', bookingCart);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bookingCart', JSON.stringify(bookingCart));
      // Save only search terms for back-to-search
      const searchParamsObj = {
        city: city || '',
        startDate: startDate || '',
        endDate: endDate || '',
        adults: numAdults.toString(),
        children: numChildren.toString(),
        apartments: apartments.toString(),
      };
      sessionStorage.setItem('lastSearchParams', JSON.stringify(searchParamsObj));
    }
    router.push('/booking');
  };

  if (propertyLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="mt-4 md:mt-0">
              <BookingWidget initialSearchParams={initialSearchParams} alwaysSticky />
            </div>
          </div>
          <div className="animate-pulse space-y-8 mt-32 md:mt-40">
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
        <div className="mt-4 md:mt-0">
          <BookingWidget initialSearchParams={initialSearchParams} alwaysSticky />
        </div>
        <div className="h-0 md:h-[112px]" />

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
            {(adults || children) && (
              <span> &middot; {numAdults} adult{numAdults === 1 ? '' : 's'}{numChildren > 0 ? `, ${numChildren} child${numChildren === 1 ? '' : 'ren'}` : ''}</span>
            )}
          </div>
          {error && <div className="text-red-500 mb-2">{error}</div>}
        </div>
        {/* Cart summary and controls at the top */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto bg-white rounded shadow p-4">
            <h2 className="text-lg font-bold mb-2">Your Reservation</h2>
            {cart.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No apartments added yet.</div>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.roomTypeID} className="flex items-center gap-4 border-b pb-3 mb-3">
                    <div className="flex-1">
                      <div className="font-semibold">{item.roomName}</div>
                      <div className="text-sm text-gray-600">MYR {item.price.toFixed(2)} per apartment</div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          className="px-2 py-1 border rounded"
                          onClick={() => handleCartQtyChange(item.roomTypeID, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >-</button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <button
                          className="px-2 py-1 border rounded"
                          onClick={() => handleCartQtyChange(item.roomTypeID, item.quantity + 1)}
                          disabled={item.quantity >= item.maxAvailable}
                        >+</button>
                      </div>
                    </div>
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => handleRemoveFromCart(item.roomTypeID)}
                      aria-label="Remove from cart"
                    >Remove</button>
                  </div>
                ))}
                <div className="flex justify-between mb-4 mt-4">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold">MYR {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
                </div>
                <button
                  className="w-full h-12 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition"
                  disabled={cart.length === 0}
                  onClick={handleProceed}
                >
                  Proceed to Guest Details
                </button>
              </>
            )}
          </div>
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
                    <div className="text-gray-500 text-sm mb-1">{room.propertyName}</div>
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
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">
                          {rates[room.id] !== undefined ? `MYR ${(rates[room.id].totalRate / numberOfNights).toFixed(2)}` : 'N/A'}
                        </span>
                        <span className="text-gray-600 text-base">per night</span>
                      </div>
                      <p className="text-lg font-medium mt-1">
                        {rates[room.id] !== undefined ? `MYR ${rates[room.id].totalRate.toFixed(2)} total` : 'N/A'}
                      </p>
                      {rates[room.id] !== undefined && typeof rates[room.id].roomsAvailable === 'number' && (
                        <p className="text-sm text-green-700 mt-1">
                          {rates[room.id].roomsAvailable} apartment{rates[room.id].roomsAvailable === 1 ? '' : 's'} available
                        </p>
                      )}
                    </div>
                    {/* Quantity selector and Add to Cart */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          className="px-2 py-1 border rounded"
                          onClick={() => setQuantities(q => ({ ...q, [room.id]: Math.max(1, (q[room.id] || 1) - 1) }))}
                          disabled={(quantities[room.id] || 1) <= 1}
                        >-</button>
                        <span className="w-6 text-center">{quantities[room.id] || 1}</span>
                        <button
                          className="px-2 py-1 border rounded"
                          onClick={() => setQuantities(q => ({ ...q, [room.id]: Math.min(rates[room.id].roomsAvailable, (q[room.id] || 1) + 1) }))}
                          disabled={(quantities[room.id] || 1) >= rates[room.id].roomsAvailable}
                        >+</button>
                      </div>
                      <Button
                        onClick={() => handleAddToCart(room)}
                        disabled={rates[room.id] === undefined || rates[room.id].roomsAvailable === 0}
                        size="lg"
                        variant="outline"
                        className="border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-black transition"
                      >
                        Add to Reservation
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        {selectedRoomImages && (() => {
          console.log('Modal images:', selectedRoomImages);
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
              onClick={() => {
                setSelectedRoomImages(null);
                setCarouselIndex(0);
              }}
              tabIndex={-1}
              aria-modal="true"
              role="dialog"
            >
              <div
                className="relative max-w-2xl w-full mx-4"
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full shadow p-2"
                  onClick={() => {
                    setSelectedRoomImages(null);
                    setCarouselIndex(0);
                    swiperInitialized.current = false;
                  }}
                  aria-label="Close image preview"
                >
                  ✕
                </button>
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation
                  pagination={{ clickable: true }}
                  className="rounded-xl"
                  initialSlide={carouselIndex}
                  onSlideChange={swiper => setCarouselIndex(swiper.activeIndex)}
                  onSwiper={swiper => {
                    swiperRef.current = swiper;
                    if (!swiperInitialized.current) {
                      swiper.slideTo(carouselIndex);
                      swiperInitialized.current = true;
                    }
                  }}
                >
                  {selectedRoomImages.map((img, idx) => (
                    <SwiperSlide key={idx}>
                      <div style={{ position: 'relative', width: '100%', height: '60vw', maxHeight: '80vh' }}>
                        <Image
                          src={img}
                          alt={`Room image ${idx + 1}`}
                          fill
                          className="object-contain rounded-xl"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <title>Soulasia | Search Results</title>
      <Suspense fallback={<div>Loading search results...</div>}>
        <SearchResults />
      </Suspense>
    </>
  );
}