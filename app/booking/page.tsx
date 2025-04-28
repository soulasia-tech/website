'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { format, parseISO, differenceInDays } from "date-fns";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { User as SupabaseUser } from '@supabase/supabase-js';

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
}

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<any>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [propertyId, setPropertyId] = useState<string>(searchParams.get('propertyId') || '');
  const [bookingData, setBookingData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    checkIn: searchParams.get('startDate') || '',
    checkOut: searchParams.get('endDate') || '',
    adults: 2,
    children: 0,
    roomId: searchParams.get('roomId') || '',
    createAccount: false,
    password: ''
  });
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Fetch real room info and price
  useEffect(() => {
    const roomId = searchParams.get('roomId') || '';
    const checkIn = searchParams.get('startDate') || '';
    const checkOut = searchParams.get('endDate') || '';
    const propertyIdFromParams = searchParams.get('propertyId') || '';

    if (!propertyIdFromParams || !roomId || !checkIn || !checkOut) {
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        // Fetch room types
        const roomRes = await fetch(`/api/test-cloudbeds-roomtypes?propertyId=${propertyIdFromParams}`);
        const roomData = await roomRes.json();
        // Debug log to help trace room lookup issues
        console.log('roomTypes:', roomData.roomTypes, 'Looking for roomId:', roomId);
        let foundRoom = null;
        if (roomData.success && Array.isArray(roomData.roomTypes)) {
          foundRoom = roomData.roomTypes.find((r: any) => String(r.roomTypeID) === String(roomId));
        }
        setRoom(foundRoom);
        // Fetch rates
        const rateRes = await fetch(`/api/test-cloudbeds-rateplans?propertyId=${propertyIdFromParams}&startDate=${checkIn}&endDate=${checkOut}`);
        const rateData = await rateRes.json();
        let foundPrice = null;
        if (rateData.success && Array.isArray(rateData.ratePlans)) {
          const rates = rateData.ratePlans.filter((r: any) => r.roomTypeID === roomId);
          if (rates.length > 0) {
            foundPrice = Math.min(...rates.map((r: any) => r.totalRate));
          }
        }
        setPrice(foundPrice);
      } catch {
        setRoom(null);
        setPrice(null);
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
        const { data: userData } = await supabase
          .from('users')
          .select('first_name, last_name, email')
          .eq('id', user.id)
          .single();

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
  }, [loading, room?.roomTypeID]);

  useEffect(() => {
    setBookingData(prev => ({
      ...prev,
      roomId: searchParams.get('roomId') || '',
      checkIn: searchParams.get('startDate') || '',
      checkOut: searchParams.get('endDate') || '',
      // Optionally update adults/children if you want to sync those too
    }));
    setPropertyId(searchParams.get('propertyId') || '');
  }, [searchParams]);

  const numberOfNights = bookingData.checkIn && bookingData.checkOut && room
    ? differenceInDays(parseISO(bookingData.checkOut), parseISO(bookingData.checkIn))
    : 0;
  const totalPrice = price !== null && numberOfNights > 0 ? price : 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage('');
    setLoadingMessage('Processing your booking...');

    try {
      if (!room) {
        throw new Error('Invalid room selection');
      }
      if (numberOfNights <= 0) {
        throw new Error('Invalid date selection');
      }
      if (bookingData.adults > room.maxGuests) {
        throw new Error(`Maximum ${room.maxGuests} guests allowed for this room`);
      }
      // Prepare Cloudbeds booking payload
      const bookingPayload = {
        propertyId,
        roomTypeId: bookingData.roomId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        numberOfGuests: bookingData.adults + bookingData.children,
        guestFirstName: bookingData.firstName,
        guestLastName: bookingData.lastName,
        guestEmail: bookingData.email,
        totalPrice,
        nights: numberOfNights,
        // Add more fields as needed for Cloudbeds
      };
      console.log('Prepared Cloudbeds booking payload:', bookingPayload);

      // Handle guest booking (no account)
      if (!user && !bookingData.createAccount) {
        setLoadingMessage('Processing guest booking...');
        
        // For guest bookings, we don't store in database
        // Instead, we just redirect to confirmation with the booking details
        const bookingId = `guest_${Date.now()}`;
        const searchParams = new URLSearchParams({
          bookingId,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          firstName: bookingData.firstName,
          lastName: bookingData.lastName,
          email: bookingData.email,
          totalPrice: totalPrice.toString(),
          roomId: bookingData.roomId,
          guests: (bookingData.adults + bookingData.children).toString()
        });

        setSuccessMessage('Booking successful! Redirecting to confirmation...');
        setTimeout(() => {
          router.push(`/confirmation?${searchParams.toString()}`);
        }, 1500);
        return;
      }

      // Handle booking with account creation
      if (!user && bookingData.createAccount) {
        setLoadingMessage('Creating your account...');
        // Validate password
        if (bookingData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        // Create new user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: bookingData.email,
          password: bookingData.password,
          options: {
            data: {
              first_name: bookingData.firstName,
              last_name: bookingData.lastName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (signUpError) {
          console.error('Signup error:', signUpError);
          throw new Error(signUpError.message);
        }
        if (!authData.user) {
          throw new Error('Failed to create account');
        }
        console.log('Account created with ID:', authData.user.id);
        setLoadingMessage('Creating your booking...');
        // Assume cloudbedsBookingId is returned from Cloudbeds API after booking creation
        const cloudbedsBookingId = 'mock_cloudbeds_' + Date.now(); // Replace with real ID from Cloudbeds
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .insert([{
            cloudbeds_res_id: cloudbedsBookingId,
            user_id: authData.user.id,
            cloudbeds_property_id: propertyId
          }])
          .select()
          .single();
        if (bookingError) {
          console.error('New user booking error:', bookingError);
          throw new Error(bookingError.message);
        }
        setSuccessMessage('Account and booking created successfully! Redirecting to confirmation...');
        setTimeout(() => {
          router.push(`/confirmation?bookingId=${booking.id}`);
        }, 1500);
        return;
      }

      // Handle booking for existing user
      if (user) {
        setLoadingMessage('Creating your booking...');
        // Assume cloudbedsBookingId is returned from Cloudbeds API after booking creation
        const cloudbedsBookingId = 'mock_cloudbeds_' + Date.now(); // Replace with real ID from Cloudbeds
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .insert([{
            cloudbeds_res_id: cloudbedsBookingId,
            user_id: user.id,
            cloudbeds_property_id: propertyId
          }])
          .select()
          .single();
        if (bookingError) {
          console.error('Existing user booking error:', bookingError);
          throw new Error(bookingError.message);
        }
        setSuccessMessage('Booking successful! Redirecting to confirmation...');
        setTimeout(() => {
          router.push(`/confirmation?bookingId=${booking.id}`);
        }, 1500);
      }
    } catch (error: Error | unknown) {
      handleError(error);
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Complete Your Booking</h1>
            <Button 
              variant="outline"
              onClick={() => {
                const params = new URLSearchParams();
                params.set('location', 'kuala-lumpur');  // Default location
                params.set('startDate', bookingData.checkIn);
                params.set('endDate', bookingData.checkOut);
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

                  <div>
                    <label className="block text-sm font-medium mb-1">Adults</label>
                    <Input
                      type="number"
                      required
                      value={bookingData.adults}
                      onChange={(e) => setBookingData(prev => ({ ...prev, adults: Number(e.target.value) }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Children</label>
                    <Input
                      type="number"
                      value={bookingData.children}
                      onChange={(e) => setBookingData(prev => ({ ...prev, children: Number(e.target.value) }))}
                    />
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

                  <Button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full h-12"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      'Confirm Booking'
                    )}
                  </Button>

                  {!user && (
                    <p className="text-sm text-gray-500 text-center mt-4">
                      Want to save your booking details?{' '}
                      <Link href={`/auth/sign-in?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`} className="text-blue-600 hover:underline">
                        Sign in
                      </Link>
                      {' '}or{' '}
                      <Link href={`/auth/sign-up?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`} className="text-blue-600 hover:underline">
                        create an account
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
                      alt={room.roomTypeName}
                      width={400}
                      height={300}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>

                <h3 className="font-medium mb-2">{room ? room.roomTypeName : ''}</h3>
                <p className="text-sm text-gray-600 mb-4">{room ? room.roomTypeDescription : ''}</p>

                <div className="space-y-2 text-sm">
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
                    <span className="font-medium">${room ? room.price : 'N/A'}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">{price !== null ? `$${totalPrice}` : 'N/A'}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
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
  );
} 