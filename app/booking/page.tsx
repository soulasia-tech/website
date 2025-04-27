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

// Mock room data (matching search page)
const mockRooms = {
  room1: {
    id: 'room1',
    name: 'Deluxe KLCC View Suite',
    description: 'Luxurious suite with breathtaking views of the Petronas Twin Towers',
    price: 250,
    maxGuests: 2,
    images: [
      'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0'
    ],
    amenities: ['King bed', 'City view', 'Free WiFi', 'Kitchen']
  },
  room2: {
    id: 'room2',
    name: 'Premium Two-Bedroom Apartment',
    description: 'Spacious apartment perfect for families or extended stays',
    price: 350,
    maxGuests: 4,
    images: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc'
    ],
    amenities: ['2 bedrooms', 'Full kitchen', 'Washer/Dryer', 'Balcony']
  }
};

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  // Get room details
  const room = mockRooms[bookingData.roomId as keyof typeof mockRooms];
  const numberOfNights = bookingData.checkIn && bookingData.checkOut ? 
    differenceInDays(parseISO(bookingData.checkOut), parseISO(bookingData.checkIn)) : 0;
  const totalPrice = room ? room.price * numberOfNights : 0;

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
    // Validate required parameters
    if (!bookingData.roomId || !bookingData.checkIn || !bookingData.checkOut || !room) {
      router.push('/');
      return;
    }
    setLoading(false);
  }, [bookingData.roomId, bookingData.checkIn, bookingData.checkOut, room, router]);

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

      // Prepare base booking data
      const baseBookingData = {
        room_id: bookingData.roomId,
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        number_of_guests: bookingData.adults + bookingData.children,
        total_price: totalPrice,
        status: 'confirmed',
        guest_first_name: bookingData.firstName,
        guest_last_name: bookingData.lastName,
        guest_email: bookingData.email
      };

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
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .insert([{
            ...baseBookingData,
            user_id: authData.user.id
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
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .insert([{
            ...baseBookingData,
            user_id: user.id
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
                  <Image 
                    src={`${room.images[0]}?w=400&h=300&fit=crop`}
                    alt={room.name}
                    width={400}
                    height={300}
                    className="object-cover"
                  />
                </div>

                <h3 className="font-medium mb-2">{room.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{room.description}</p>

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
                    <span className="font-medium">${room.price}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">${totalPrice}</span>
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