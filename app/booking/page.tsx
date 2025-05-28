'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { format, parseISO, differenceInDays } from "date-fns";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { PropertyInformation } from '@/components/property-information';
import { cn } from "@/lib/utils";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import type { Swiper as SwiperType } from 'swiper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateTotalGuests } from '@/lib/guest-utils';

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomId: string;
  createAccount: boolean;
  password: string;
  phone?: string;
  estimatedArrivalTime?: string;
  country: string;
}

interface RoomType {
  roomTypeID: string;
  maxGuests: number;
  roomTypePhotos?: string[];
  roomTypeName?: string;
  roomTypeDescription?: string;
  price?: number;
  // Add other fields as needed
}

interface RatePlan {
  rateID: string;
  roomTypeID: string;
  totalRate: number;
  ratePlanNamePublic?: string;
  // Add other fields as needed
}

// Replace COUNTRIES array with objects containing code and name
const COUNTRIES = [
  { code: 'MY', name: 'Malaysia' },
  { code: 'US', name: 'United States of America' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'IN', name: 'India' },
  // ...add more as needed, or use a full ISO country code list
];

// Helper for 24h arrival times
const ARRIVAL_TIMES = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomType | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    checkIn: searchParams.get('startDate') || '',
    checkOut: searchParams.get('endDate') || '',
    adults: Number(searchParams.get('adults')) || 2,
    children: Number(searchParams.get('children')) || 0,
    roomId: searchParams.get('roomId') || '',
    createAccount: false,
    password: '',
    phone: '',
    estimatedArrivalTime: '',
    country: '',
  });
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const swiperInitialized = useRef(false);
  const [selectedRateID, setSelectedRateID] = useState<string>('');
  const [city, setCity] = useState<string | null>(searchParams.get('city'));

  // Log propertyId and searchParams for debugging
  useEffect(() => {
    const propertyId = searchParams.get('propertyId') || '';
    console.log('searchParams:', searchParams.toString());
    console.log('propertyId from searchParams:', propertyId);
    if (!propertyId) {
      console.warn('propertyId missing on mount, redirecting to /search');
      router.replace('/search');
    }
  }, [searchParams, router]);

  // Fetch real room info and price
  useEffect(() => {
    const roomId = searchParams.get('roomId') || '';
    const checkIn = searchParams.get('startDate') || '';
    const checkOut = searchParams.get('endDate') || '';
    const propertyIdFromParams = searchParams.get('propertyId') || '';

    // If any required param is missing, show error and do not fetch
    if (!propertyIdFromParams || !roomId || !checkIn || !checkOut) {
      setRoom(null);
      setPrice(null);
      setLoading(false);
      setError('Missing required booking information. Please return to the search page and select your room and dates again.');
      return;
    }
    setLoading(true);
    (async () => {
      try {
        // Always use production endpoints
        const roomRes = await fetch(`/api/cloudbeds/room-types?propertyId=${propertyIdFromParams}`);
        const roomData = await roomRes.json();
        let foundRoom = null;
        if (roomData.success && Array.isArray(roomData.roomTypes)) {
          foundRoom = roomData.roomTypes.find((r: RoomType) => String(r.roomTypeID) === String(roomId));
        }
        setRoom(foundRoom);
        // Fetch rates
        const rateRes = await fetch(`/api/cloudbeds/rate-plans?propertyId=${propertyIdFromParams}&startDate=${checkIn}&endDate=${checkOut}`);
        const rateData = await rateRes.json();
        let foundPrice = null;
        let directBookingRate = null;
        if (rateData.success && Array.isArray(rateData.ratePlans)) {
          // Only use the direct booking rate
          directBookingRate = rateData.ratePlans.find((r: RatePlan) => r.ratePlanNamePublic === "Book Direct and Save – Up to 30% Cheaper Than Online Rates!");
          if (directBookingRate) {
            foundPrice = directBookingRate.totalRate;
            setSelectedRateID(directBookingRate.rateID);
          } else {
            foundPrice = null;
            setSelectedRateID('');
          }
        }
        setPrice(foundPrice);
        if (!directBookingRate) {
          setError('Direct booking rate not available for these dates/room. Please try different dates or another room.');
        } else {
          setError(null);
        }
      } catch {
        setRoom(null);
        setPrice(null);
        setError('Failed to fetch rates. Please try again later.');
      }
      setLoading(false);
    })();
  }, [searchParams]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Pre-fill form with user data from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('first_name, last_name, email')
          .eq('id', user.id)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          return;
        }

        // If user exists in auth but not in users table, create the record
        if (!userData) {
          const { error: createError } = await supabase
            .from('users')
            .insert([{
              id: user.id,
              email: user.email,
              first_name: '',
              last_name: ''
            }]);

          if (createError) {
            console.error('Error creating user record:', createError);
            return;
          }
        }

        setBookingData(prev => ({
          ...prev,
          firstName: userData?.first_name || '',
          lastName: userData?.last_name || '',
          email: userData?.email || user.email || '',  // Fallback to auth email
        }));
      }
    };

    getUser();
  }, [supabase]);

  useEffect(() => {
    if (!loading && room === null) {
      setError('Could not load the selected room. Please try again or start your booking again.');
    } else if (!loading && room !== null) {
      setError(null); // Clear error if room is found
    }
  }, [loading, room]);

  useEffect(() => {
    setBookingData(prev => ({
      ...prev,
      roomId: searchParams.get('roomId') || '',
      checkIn: searchParams.get('startDate') || '',
      checkOut: searchParams.get('endDate') || '',
      adults: Number(searchParams.get('adults')) || 2,
      children: Number(searchParams.get('children')) || 0,
    }));
  }, [searchParams]);

  // Calculate number of nights
  const numberOfNights = bookingData.checkIn && bookingData.checkOut && room
    ? differenceInDays(parseISO(bookingData.checkOut), parseISO(bookingData.checkIn))
    : 0;

  // Calculate total price (Cloudbeds totalRate is for the whole stay)
  const totalPrice = price !== null ? price : null;
  const perNightPrice = price !== null && numberOfNights > 0 ? price / numberOfNights : null;

  // Reset carouselIndex and swiperInitialized when room changes or modal closes
  useEffect(() => {
    setCarouselIndex(0);
    swiperInitialized.current = false;
  }, [room, carouselOpen]);

  // Keyboard navigation for carousel
  useEffect(() => {
    if (!carouselOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCarouselOpen(false);
        setCarouselIndex(0);
        swiperInitialized.current = false;
      } else if (e.key === 'ArrowLeft') {
        setCarouselIndex((prev) => {
          if (!room?.roomTypePhotos || room.roomTypePhotos.length === 0) return 0;
          return prev > 0 ? prev - 1 : room.roomTypePhotos.length - 1;
        });
      } else if (e.key === 'ArrowRight') {
        setCarouselIndex((prev) => {
          if (!room?.roomTypePhotos || room.roomTypePhotos.length === 0) return 0;
          return prev < room.roomTypePhotos.length - 1 ? prev + 1 : 0;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [carouselOpen, room]);

  // Sync Swiper with carouselIndex
  useEffect(() => {
    if (swiperRef.current && carouselOpen && swiperInitialized.current) {
      swiperRef.current.slideTo(carouselIndex);
    }
  }, [carouselIndex, carouselOpen]);

  // Fetch city from propertyId if missing
  useEffect(() => {
    if (!city) {
      const propertyId = searchParams.get('propertyId');
      if (propertyId) {
        fetch('/api/cloudbeds-properties')
          .then(res => res.json())
          .then(data => {
            if (data.success && Array.isArray(data.properties)) {
              const found = data.properties.find((p: { propertyId: string }) => p.propertyId === propertyId);
              if (found && found.city) setCity(found.city);
            }
          });
      }
    }
  }, [city, searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage('');
    setLoadingMessage('Redirecting to payment...');

    try {
      const propertyId = searchParams.get('propertyId') || '';
      if (!propertyId) {
        setError('Missing propertyId. Please return to the search page and select your property again.');
        setSubmitting(false);
        return;
      }
      console.log('propertyId at submit:', propertyId);
      console.log('Starting booking process...', {
        createAccount: bookingData.createAccount,
        user: user,
        bookingData
      });

      if (!room) {
        throw new Error('Invalid room selection');
      }
      if (numberOfNights <= 0) {
        throw new Error('Invalid date selection');
      }
      const totalGuests = calculateTotalGuests(bookingData.adults, bookingData.children);
      if (totalGuests > (room.maxGuests || 0)) {
        throw new Error(`Maximum ${room.maxGuests} guests allowed for this room`);
      }

      let currentUser = user;

      // If user is already authenticated, update their information
      if (currentUser) {
        console.log('Updating existing user information...');
        const { error: updateError } = await supabase
          .from('users')
          .update({
            first_name: bookingData.firstName,
            last_name: bookingData.lastName,
            email: bookingData.email
          })
          .eq('id', currentUser.id);

        if (updateError) {
          console.error('Error updating user information:', updateError);
          throw new Error(`Failed to update user information: ${updateError.message}`);
        }
      }
      // Handle new user creation (existing code)
      else if (bookingData.createAccount) {
        setLoadingMessage('Creating your account...');
        console.log('Creating new user account...');
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: bookingData.email,
          password: bookingData.password,
          options: {
            data: {
              first_name: bookingData.firstName,
              last_name: bookingData.lastName
            }
          }
        });

        console.log('User creation response:', { authData, authError });

        if (authError || !authData.user) {
          throw new Error(`Failed to create account: ${authError?.message || 'No user created'}`);
        }

        currentUser = authData.user;
        setUser(currentUser);
        console.log('New user set:', currentUser);

        // Ensure user record exists in public.users table
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            id: currentUser.id,
            email: bookingData.email,
            first_name: bookingData.firstName,
            last_name: bookingData.lastName
          });

        if (userError) {
          console.error('Error creating user record:', userError);
          throw new Error(`Failed to create user record: ${userError.message}`);
        }
      }

      // --- Generate a random token and store booking data in localStorage ---
      const bookingToken = crypto.randomUUID();
      const bookingPayload = {
        bookingData,
        selectedRateID, // this will be the direct booking rateID
        propertyId,
        room: room,
        price,
        numberOfNights,
        totalPrice,
        userId: currentUser?.id // Store userId if available
      };
      localStorage.setItem(`booking_${bookingToken}`, JSON.stringify(bookingPayload));

      // --- Billplz Payment Flow ---
      setLoadingMessage('Redirecting to payment...');
      // Use bookingToken as Billplz reference_1 and pass propertyId as reference_2
      const billPayload = {
        amount: 100, // TESTING: Always charge 1.00 MYR for now. REMOVE THIS FOR PRODUCTION!
        name: `${bookingData.firstName} ${bookingData.lastName}`,
        email: bookingData.email,
        callback_url: `${window.location.origin}/api/payment/billplz-callback`,
        redirect_url: `${window.location.origin}/confirmation?bookingToken=${bookingToken}`,
        reference_1: bookingToken,
        reference_2: propertyId,
      };
      // Call our API route to create the Billplz bill
      const billRes = await fetch('/api/payment/create-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billPayload),
      });
      const billData = await billRes.json();
      if (!billData.success || !billData.bill?.url) {
        throw new Error(billData.error || 'Failed to create payment bill');
        }
      // Redirect user to Billplz payment page
      window.location.href = billData.bill.url;
      // No further code runs after redirect
    } catch (error) {
      console.error('Booking process error:', error);
      handleError(error);
      setSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
  };

  const handleError = (error: Error | unknown) => {
    console.error('Error:', error);
    setError(error instanceof Error ? error.message : 'An unexpected error occurred');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Booking Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button onClick={() => router.push('/')} className="mt-2">Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Guest Contact details</h1>
          <Button 
            variant="outline"
            onClick={() => {
              // Use all current search params to reconstruct the search URL
              const params = new URLSearchParams();
              if (city) params.set('city', city);
              if (searchParams.get('startDate')) params.set('startDate', searchParams.get('startDate')!);
              if (searchParams.get('endDate')) params.set('endDate', searchParams.get('endDate')!);
              if (searchParams.get('adults')) params.set('adults', searchParams.get('adults')!);
              if (searchParams.get('children')) params.set('children', searchParams.get('children')!);
              router.push(`/search?${params.toString()}`);
            }}
            className="flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Search
          </Button>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {/* Booking Form */}
          <div className="md:col-span-2">
            <Card className="p-6">
              {successMessage && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
                  <p>{successMessage}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
                  <p>{error}</p>
                </div>
              )}

              {loadingMessage && (
                <div className="text-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-gray-600">{loadingMessage}</p>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <Input
                      required
                      value={bookingData.firstName}
                      onChange={(e) => setBookingData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <Input
                      required
                      value={bookingData.lastName}
                      onChange={(e) => setBookingData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    required
                    value={bookingData.email}
                    onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Check-in</label>
                  <Input
                    type="date"
                    required
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData(prev => ({ ...prev, checkIn: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Check-out</label>
                  <Input
                    type="date"
                    required
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData(prev => ({ ...prev, checkOut: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Number of adults</label>
                    <div className="py-2 px-3 bg-gray-100 rounded text-gray-800">{bookingData.adults}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Number of children</label>
                    <div className="py-2 px-3 bg-gray-100 rounded text-gray-800">{bookingData.children}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 mb-4">To change the number of adults or children, <button type="button" className="text-blue-600 underline" onClick={() => {
                  // Use all current search params to reconstruct the search URL
                  const params = new URLSearchParams();
                  searchParams.forEach((value, key) => {
                    params.set(key, value);
                  });
                  router.push(`/search?${params.toString()}`);
                }}>go back to search</button>.</p>

                {/* Estimated Arrival Time */}
                <div>
                  <label className="block text-sm font-medium mb-1">Estimated Arrival Time (optional)</label>
                  <Select
                    value={bookingData.estimatedArrivalTime || ''}
                    onValueChange={(value: string) => setBookingData(prev => ({ ...prev, estimatedArrivalTime: value }))}
                  >
                    <SelectTrigger className={cn("w-full text-left", !bookingData.estimatedArrivalTime && "text-gray-400")}> 
                      <SelectValue placeholder="Select time (optional)" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {ARRIVAL_TIMES.map(time => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <Select
                    value={bookingData.country || ''}
                    onValueChange={(value: string) => setBookingData(prev => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger className={cn("w-full text-left", !bookingData.country && "text-gray-400")}> 
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {COUNTRIES.map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Add account creation section for non-authenticated users */}
                {!user && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        id="createAccount"
                        checked={bookingData.createAccount}
                        onChange={(e) => setBookingData(prev => ({ 
                          ...prev, 
                          createAccount: e.target.checked,
                          password: e.target.checked ? prev.password : '' 
                        }))}
                        className="h-4 w-4"
                      />
                      <label htmlFor="createAccount" className="text-sm font-medium">
                        Create an account to manage your bookings
                      </label>
                    </div>
                    {bookingData.createAccount && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Password</label>
                        <Input
                          type="password"
                          value={bookingData.password}
                          onChange={(e) => setBookingData(prev => ({ ...prev, password: e.target.value }))}
                          required={bookingData.createAccount}
                          placeholder="••••••••"
                          minLength={6}
                        />
                        <p className="text-xs text-gray-500">
                          Must be at least 6 characters long
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/*
                // --- Direct Booking Rate UI (commented out as per request) ---
                {ratePlans.length > 0 && !error && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Direct Booking Rate</label>
                    <div className="flex items-center gap-3 p-2 rounded border border-gray-200 bg-gray-50">
                      <span className="font-medium text-gray-900">{ratePlans[0].ratePlanNamePublic}</span>
                      <span className="text-gray-600 text-sm">MYR {ratePlans[0].totalRate.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                */}

                <Button 
                  type="submit" 
                  disabled={submitting} 
                  variant="outline"
                  className="w-full h-12 border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-black transition"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Continue to Payment'
                  )}
                </Button>

                {!user && (
                  <p className="text-sm text-gray-500 text-center mt-4">
                    Already have an account?{' '}
                    <Link href={`/auth/sign-in?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`} className="text-blue-600 hover:underline">
                      Sign in
                    </Link>
                  </p>
                )}
              </form>
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="p-6 sticky top-6">
              <h2 className="font-semibold mb-4">Booking Summary</h2>
              
              <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                {room && room.roomTypePhotos && room.roomTypePhotos[0] ? (
                  <Image
                    src={`${room.roomTypePhotos[0]}?w=400&h=300&fit=crop`}
                    alt={room.roomTypeName || ''}
                    width={400}
                    height={300}
                    className="object-cover cursor-pointer"
                    onClick={() => setCarouselOpen(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No image</div>
                )}
              </div>

              <h3 className="font-medium mb-2">{room ? room.roomTypeName : ''}</h3>

              <div className="space-y-2 text-sm">
                {price === null && (
                  <div className="text-red-500 text-sm mb-2">No rates available for this room and date selection. Please try different dates or another room.</div>
                )}
                <div className="flex justify-between">
                  <span>Check-in</span>
                  <span className="font-medium">{format(parseISO(bookingData.checkIn), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out</span>
                  <span className="font-medium">{format(parseISO(bookingData.checkOut), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of nights</span>
                  <span className="font-medium">{numberOfNights}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price per night</span>
                  <span className="font-medium">
                    {perNightPrice !== null ? `MYR ${perNightPrice.toFixed(2)}` : 'N/A'}
                  </span>
                </div>
                <div className="pt-2 mt-2 border-t flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">
                    {totalPrice !== null ? `MYR ${totalPrice.toFixed(2)}` : 'N/A'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
        {/* Property Information Section (added below booking form/summary) */}
        {searchParams.get('propertyId') && <div className="mt-12"><PropertyInformation propertyId={searchParams.get('propertyId')!} /></div>}
      </div>
      {/* Swiper Modal Carousel */}
      {carouselOpen && room && room.roomTypePhotos && room.roomTypePhotos.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => {
            setCarouselOpen(false);
            setCarouselIndex(0);
            swiperInitialized.current = false;
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
                setCarouselOpen(false);
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
              {room.roomTypePhotos.map((img, idx) => (
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
  );
}

export default function BookingPage() {
  return (
    <>
      <title>Soulasia | Guest Details</title>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      }>
        <BookingForm />
      </Suspense>
    </>
  );
} 