'use client';

import React, {Suspense, useEffect, useRef, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import Image from 'next/image';
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {parseISO} from "date-fns";
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import type {Swiper as SwiperType} from 'swiper';
import {calculateTotalGuests} from '@/lib/guest-utils';
import {AvailablePropertiesMap} from '@/components/AvailablePropertiesMap';
import {useUI} from "@/lib/context";

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
  sumAllRate?: number;
  roomRateDetailed?: DetailRatePlan[]
  [key: string]: unknown; // For any extra fields
}

interface DetailRatePlan {
  closedToArrival: boolean
  closedToDeparture: boolean
  date: string
  lastMinuteBooking: number
  rate: number
  roomsAvailable: number
  totalRate: number
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
  const { isActive } = useUI();

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
  // const [expandedAmenities, setExpandedAmenities] = useState<{ [roomId: string]: boolean }>({});
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
  // const initialSearchParams = {
  //   city: city || '',
  //   startDate: startDate || '',
  //   endDate: endDate || '',
  //   adults: adults || '2',
  //   children: children || '0',
  //   apartments: apartments.toString(),
  // };

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
            const roomsRes = await fetch(`/api/cloudbeds/rooms?propertyId=${property.propertyId}&pageSize=100`);
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
                if (rate.ratePlanNamePublic === "Book Direct and Save – Up to 30% Cheaper Than Online Rates!") {
                  rate.sumAllRate = rate?.roomRateDetailed?.reduce((sum, d) => sum + d.totalRate, 0)
                  propertyRates[rate.roomTypeID] = rate;
                  allRates[rate.roomTypeID] = rate;
                  console.log(`[Rate Selection] Room ${rate.roomTypeID}: Selected rate \"${rate.ratePlanNamePublic}\" with totalRate ${rate.totalRate}`);
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
                price: propertyRates[room.roomTypeID]?.sumAllRate || propertyRates[room.roomTypeID]?.totalRate || 0,
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
    const isPreferredRate = rate.ratePlanNamePublic === "Book Direct and Save – Up to 30% Cheaper Than Online Rates!";
    if (!isPreferredRate) {
      console.error(`Invalid rate for room ${room.id}: ${rate.ratePlanNamePublic}`);
      setReserveStatus(prev => ({ ...prev, [room.id]: 'idle' }));
      return;
    }
    // Ensure rateId is present and valid
    const rateId = rate.rateID ? String(rate.rateID) : '';
    if (!rateId) {
      console.error(`[Cart] ERROR: Missing rateId for discounted rate. Rate object:`, rate);
      alert('Sorry, there was a problem fetching the correct rate for this room. Please try again or contact support.');
      setReserveStatus(prev => ({ ...prev, [room.id]: 'idle' }));
      return;
    }
    console.log(`[Cart] Adding room with rate: ${rate.ratePlanNamePublic}, rateId: ${rateId}`);
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
            price: rates[room.id]?.sumAllRate ?? rates[room.id].totalRate,
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
      <div className="min-h-screen section-padding-y">
        <div className="container mx-auto">
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
    <div className={["min-h-screen bg-white section-component-p-y", (isActive ? 'mt-50 tb:mt-20' : '')].join(' ')}>
      {isActive}
      <div className="container mx-auto">
        <h2 className="h2 font-semibold mb-5">Available apartments</h2>
        <div className="flex flex-col lp:flex-row gap-5">
          {/* Left: Search Results */}
          <div className="lp:w-2/3 w-full">
            <div className="space-y-4 tb:space-y-5">
              {!error && filteredRooms.length === 0 && (
                  <div className="text-gray-500 text-center py-8">
                    No rooms found for your search criteria. Try another property or reduce the number of guests.
                  </div>
              )}
              {filteredRooms.map(room => {
                // Disable Reserve if cart contains rooms from a different property
                const isOtherProperty = !!(cart.length > 0 && results.find(r => r.id === cart[0].roomTypeID)?.propertyId && room.propertyId !== results.find(r => r.id === cart[0].roomTypeID)?.propertyId);
                return (
                    // flex flex-col md:flex-row
                    <div key={room.id} className="grid grid-cols-1 tb:grid-cols-[1fr_auto] items-strech bg-[#f7f7f7] h-full p-4 tb:p-5 text-card-foreground items-stretch gap-5 rounded-xl border overflow-hidden">
                      <div className="relative rounded-xl max-h-[200px] tb:max-h-[600px] overflow-hidden ">
                        <Image
                            src={`${room.images[0]}?w=600&h=400&fit=crop`}
                            alt={room.name}
                            width={600}
                            height={400}
                            className="object-cover cursor-pointer w-full h-full"
                            onClick={() => setSelectedRoomImages(room.images)}
                        />
                      </div>
                      <div className="flex flex-col space-y-2.5 tb:space-y-5 w-full lp:min-w-[450px]">
                        <div className="gap-1 tb:gap-2.5">
                          <h2 className="text-xl lp:text-2xl font-semibold  text-gray-900 mb-1">{room.name}</h2>
                          <div className="text-base tb:text-lg text-[#4a4f5b] font-normal">{room.propertyName}</div>
                          <div className="text-base tb:text-lg text-[#4a4f5b] font-normal">Up to {room.maxGuests} guests</div>
                        </div>
                        <div className="border-t border-[#dee3ed]"></div>
                        <div className=" items-baseline gap-2">
                          <div className="flex flex-wrap items-center">
                            <span className="mr-1 text-lg tb:text-xl font-bold text-[#0E3599]">
                              {rates[room.id] !== undefined ? `MYR ${((rates[room.id]?.sumAllRate ?? rates[room.id].totalRate) / numberOfNights).toFixed(2)}` : 'N/A'}
                            </span>
                            <span className="text-gray-500 text-sm tb:text-base">per night</span>
                          </div>
                          <div className="flex flex-wrap items-center ">
                              <span className="text-base tb:text-lg font-medium text-gray-700">
                                {rates[room.id] !== undefined ? `MYR 
                                ${rates[room.id]?.sumAllRate !== undefined ? rates[room.id]?.sumAllRate?.toFixed(2) : rates[room.id].totalRate.toFixed(2)}
                                 total` : 'N/A'}
                              </span>
                          </div>
                        </div>
                        <div
                            className="flex flex-col tb:flex-row gap-2.5 p-2.5 tb:3.75 items-stretch w-full border border-gray-200 rounded-lg">
                          {/* Selectors Group */}
                          <div className="w-full flex flex-row gap-2.5 justify-between flex-1">
                            {/* Apartments Selector */}
                            <div className="flex flex-col gap-2.5">
                              <span className="text-xs lp:text-sm text-gray-500 mb-0.5">Apartments</span>
                              <div className="flex items-center gap-2">
                                <Button type="button" size="responsive" variant="outline"
                                        className="text-lg tb:text-2xl size-[var(--action-h-sm)] tb:size-[var(--action-h-md)]"
                                        onClick={() => setQuantities(q => ({
                                          ...q,
                                          [room.id]: Math.max(1, (q[room.id] || 1) - 1)
                                        }))}
                                        disabled={(quantities[room.id] || 1) <= 1}
                                >-</Button>
                                <span
                                    className="w-2 font-semibold text-xs tb:text-base text-[#101828] text-center">{quantities[room.id] || 1}</span>
                                <Button type="button" size="responsive" variant="outline"
                                        className="bg-[#e5eeff] text-lg tb:text-2xl  size-[var(--action-h-sm)] tb:size-[var(--action-h-md)]"
                                        onClick={() => setQuantities(q => ({
                                          ...q,
                                          [room.id]: Math.min(rates[room.id]?.roomsAvailable || 1, (q[room.id] || 1) + 1)
                                        }))}
                                        disabled={(quantities[room.id] || 1) >= (rates[room.id]?.roomsAvailable || 1)}
                                >+</Button>
                              </div>
                            </div>
                            {/* Adults Selector */}
                            <div className="flex flex-col gap-2.5">
                              <span className=" text-xs lp:text-sm text-gray-500 mb-0.5">Adults</span>
                              <div className="flex items-center gap-2">
                                <Button type="button" size="responsive" variant="outline"
                                        className="text-lg tb:text-2xl size-[var(--action-h-sm)] tb:size-[var(--action-h-md)]"
                                        onClick={() => setRoomGuests(g => ({
                                          ...g,
                                          [room.id]: {
                                            ...g[room.id],
                                            adults: Math.max(1, (g[room.id]?.adults ?? 2) - 1),
                                            children: g[room.id]?.children ?? 0
                                          }
                                        }))}
                                        disabled={(roomGuests[room.id]?.adults ?? 2) <= 1}
                                >-</Button>
                                <span
                                    className="w-2 font-semibold text-xs tb:text-base text-[#101828] text-center">{roomGuests[room.id]?.adults ?? 2}</span>
                                <Button type="button" size="responsive" variant="outline"
                                        className="bg-[#e5eeff] text-lg tb:text-2xl  size-[var(--action-h-sm)] tb:size-[var(--action-h-md)]"
                                        onClick={() => setRoomGuests(g => ({
                                          ...g,
                                          [room.id]: {
                                            ...g[room.id],
                                            adults: Math.min(room.maxGuests, (g[room.id]?.adults ?? 2) + 1),
                                            children: g[room.id]?.children ?? 0
                                          }
                                        }))}
                                        disabled={(roomGuests[room.id]?.adults ?? 2) + (roomGuests[room.id]?.children ?? 0) >= room.maxGuests}
                                >+</Button>
                              </div>
                            </div>
                            {/* Children Selector */}
                            <div className="flex flex-col gap-2.5">
                              <span className="text-xs lp:text-sm text-gray-500 mb-0.5">Children</span>
                              <div className="flex items-center gap-2">
                                <Button type="button" size="responsive" variant="outline"
                                        className="text-lg tb:text-2xl size-[var(--action-h-sm)] tb:size-[var(--action-h-md)]"
                                        onClick={() => setRoomGuests(g => ({
                                          ...g,
                                          [room.id]: {
                                            ...g[room.id],
                                            adults: g[room.id]?.adults ?? 2,
                                            children: Math.max(0, (g[room.id]?.children ?? 0) - 1)
                                          }
                                        }))}
                                        disabled={(roomGuests[room.id]?.children ?? 0) <= 0}
                                >-</Button>
                                <span
                                    className="w-2 font-semibold text-xs tb:text-base text-[#101828] text-center">{roomGuests[room.id]?.children ?? 0}</span>
                                <Button type="button" size="responsive" variant="outline"
                                        className="bg-[#e5eeff] text-lg tb:text-2xl  size-[var(--action-h-sm)] tb:size-[var(--action-h-md)]"
                                        onClick={() => setRoomGuests(g => ({
                                          ...g,
                                          [room.id]: {
                                            ...g[room.id],
                                            adults: g[room.id]?.adults ?? 2,
                                            children: Math.min(room.maxGuests - (g[room.id]?.adults ?? 2), (g[room.id]?.children ?? 0) + 1)
                                          }
                                        }))}
                                        disabled={(roomGuests[room.id]?.adults ?? 2) + (roomGuests[room.id]?.children ?? 0) >= room.maxGuests}
                                >+</Button>
                              </div>
                            </div>
                          </div>
                          {/* Reserve Button */}
                          <Button
                              onClick={() => handleAddToCart(room)}
                              disabled={isOtherProperty || rates[room.id] === undefined || rates[room.id].roomsAvailable === 0 || reserveStatus[room.id] === 'loading'}
                              variant="default"
                              className={["font-semibold flex items-center justify-center bg-[#0E3599] rounded-lg px-2 tb:px-6 w-full tb:w-auto",
                                "h-[var(--action-h-1xl)] lp:h-[var(--action-h-3xl)]"].join(' ')}

                              onMouseOver={e => (e.currentTarget.style.backgroundColor = '#102e7a')}
                              onMouseOut={e => (e.currentTarget.style.backgroundColor = '#0E3599')}
                          >
                            {reserveStatus[room.id] === 'loading' ? (
                                <span className="flex items-center gap-2">
                                    <span
                                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Adding...
                                  </span>
                            ) : reserveStatus[room.id] === 'added' ? (
                                <span className="flex items-center gap-2 text-green-200">
                                    <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor"
                                         strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round"
                                                                                   strokeLinejoin="round"
                                                                                   d="M5 13l4 4L19 7"/></svg>
                                    Added!
                                  </span>
                            ) : (
                                'Reserve'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>
          </div>
          {/* Right: Booking Cart */}
          <div className="lp:w-1/3 w-full flex flex-col gap-5">
            {/* Sticky container for desktop */}
            <div className="block lp:sticky top-20">
              <div className="flex flex-col gap-6">
                <Card className="p-6 shadow-none rounded-xl">
                  <h2 className="text-xl lp:text-2xl font-semibold">Your Reservation</h2>
                  {cart.length === 0 ? (
                      <div className="text-gray-500 text-center py-8">No apartments added yet.</div>
                  ) : (
                      <>
                        {cart.map(item => (
                            <div key={item.roomTypeID}
                                 className="flex flex-col gap-2 border-b border-gray-200 pb-4 mb-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span
                                        className="text-xl font-bold text-gray-900">{item.quantity} x {item.roomName}</span>
                                  </div>
                                  <div className="text-sm text-gray-500 mb-2">MYR {item.price.toFixed(2)} per
                                    apartment
                                  </div>
                                  <div className="flex flex-col gap-1 mt-1 text-xs text-gray-600">
                                    <span>Adults: {item.adults}</span>
                                    <span>Children: {item.children}</span>
                                  </div>
                                </div>
                                <Button type="button" size="responsive"
                                        className="text-red-500 hover:bg-red-70 p-2 ml-4 shadow-none bg-[#fee] text-lg tb:text-2xl  size-[var(--action-h-sm)] tb:size-[var(--action-h-md)]"
                                        onClick={() => handleRemoveFromCart(item.roomTypeID)}
                                        aria-label="Remove from cart"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                       strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                  </svg>
                                </Button>
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
                        <div>
                          <Button
                              disabled={cart.length === 0 || proceeding}
                              onClick={() => {
                                setProceeding(true);
                                handleProceed();
                              }}
                              style={{boxShadow: '0 6px 32px 0 rgba(56, 132, 255, 0.18)'}}
                              variant="default"
                              className={["font-semibold flex items-center justify-center bg-[#0E3599] rounded-lg px-2 tb:px-6 w-full text-lg",
                                "h-[var(--action-h-1xl)] lp:h-[var(--action-h-3xl)]"].join(' ')}

                              onMouseOver={e => (e.currentTarget.style.backgroundColor = '#102e7a')}
                              onMouseOut={e => (e.currentTarget.style.backgroundColor = '#0E3599')}
                          >
                            {proceeding ? (
                                <span className="flex items-center gap-2">
                              <span
                                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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
                <div className="rounded-xl" style={{height: 'calc(100vh - 2rem)'}}>
                  <AvailablePropertiesMap propertyIds={[...new Set(filteredRooms.map(r => r.propertyId))]}/>
                </div>
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
                    className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full shadow p-2 px-4"
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
                    navigation={{
                      nextEl: ".custom-next",
                      prevEl: ".custom-prev",
                    }}
                    pagination={{clickable: true}}
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
                        <div style={{position: 'relative', width: '100%', height: '60vw', maxHeight: '80vh'}}>
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

                  {/* Custom arrows */}
                  <button
                       className="cursor-pointer flex items-center bg-[#e5eeff] rounded-md justify-center aspect-[1/1] w-[32px] lp:w-[40px]
                       custom-prev absolute left-2 top-1/2 -translate-y-1/2 z-20 hover:bg-white/20
                       ">
                    <Image
                        src="/icons/arrow.svg"
                        alt="Prev"
                        className="transform rotate-180"
                        width={16}
                        height={16}
                    />
                  </button>
                  <button
                       className="cursor-pointer mb-2 flex items-center bg-[#e5eeff] rounded-md justify-center aspect-[1/1] w-[32px] lp:w-[40px]
                       custom-next absolute right-2 top-1/2 -translate-y-1/2 z-20 hover:bg-white/20">
                    <Image
                        src="/icons/arrow.svg"
                        alt="Next"
                        width={16}
                        height={16}
                    />
                  </button>
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
          <SearchResults/>
        </Suspense>
      </>
  );
}
