'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from "@/components/ui/card";
import { User } from '@supabase/supabase-js';
import { PropertyInformation } from '@/components/property-information';

interface Booking {
  id: string;
  check_in: string;
  check_out: string;
  total_price: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  user_id?: string;
  guest_first_name?: string;
  guest_last_name?: string;
  guest_email?: string;
  number_of_guests: number;
  room_id: string;
  status: string;
  property_id?: string;
  cloudbeds_property_id?: string;
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bookingToken = searchParams.get('bookingToken');
    if (!bookingToken) {
      setLoading(false);
      return;
    }
    // Try to retrieve booking data from localStorage
    const localData = typeof window !== 'undefined' ? localStorage.getItem(`booking_${bookingToken}`) : null;
    if (!localData) {
      setError('Booking data not found. Please try your booking again.');
      setLoading(false);
      return;
    }
    const bookingPayload = JSON.parse(localData);
    // Call API to create reservation in Cloudbeds
    (async () => {
      try {
        setLoading(true);
        setError(null);
        // Prepare FormData for API
        const fd = new FormData();
        fd.append('propertyID', bookingPayload.propertyId);
        fd.append('startDate', bookingPayload.bookingData.checkIn);
        fd.append('endDate', bookingPayload.bookingData.checkOut);
        fd.append('guestFirstName', bookingPayload.bookingData.firstName);
        fd.append('guestLastName', bookingPayload.bookingData.lastName);
        fd.append('guestEmail', bookingPayload.bookingData.email);
        fd.append('guestCountry', bookingPayload.bookingData.country);
        fd.append('guestZip', '00000');
        fd.append('paymentMethod', 'credit_card'); // Mark as paid
        fd.append('sendEmailConfirmation', 'true');
        fd.append('rooms', JSON.stringify([
          {
            roomTypeID: bookingPayload.bookingData.roomId,
            roomID: bookingPayload.bookingData.roomId,
            quantity: "1",
            roomRateID: bookingPayload.selectedRateID
          }
        ]));
        fd.append('adults', JSON.stringify([
          {
            roomTypeID: bookingPayload.bookingData.roomId,
            roomID: bookingPayload.bookingData.roomId,
            quantity: String(bookingPayload.bookingData.guests)
          }
        ]));
        fd.append('children', JSON.stringify([
          {
            roomTypeID: bookingPayload.bookingData.roomId,
            roomID: bookingPayload.bookingData.roomId,
            quantity: "0"
          }
        ]));
        // Add optional fields
        if (bookingPayload.bookingData.phone) fd.append('guestPhone', bookingPayload.bookingData.phone);
        if (bookingPayload.bookingData.estimatedArrivalTime) fd.append('estimatedArrivalTime', bookingPayload.bookingData.estimatedArrivalTime);
        // Call API
        const res = await fetch('/api/create-cloudbeds-reservation', {
          method: 'POST',
          body: fd,
        });
        const resData = await res.json();
        if (!resData.success || !resData.data?.reservationID) {
          throw new Error(resData.message || 'Failed to create reservation in Cloudbeds');
        }
        // --- Add payment to reservation ---
        const paymentFd = new FormData();
        paymentFd.append('propertyID', bookingPayload.propertyId);
        paymentFd.append('addPayment', 'true');
        paymentFd.append('amount', bookingPayload.totalPrice.toString());
        paymentFd.append('reservationID', resData.data.reservationID);
        // Call the same API to add payment
        const paymentRes = await fetch('/api/create-cloudbeds-reservation', {
          method: 'POST',
          body: paymentFd,
        });
        const paymentData = await paymentRes.json();
        if (paymentData.paymentError) {
          throw new Error('Reservation created, but failed to attach payment: ' + paymentData.paymentError);
        }
        // Set booking info for confirmation
        setBooking({
          id: resData.data.reservationID,
          check_in: bookingPayload.bookingData.checkIn,
          check_out: bookingPayload.bookingData.checkOut,
          total_price: bookingPayload.totalPrice,
          guest_first_name: bookingPayload.bookingData.firstName,
          guest_last_name: bookingPayload.bookingData.lastName,
          guest_email: bookingPayload.bookingData.email,
          number_of_guests: bookingPayload.bookingData.guests,
          room_id: bookingPayload.bookingData.roomId,
          status: 'confirmed',
          property_id: bookingPayload.propertyId,
        });
        // Clean up localStorage
        localStorage.removeItem(`booking_${bookingToken}`);
      } catch (err: any) {
        setError(err.message || 'Failed to create reservation.');
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams]);

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (!bookingId) {
          // If no bookingId, we'll just show a generic success message
          setLoading(false);
          return;
        }

        // If it's a guest booking (starts with 'guest_'), use URL params
        if (bookingId.startsWith('guest_')) {
          setBooking({
            id: bookingId,
            check_in: searchParams.get('checkIn') || '',
            check_out: searchParams.get('checkOut') || '',
            total_price: parseFloat(searchParams.get('totalPrice') || '0'),
            guest_first_name: searchParams.get('firstName') || '',
            guest_last_name: searchParams.get('lastName') || '',
            guest_email: searchParams.get('email') || '',
            number_of_guests: parseInt(searchParams.get('guests') || '0'),
            room_id: searchParams.get('roomId') || '',
            status: 'confirmed'
          });
        } else {
          // Get booking from database for registered users
          const { data: bookingData, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();

          if (error) {
            console.error('Error fetching booking:', error);
            return;
          }

          setBooking(bookingData);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Card className="bg-white rounded-xl p-6 shadow-sm">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Card className="bg-white rounded-xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Booking Error</h1>
            <p className="mb-6">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  // Show generic success message if no booking details
  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Card className="bg-white rounded-xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-green-600 mb-4">Booking Successful!</h1>
            <p className="mb-6">Your booking has been confirmed. You will receive a confirmation email shortly.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Card className="bg-white rounded-xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold mb-6">Booking Confirmed!</h1>
          
          <div className="space-y-4">
            <p>Your booking reference: <span className="font-mono">{booking.id}</span></p>
            <p>Check-in: {new Date(booking.check_in).toLocaleDateString()}</p>
            <p>Check-out: {new Date(booking.check_out).toLocaleDateString()}</p>
            <p>Total price: MYR {booking.total_price?.toFixed(2)}</p>
            
            {/* Show guest info for guest bookings */}
            {!booking.user_id && (
              <div className="pt-4 border-t">
                <p className="font-medium mb-2">Guest Information:</p>
                <p>{booking.guest_first_name} {booking.guest_last_name}</p>
                <p>{booking.guest_email}</p>
              </div>
            )}
          </div>

          {/* Show verification message if account was just created */}
          {!user && booking.user_id && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Check Your Email</h2>
              <p>Please check your email to verify your account. Once verified, you can sign in to manage your bookings.</p>
            </div>
          )}
        </Card>
      </div>
      {/* Property Information Section (added at the bottom) */}
      {(() => {
        let propertyId = booking?.property_id || booking?.cloudbeds_property_id;
        if (!propertyId && typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          propertyId = params.get('propertyId') || '';
        }
        propertyId = String(propertyId);
        return propertyId ? (
          <div className="mt-12">
            <PropertyInformation propertyId={propertyId} />
          </div>
        ) : null;
      })()}
    </div>
  );
}

// Wrap the main component with Suspense
export default function ConfirmationPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <Card className="bg-white rounded-xl p-6 shadow-sm">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          </div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
} 