'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface BookingDetails {
  id: string;
  created_at: string;
  user_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  number_of_guests: number;
  total_price: number;
  status: string;
  room?: {
    name: string;
    description: string;
    price_per_night: number;
  };
}

interface UserInfo {
  email: string;
  firstName: string;
  lastName: string;
}

// Loading component for Suspense fallback
function LoadingState() {
  return (
    <div className="container mx-auto p-4">
      <Card className="p-6 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Content component that uses useSearchParams
function ConfirmationContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    email: '',
    firstName: '',
    lastName: ''
  });

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const bookingId = searchParams.get('bookingId');
        
        if (!bookingId) {
          throw new Error('No booking ID provided');
        }

        // Check if it's a guest booking
        if (bookingId.startsWith('guest_')) {
          setBooking({
            id: bookingId,
            created_at: '',
            user_id: '',
            room_id: '',
            check_in: searchParams.get('checkIn') || '',
            check_out: searchParams.get('checkOut') || '',
            number_of_guests: 0,
            total_price: Number(searchParams.get('totalPrice')) || 0,
            status: 'confirmed',
            room: {
              name: searchParams.get('roomType') || '',
              description: '',
              price_per_night: 0
            }
          });
          setLoading(false);
          return;
        }

        // Get user session
        await supabase.auth.getSession();

        // Fetch booking data
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            id,
            status,
            check_in,
            check_out,
            room_id,
            total_price,
            user:user_id (
              first_name,
              last_name,
              email
            )
          `)
          .eq('id', bookingId)
          .maybeSingle();

        if (bookingError) {
          console.error('Error fetching booking:', bookingError);
          throw bookingError;
        }

        if (!bookingData) {
          throw new Error('Booking not found');
        }

        // Extract user data safely
        const userData = Array.isArray(bookingData.user) ? bookingData.user[0] : bookingData.user;
        
        setUserInfo({
          email: userData?.email || '',
          firstName: userData?.first_name || '',
          lastName: userData?.last_name || ''
        });

        setBooking({
          id: bookingData.id,
          created_at: '',
          user_id: '',
          room_id: bookingData.room_id || '',
          check_in: bookingData.check_in || '',
          check_out: bookingData.check_out || '',
          number_of_guests: 0,
          total_price: bookingData.total_price || 0,
          status: bookingData.status || 'pending',
          room: {
            name: bookingData.room_id || '',
            description: '',
            price_per_night: 0
          }
        });
      } catch (error) {
        console.error('Error fetching booking details:', error);
        setError(error instanceof Error ? error.message : 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [searchParams, supabase]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Loading booking confirmation...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="p-6 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Error Loading Booking</h1>
            <p className="text-red-600">{error}</p>
          </div>
          <div className="text-center mt-6">
            <Link href="/">
              <Button variant="outline">Return to Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Booking Confirmation</h1>
          <p className="text-green-600">Your booking has been {booking?.status}</p>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Booking Details</h2>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-gray-600">Booking ID:</p>
              <p>{booking?.id}</p>
              <p className="text-gray-600">Check-in:</p>
              <p>{booking?.check_in}</p>
              <p className="text-gray-600">Check-out:</p>
              <p>{booking?.check_out}</p>
              <p className="text-gray-600">Room Type:</p>
              <p>{booking?.room?.name}</p>
              <p className="text-gray-600">Total Price:</p>
              <p>${booking?.total_price}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Guest Information</h2>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-gray-600">Name:</p>
              <p>{userInfo.firstName} {userInfo.lastName}</p>
              <p className="text-gray-600">Email:</p>
              <p>{userInfo.email}</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/">
            <Button variant="outline">Return to Home</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

// Main page component
export default function ConfirmationPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ConfirmationContent />
    </Suspense>
  );
} 