'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const [bookingDetails, setBookingDetails] = useState({
    bookingId: searchParams.get('bookingId'),
    status: '',
    checkIn: '',
    checkOut: '',
    roomType: '',
    totalPrice: 0,
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
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
          setBookingDetails(prev => ({
            ...prev,
            status: 'confirmed',
            checkIn: searchParams.get('checkIn') || '',
            checkOut: searchParams.get('checkOut') || '',
            roomType: searchParams.get('roomType') || '',
            totalPrice: Number(searchParams.get('totalPrice')) || 0,
            firstName: searchParams.get('firstName') || '',
            lastName: searchParams.get('lastName') || '',
            email: searchParams.get('email') || '',
            phone: searchParams.get('phone') || ''
          }));
          setLoading(false);
          return;
        }

        // Get user session
        const { data: { session } } = await supabase.auth.getSession();

        // Fetch booking data
        const { data: booking, error: bookingError } = await supabase
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

        if (!booking) {
          throw new Error('Booking not found');
        }

        // Extract user data safely
        const userData = Array.isArray(booking.user) ? booking.user[0] : booking.user;
        const userEmail = userData?.email || '';
        const userFirstName = userData?.first_name || '';
        const userLastName = userData?.last_name || '';

        setBookingDetails({
          bookingId: booking.id,
          status: booking.status || 'pending',
          checkIn: booking.check_in || '',
          checkOut: booking.check_out || '',
          roomType: booking.room_id || '',
          totalPrice: booking.total_price || 0,
          firstName: userFirstName,
          lastName: userLastName,
          email: userEmail || session?.user?.email || '',
          phone: ''
        });
      } catch (error: any) {
        console.error('Error fetching booking details:', error);
        setError(error.message || 'Failed to load booking details');
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
          <p className="text-green-600">Your booking has been {bookingDetails.status}</p>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Booking Details</h2>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-gray-600">Booking ID:</p>
              <p>{bookingDetails.bookingId}</p>
              <p className="text-gray-600">Check-in:</p>
              <p>{bookingDetails.checkIn}</p>
              <p className="text-gray-600">Check-out:</p>
              <p>{bookingDetails.checkOut}</p>
              <p className="text-gray-600">Room Type:</p>
              <p>{bookingDetails.roomType}</p>
              <p className="text-gray-600">Total Price:</p>
              <p>${bookingDetails.totalPrice}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Guest Information</h2>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-gray-600">Name:</p>
              <p>{bookingDetails.firstName} {bookingDetails.lastName}</p>
              <p className="text-gray-600">Email:</p>
              <p>{bookingDetails.email}</p>
              {bookingDetails.phone && (
                <>
                  <p className="text-gray-600">Phone:</p>
                  <p>{bookingDetails.phone}</p>
                </>
              )}
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