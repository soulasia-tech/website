'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { parseISO } from "date-fns";
import { BookingWidget } from '@/components/booking-widget';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import type { Swiper as SwiperType } from 'swiper';
import { calculateTotalGuests } from '@/lib/guest-utils';
import { AvailablePropertiesMap } from '@/components/AvailablePropertiesMap';

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

// Update CartItem type
type CartItem = {
  roomTypeID: string;
  roomName: string;
  price: number;
  quantity: number;
  maxAvailable: number;
  propertyId: string;
  propertyName: string;
  adults: number;
  children: number;
  roomIDs: string[];
  rateId: string;
  ratePlanName: string;
};

// Add type for CloudbedsQuote
interface Breakdown {
  subtotal: number;
  sst: number;
  grandTotal: number;
}
interface CloudbedsQuote {
  subtotal: number;
  sst: number;
  grandTotal: number;
  breakdown?: Breakdown;
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
  const [proceeding, setProceeding] = useState(false);
  const [propertyInfoData, setPropertyInfoData] = useState<{ [propertyId: string]: unknown }>({});
  const [propertyInfoLoading, setPropertyInfoLoading] = useState<{ [propertyId: string]: boolean }>({});
  const [expandedAmenities, setExpandedAmenities] = useState<{ [roomId: string]: boolean }>({});
  const [roomGuests, setRoomGuests] = useState<{ [roomTypeID: string]: { adults: number; children: number } }>({});
  const [roomsByType, setRoomsByType] = useState<{ [roomTypeID: string]: string[] }>({});
  const [cloudbedsQuote, setCloudbedsQuote] = useState<CloudbedsQuote | null>(null);
  const [reserveStatus, setReserveStatus] = useState<{ [roomId: string]: 'idle' | 'loading' | 'added' }>({});

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
          const propertyRoomsByType: { [roomTypeID: string]: string[] } = {};
          if (roomData.success && Array.isArray(roomData.roomTypes)) {
            // Fetch actual rooms for this property
            const roomsRes = await fetch(`/api/cloudbeds/rooms?propertyId=${property.propertyId}`);
            const roomsData = await roomsRes.json();
            if (roomsData.success && Array.isArray(roomsData.rooms)) {
              roomsData.rooms.forEach((room: unknown) => {
                if (!propertyRoomsByType[(room as { roomTypeID: string }).roomTypeID]) propertyRoomsByType[(room as { roomTypeID: string }).roomTypeID] = [];
                propertyRoomsByType[(room as { roomTypeID: string }).roomTypeID].push((room as { roomID: string }).roomID);
              });
            }
            // Fetch rates for this property
            const rateRes = await fetch(`/api/cloudbeds/rate-plans?propertyId=${property.propertyId}&startDate=${startDate}&endDate=${endDate}`);
            const rateData = await rateRes.json();
            const propertyRates: { [roomTypeID: string]: RatePlan } = {};
            if (rateData.success && Array.isArray(rateData.ratePlans)) {
              rateData.ratePlans.forEach((rate: RatePlan) => {
                const is35Percent = rate.ratePlanNamePublic === "Book Direct and Save – Up to 35% Cheaper Than Online Rates!";
                const is30Percent = rate.ratePlanNamePublic === "Book Direct and Save – Up to 30% Cheaper Than Online Rates!";
                
                if (is35Percent || is30Percent) {
                  // Only set if we don't already have a 35% rate for this room
                  if (!propertyRates[rate.roomTypeID] || is35Percent) {
                    propertyRates[rate.roomTypeID] = rate;
                    allRates[rate.roomTypeID] = rate;
                    console.log(`[Rate Selection] Room ${rate.roomTypeID}: Selected rate "${rate.ratePlanNamePublic}" with totalRate ${rate.totalRate}`);
                  }
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
          setRoomsByType(prev => ({ ...prev, ...propertyRoomsByType }));
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

  // Add to cart handler (updated)
  const handleAddToCart = (room: RoomResult) => {
    setReserveStatus(prev => ({ ...prev, [room.id]: 'loading' }));
    const qty = quantities[room.id] || 1;
    const guests = roomGuests[room.id] || { adults: 2, children: 0 };
    if (!rates[room.id] || qty < 1) {
      setReserveStatus(prev => ({ ...prev, [room.id]: 'idle' }));
      return;
    }
    
    // Validate rate is a preferred rate
    const rate = rates[room.id];
    const isPreferredRate = rate.ratePlanNamePublic === "Book Direct and Save – Up to 35% Cheaper Than Online Rates!" ||
                           rate.ratePlanNamePublic === "Book Direct and Save – Up to 30% Cheaper Than Online Rates!";
    
    if (!isPreferredRate) {
      console.error(`Invalid rate for room ${room.id}: ${rate.ratePlanNamePublic}`);
      setReserveStatus(prev => ({ ...prev, [room.id]: 'idle' }));
      return;
    }
    
    console.log(`[Cart] Adding room with rate: ${rate.ratePlanNamePublic}`);
    // Validate maxGuests
    if ((guests.adults + guests.children) > room.maxGuests) {
      alert(`Cannot add more than ${room.maxGuests} guests to this room.`);
      setReserveStatus(prev => ({ ...prev, [room.id]: 'idle' }));
      return;
    }
    // Select the next available roomIDs for this roomType
    const roomIDs = roomsByType[room.id] ? roomsByType[room.id].slice(0, qty) : [];
    if (roomIDs.length < qty) {
      alert('Not enough available apartments/rooms for your selection. Please try a different room or reduce the quantity.');
      setReserveStatus(prev => ({ ...prev, [room.id]: 'idle' }));
      return;
    }
    const rateId = rates[room.id]?.id ? String(rates[room.id].id) : '';
    setCart(prev => {
      const existing = prev.find(item => item.roomTypeID === room.id);
      if (existing) {
        // Calculate new roomIDs (avoid duplicates)
        const alreadyUsed = new Set(existing.roomIDs);
        const availableRoomIDs = roomsByType[room.id]?.filter((id: string) => !alreadyUsed.has(id)) || [];
        const newRoomIDs = availableRoomIDs.slice(0, qty);
        return prev.map(item =>
          item.roomTypeID === room.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + qty, rates[room.id].roomsAvailable),
                adults: guests.adults,
                children: guests.children,
                roomIDs: [...item.roomIDs, ...newRoomIDs].slice(0, rates[room.id].roomsAvailable),
                rateId,
                ratePlanName: rates[room.id].ratePlanNamePublic || '',
              }
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
            propertyId: room.propertyId,
            propertyName: room.propertyName,
            adults: guests.adults,
            children: guests.children,
            roomIDs,
            rateId,
            ratePlanName: rates[room.id].ratePlanNamePublic || '',
          },
        ];
      }
    });
    // Reset quantity for this room
    setQuantities(q => ({ ...q, [room.id]: 1 }));
    setTimeout(() => {
      setReserveStatus(prev => ({ ...prev, [room.id]: 'added' }));
      setTimeout(() => {
        setReserveStatus(prev => ({ ...prev, [room.id]: 'idle' }));
      }, 1000);
    }, 400);
  };

  // Remove item from cart
  const handleRemoveFromCart = (roomTypeID: string) => {
    setCart(prev => prev.filter(item => item.roomTypeID !== roomTypeID));
  };

  // Add debug log for property at the top of SearchResults
  useEffect(() => {
    console.log('[SearchPage] property:', property);
    console.log('[SearchPage] propertyId:', property?.propertyId);
  }, [property]);

  // Proceed to guest details
  const handleProceed = () => {
    const cartPropertyId = cart.length > 0 ? cart[0].propertyId : '';
    console.log('[SearchPage] handleProceed property:', property);
    console.log('[SearchPage] handleProceed cartPropertyId:', cartPropertyId);
    const bookingCart = {
      cart,
      checkIn: startDate,
      checkOut: endDate,
      adults: numAdults,
      children: numChildren,
      propertyId: cartPropertyId,
      city: city || '',
    };
    console.log('[SearchPage] Saving bookingCart to sessionStorage:', bookingCart);
    if (!cartPropertyId) {
      alert('Error: propertyId is missing (cart). Cannot proceed to booking.');
      setProceeding(false);
      return;
    }
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
    // Always include propertyId in the URL
    router.push(`/booking?propertyId=${cartPropertyId}`);
  };

  // Preload property info for all visible room cards
  useEffect(() => {
    const uniquePropertyIds = Array.from(new Set(filteredRooms.map(r => r.propertyId)));
    uniquePropertyIds.forEach(propertyId => {
      if (!propertyInfoData[propertyId] && !propertyInfoLoading[propertyId]) {
        setPropertyInfoLoading(prev => ({ ...prev, [propertyId]: true }));
        fetch(`/api/cloudbeds/property?propertyId=${propertyId}`)
          .then(res => res.json())
          .then(data => {
            setPropertyInfoData(prev => ({ ...prev, [propertyId]: data }));
          })
          .catch(() => {
            setPropertyInfoData(prev => ({ ...prev, [propertyId]: { error: 'Failed to load property information' } }));
          })
          .finally(() => {
            setPropertyInfoLoading(prev => ({ ...prev, [propertyId]: false }));
          });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredRooms]);

  useEffect(() => {
    async function fetchCloudbedsQuote() {
      if (!cart.length || !cart[0].propertyId || !startDate || !endDate) return;
      // Call a new API endpoint to get a quote from Cloudbeds
      const res = await fetch(`/api/cloudbeds/quote?propertyId=${cart[0].propertyId}&checkIn=${startDate}&checkOut=${endDate}&cart=${encodeURIComponent(JSON.stringify(cart))}`);
      if (res.ok) {
        const data: { success: boolean; quote?: CloudbedsQuote } = await res.json();
        if (data.success && data.quote) setCloudbedsQuote(data.quote);
      }
    }
    fetchCloudbedsQuote();
  }, [cart, startDate, endDate]);

  if (propertyLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
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
        {/* Hide BookingWidget when image modal is open */}
        <div className="mt-4 md:mt-0">
          <BookingWidget initialSearchParams={initialSearchParams} stickyMode="always" hide={!!selectedRoomImages} />
        </div>
        <div className="h-0 md:h-[112px]" />

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Search Results */}
          <div className="md:w-2/3 w-full">
            <div className="space-y-6">
              {!error && filteredRooms.length === 0 && (
                <div className="text-gray-500 text-center py-8">
                  No rooms found for your search criteria. Try another property or reduce the number of guests.
                </div>
              )}
              {filteredRooms.map(room => {
                // Disable Reserve if cart contains rooms from a different property
                const isOtherProperty = !!(cart.length > 0 && results.find(r => r.id === cart[0].roomTypeID)?.propertyId && room.propertyId !== results.find(r => r.id === cart[0].roomTypeID)?.propertyId);
                return (
                  <Card key={room.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/2 w-full h-72 relative rounded-xl shadow overflow-hidden md:ml-2">
                        <Image 
                          src={`${room.images[0]}?w=600&h=400&fit=crop`}
                          alt={room.name}
                          width={600}
                          height={400}
                          className="object-cover cursor-pointer w-full h-full"
                          onClick={() => setSelectedRoomImages(room.images)}
                        />
                      </div>
                      <div className="p-6 md:w-2/3 flex flex-col">
                        <div className="flex-grow">
                          <h2 className="text-2xl font-bold mb-1 text-gray-900">{room.name}</h2>
                          <div className="text-gray-400 text-xs mb-2 font-medium">{room.propertyName}</div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {(expandedAmenities[room.id] ? room.amenities : room.amenities.slice(0, 3)).map((amenity, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-500 font-normal"
                              >
                                {amenity}
                              </span>
                            ))}
                            {!expandedAmenities[room.id] && room.amenities.length > 3 && (
                              <span
                                className="px-2 py-0.5 bg-gray-200 rounded-full text-xs text-gray-500 font-medium cursor-pointer hover:bg-gray-300"
                                onClick={() => setExpandedAmenities(prev => ({ ...prev, [room.id]: true }))}
                              >
                                +{room.amenities.length - 3} more
                              </span>
                            )}
                            {expandedAmenities[room.id] && room.amenities.length > 3 && (
                              <span
                                className="px-2 py-0.5 bg-gray-200 rounded-full text-xs text-gray-500 font-medium cursor-pointer hover:bg-gray-300"
                                onClick={() => setExpandedAmenities(prev => ({ ...prev, [room.id]: false }))}
                              >
                                Show less
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mb-2">Up to {room.maxGuests} guests</p>
                        </div>
                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                          <div>
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-xl font-bold text-[#0E3599]">
                                {rates[room.id] !== undefined ? `MYR ${(rates[room.id].totalRate / numberOfNights).toFixed(2)}` : 'N/A'}
                              </span>
                              <span className="text-gray-500 text-sm">per night</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-1 mb-2">
                              <span className="text-base font-medium text-gray-700">
                                {rates[room.id] !== undefined ? `MYR ${rates[room.id].totalRate.toFixed(2)} total` : 'N/A'}
                              </span>
                            </div>
                            {/* Grouped Selectors Row - now with Reserve button in the same row */}
                            <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-end w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-2">
                              {/* Selectors Group */}
                              <div className="flex flex-row gap-2 flex-1">
                                {/* Apartments Selector */}
                                <div className="flex flex-col items-center">
                                  <span className="text-[11px] text-gray-500 mb-0.5">Apartments</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      className="px-1.5 py-0.5 border rounded text-xs"
                                      onClick={() => setQuantities(q => ({ ...q, [room.id]: Math.max(1, (q[room.id] || 1) - 1) }))}
                                      disabled={(quantities[room.id] || 1) <= 1}
                                      type="button"
                                    >-</button>
                                    <span className="w-5 text-center text-xs">{quantities[room.id] || 1}</span>
                                    <button
                                      className="px-1.5 py-0.5 border rounded text-xs"
                                      onClick={() => setQuantities(q => ({ ...q, [room.id]: Math.min(rates[room.id]?.roomsAvailable || 1, (q[room.id] || 1) + 1) }))}
                                      disabled={(quantities[room.id] || 1) >= (rates[room.id]?.roomsAvailable || 1)}
                                      type="button"
                                    >+</button>
                                  </div>
                                </div>
                                {/* Adults Selector */}
                                <div className="flex flex-col items-center">
                                  <span className="text-[11px] text-gray-500 mb-0.5">Adults</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      className="px-1.5 py-0.5 border rounded text-xs"
                                      onClick={() => setRoomGuests(g => ({ ...g, [room.id]: { ...g[room.id], adults: Math.max(1, (g[room.id]?.adults ?? 2) - 1), children: g[room.id]?.children ?? 0 } }))}
                                      disabled={(roomGuests[room.id]?.adults ?? 2) <= 1}
                                      type="button"
                                    >-</button>
                                    <span className="w-5 text-center text-xs">{roomGuests[room.id]?.adults ?? 2}</span>
                                    <button
                                      className="px-1.5 py-0.5 border rounded text-xs"
                                      onClick={() => setRoomGuests(g => ({ ...g, [room.id]: { ...g[room.id], adults: Math.min(room.maxGuests, (g[room.id]?.adults ?? 2) + 1), children: g[room.id]?.children ?? 0 } }))}
                                      disabled={(roomGuests[room.id]?.adults ?? 2) + (roomGuests[room.id]?.children ?? 0) >= room.maxGuests}
                                      type="button"
                                    >+</button>
                                  </div>
                                </div>
                                {/* Children Selector */}
                                <div className="flex flex-col items-center">
                                  <span className="text-[11px] text-gray-500 mb-0.5">Children</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      className="px-1.5 py-0.5 border rounded text-xs"
                                      onClick={() => setRoomGuests(g => ({ ...g, [room.id]: { ...g[room.id], adults: g[room.id]?.adults ?? 2, children: Math.max(0, (g[room.id]?.children ?? 0) - 1) } }))}
                                      disabled={(roomGuests[room.id]?.children ?? 0) <= 0}
                                      type="button"
                                    >-</button>
                                    <span className="w-5 text-center text-xs">{roomGuests[room.id]?.children ?? 0}</span>
                                    <button
                                      className="px-1.5 py-0.5 border rounded text-xs"
                                      onClick={() => setRoomGuests(g => ({ ...g, [room.id]: { ...g[room.id], adults: g[room.id]?.adults ?? 2, children: Math.min(room.maxGuests - (g[room.id]?.adults ?? 2), (g[room.id]?.children ?? 0) + 1) } }))}
                                      disabled={(roomGuests[room.id]?.adults ?? 2) + (roomGuests[room.id]?.children ?? 0) >= room.maxGuests}
                                      type="button"
                                    >+</button>
                                  </div>
                                </div>
                              </div>
                              {/* Reserve Button */}
                              <Button
                                onClick={() => handleAddToCart(room)}
                                disabled={isOtherProperty || rates[room.id] === undefined || rates[room.id].roomsAvailable === 0 || reserveStatus[room.id] === 'loading'}
                                size="sm"
                                variant="default"
                                className="rounded-full bg-[#0E3599] hover:bg-[#0b297a] text-white font-bold px-6 py-2 shadow-md transition w-full md:w-auto md:ml-auto mt-2 md:mt-0"
                              >
                                {reserveStatus[room.id] === 'loading' ? (
                                  <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Adding...
                                  </span>
                                ) : reserveStatus[room.id] === 'added' ? (
                                  <span className="flex items-center gap-2 text-green-200">
                                    <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    Added!
                                  </span>
                                ) : (
                                  'Reserve'
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
          {/* Right: Booking Cart */}
          <div className="md:w-1/3 w-full flex flex-col gap-6">
            {/* Sticky container for desktop */}
            <div className="hidden md:block sticky top-8">
              <div className="flex flex-col gap-6">
                <Card className="p-8 shadow-lg bg-gray-50 rounded-2xl">
                  <h2 className="font-semibold text-2xl mb-6">Your Reservation</h2>
                  {cart.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">No apartments added yet.</div>
                  ) : (
                    <>
                      {cart.map(item => (
                        <div key={item.roomTypeID} className="flex flex-col gap-2 border-b border-gray-200 pb-4 mb-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl font-bold text-gray-900">{item.quantity} x {item.roomName}</span>
                              </div>
                              <div className="text-sm text-gray-500 mb-2">MYR {item.price.toFixed(2)} per apartment</div>
                              <div className="flex flex-col gap-1 mt-1 text-xs text-gray-600">
                                <span>Adults: {item.adults}</span>
                                <span>Children: {item.children}</span>
                              </div>
                            </div>
                            <button
                              className="text-red-500 hover:bg-red-50 rounded-full p-2 ml-4 mt-1"
                              onClick={() => handleRemoveFromCart(item.roomTypeID)}
                              aria-label="Remove from cart"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                        <span className="text-base text-gray-500 font-semibold">Total</span>
                        <span className="text-2xl font-bold text-gray-900">
                          {cloudbedsQuote ? `MYR ${cloudbedsQuote.grandTotal.toFixed(2)}` : cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                        </span>
                      </div>
                      {cloudbedsQuote && (
                        <div className="text-xs text-gray-600 mt-2">
                          <div>Subtotal: MYR {cloudbedsQuote.subtotal.toFixed(2)}</div>
                          <div>SST/Tax: MYR {cloudbedsQuote.sst.toFixed(2)}</div>
                          <div>Grand Total: MYR {cloudbedsQuote.grandTotal.toFixed(2)}</div>
                        </div>
                      )}
                      <div className="pt-2">
                        <Button
                          className="w-full h-14 bg-[#0E3599] hover:bg-[#0b297a] text-white rounded-full font-bold shadow-xl text-lg flex items-center justify-center transition"
                          disabled={cart.length === 0 || proceeding}
                          onClick={() => {
                            setProceeding(true);
                            handleProceed();
                          }}
                          style={{ boxShadow: '0 6px 32px 0 rgba(56, 132, 255, 0.18)' }}
                        >
                          {proceeding ? (
                            <span className="flex items-center gap-2">
                              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              Processing...
                            </span>
                          ) : (
                            'Proceed to Guest Details'
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
                <div className="rounded-2xl" style={{ height: 'calc(100vh - 2rem)' }}>
                  <AvailablePropertiesMap propertyIds={[...new Set(filteredRooms.map(r => r.propertyId))]} />
                </div>
              </div>
            </div>
            {/* Mobile fallback: show non-sticky on mobile */}
            <div className="block md:hidden flex flex-col gap-6">
              <Card className="p-8 shadow-lg bg-gray-50 rounded-2xl">
                <h2 className="font-semibold text-2xl mb-6">Your Reservation</h2>
                {cart.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">No apartments added yet.</div>
                ) : (
                  <>
                    {cart.map(item => (
                      <div key={item.roomTypeID} className="flex flex-col gap-2 border-b border-gray-200 pb-4 mb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl font-bold text-gray-900">{item.quantity} x {item.roomName}</span>
                            </div>
                            <div className="text-sm text-gray-500 mb-2">MYR {item.price.toFixed(2)} per apartment</div>
                            <div className="flex flex-col gap-1 mt-1 text-xs text-gray-600">
                              <span>Adults: {item.adults}</span>
                              <span>Children: {item.children}</span>
                            </div>
                          </div>
                          <button
                            className="text-red-500 hover:bg-red-50 rounded-full p-2 ml-4 mt-1"
                            onClick={() => handleRemoveFromCart(item.roomTypeID)}
                            aria-label="Remove from cart"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                      <span className="text-base text-gray-500 font-semibold">Total</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {cloudbedsQuote ? `MYR ${cloudbedsQuote.grandTotal.toFixed(2)}` : cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                      </span>
                    </div>
                    {cloudbedsQuote && (
                      <div className="text-xs text-gray-600 mt-2">
                        <div>Subtotal: MYR {cloudbedsQuote.subtotal.toFixed(2)}</div>
                        <div>SST/Tax: MYR {cloudbedsQuote.sst.toFixed(2)}</div>
                        <div>Grand Total: MYR {cloudbedsQuote.grandTotal.toFixed(2)}</div>
                      </div>
                    )}
                    <div className="pt-2">
                      <Button
                        className="w-full h-14 bg-[#0E3599] hover:bg-[#0b297a] text-white rounded-full font-bold shadow-xl text-lg flex items-center justify-center transition"
                        disabled={cart.length === 0 || proceeding}
                        onClick={() => {
                          setProceeding(true);
                          handleProceed();
                        }}
                        style={{ boxShadow: '0 6px 32px 0 rgba(56, 132, 255, 0.18)' }}
                      >
                        {proceeding ? (
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Processing...
                          </span>
                        ) : (
                          'Proceed to Guest Details'
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </Card>
              <div className="rounded-2xl" style={{ height: 'calc(100vh - 2rem)' }}>
                <AvailablePropertiesMap propertyIds={[...new Set(filteredRooms.map(r => r.propertyId))]} />
              </div>
            </div>
          </div>
        </div>
        {selectedRoomImages && (
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
        )}
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