'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { format, parseISO, differenceInDays } from "date-fns";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from 'next/link';

interface BookingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  roomId: string;
  numberOfGuests: number;
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
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    checkIn: searchParams.get('startDate') || '',
    checkOut: searchParams.get('endDate') || '',
    roomId: searchParams.get('roomId') || '',
    numberOfGuests: 2
  });

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
          phone: ''  // Remove phone as it's not in users table
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!room) {
        throw new Error('Invalid room selection');
      }

      if (numberOfNights <= 0) {
        throw new Error('Invalid date selection');
      }

      if (bookingData.numberOfGuests > room.maxGuests) {
        throw new Error(`Maximum ${room.maxGuests} guests allowed for this room`);
      }

      let bookingId;

      if (user) {
        // Save booking to Supabase for authenticated users
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .insert([
            {
              user_id: user.id,
              room_id: bookingData.roomId,
              check_in: bookingData.checkIn,
              check_out: bookingData.checkOut,
              number_of_guests: bookingData.numberOfGuests,
              total_price: totalPrice,
              status: 'confirmed'
            }
          ])
          .select()
          .single();

        if (bookingError) throw bookingError;
        bookingId = booking.id;

        // Update user data if needed
        const { data: userData } = await supabase
          .from('users')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (!userData?.first_name || !userData?.last_name) {
          await supabase
            .from('users')
            .update({
              first_name: bookingData.firstName,
              last_name: bookingData.lastName
            })
            .eq('id', user.id);
        }
      } else {
        // For guest bookings, we'll keep the existing mock functionality
        // In a real application, you would implement guest booking logic here
        await new Promise(resolve => setTimeout(resolve, 1500));
        bookingId = `guest_booking_${Date.now()}`;
      }
      
      // Redirect to confirmation page
      router.push(`/confirmation?bookingId=${bookingId}`);
    } catch (error: any) {
      console.error('Booking failed:', error);
      setError(error.message || 'Failed to process your booking. Please try again.');
      setSubmitting(false);
    }
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
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
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
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <Input
                      type="tel"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

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