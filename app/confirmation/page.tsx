'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from "@/components/ui/card";
import Link from "next/link";
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
        fd.append('propertyID', bookingPayload.bookingCart.propertyId);
        fd.append('startDate', bookingPayload.bookingCart.checkIn);
        fd.append('endDate', bookingPayload.bookingCart.checkOut);
        fd.append('guestFirstName', bookingPayload.bookingData.firstName);
        fd.append('guestLastName', bookingPayload.bookingData.lastName);
        fd.append('guestEmail', bookingPayload.bookingData.email);
        fd.append('guestCountry', bookingPayload.bookingData.country || 'MY');
        fd.append('guestZip', '00000');
        fd.append('paymentMethod', 'credit_card'); // Mark as paid
        fd.append('sendEmailConfirmation', 'true');

        // Add type for cart items
        type CartItem = { roomTypeID: string; quantity: number };
        // Build rooms, adults, and children arrays from cart
        const roomsArr = bookingPayload.bookingCart.cart.map((item: CartItem) => ({
          roomTypeID: item.roomTypeID,
          roomID: item.roomTypeID, // If you have real room IDs, use them here
          quantity: String(item.quantity),
          // roomRateID: item.roomRateID, // Add if available in cart
        }));
        fd.append('rooms', JSON.stringify(roomsArr));

        // For now, assume all guests are adults, children = 0
        const adultsArr = bookingPayload.bookingCart.cart.map((item: CartItem) => ({
          roomTypeID: item.roomTypeID,
          roomID: item.roomTypeID, // If you have real room IDs, use them here
          quantity: String(item.quantity),
        }));
        fd.append('adults', JSON.stringify(adultsArr));

        const childrenArr = bookingPayload.bookingCart.cart.map((item: CartItem) => ({
          roomTypeID: item.roomTypeID,
          roomID: item.roomTypeID, // If you have real room IDs, use them here
          quantity: "0",
        }));
        fd.append('children', JSON.stringify(childrenArr));

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
        paymentFd.append('propertyID', bookingPayload.bookingCart.propertyId);
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
          check_in: bookingPayload.bookingCart.checkIn,
          check_out: bookingPayload.bookingCart.checkOut,
          total_price: bookingPayload.totalPrice,
          guest_first_name: bookingPayload.bookingData.firstName,
          guest_last_name: bookingPayload.bookingData.lastName,
          guest_email: bookingPayload.bookingData.email,
          number_of_guests: bookingPayload.bookingCart.cart.reduce((total: number, item: CartItem) => total + item.quantity, 0),
          room_id: bookingPayload.bookingCart.cart[0].roomTypeID,
          status: 'confirmed',
          property_id: bookingPayload.bookingCart.propertyId,
        });
        // If user is logged in, insert booking into Supabase
        let userIdToUse = null;
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          userIdToUse = data.user.id;
        } else if (bookingPayload.userId) {
          userIdToUse = bookingPayload.userId;
        }
        if (userIdToUse) {
          const insertPayload = {
            user_id: userIdToUse,
            cloudbeds_res_id: resData.data.reservationID,
            cloudbeds_property_id: bookingPayload.bookingCart.propertyId,
          };
          console.log('Inserting booking:', insertPayload);
          const { error: bookingInsertError } = await supabase
            .from('bookings')
            .insert([insertPayload]);
          if (bookingInsertError) {
            console.error('Error saving booking in Supabase:', bookingInsertError);
          }
        }
        // Clean up localStorage
        localStorage.removeItem(`booking_${bookingToken}`);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create reservation.');
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams, supabase]);

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    
    const fetchData = async () => {
      try {
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
    // Use guest name if available in localStorage or searchParams
    let guestName = '';
    if (typeof window !== 'undefined') {
      const bookingToken = searchParams.get('bookingToken');
      if (bookingToken) {
        const localData = localStorage.getItem(`booking_${bookingToken}`);
        if (localData) {
          try {
            const bookingPayload = JSON.parse(localData);
            guestName = bookingPayload.bookingData?.firstName || '';
          } catch {}
        }
      } else {
        guestName = searchParams.get('firstName') || '';
      }
    }
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Card className="bg-white rounded-xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-green-700 mb-4">
              Thank you{guestName ? `, ${guestName}` : ''}! Your booking is confirmed.
            </h1>
            <p className="mb-4 text-gray-700">Loading your booking details…</p>
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="mt-8 space-y-2">
              <p className="text-gray-600">Check your inbox for booking confirmation and further details.</p>
              <p className="text-gray-600">Need help? Contact us at <a href="mailto:info@soulasia.com.my" className="underline">info@soulasia.com.my</a></p>
              <p className="text-gray-600">We are looking forward to welcoming you!</p>
            </div>
            <div className="mt-8">
              <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full transition">Want to plan your next trip? Book now</Link>
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
    // Use guest name if available
    const guestName = searchParams.get('firstName') || '';
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Card className="bg-white rounded-xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-green-700 mb-4">
              Thank you{guestName ? `, ${guestName}` : ''}! Your booking is confirmed.
            </h1>
            <p className="mb-4 text-gray-700">Your booking has been confirmed. You will receive a confirmation email shortly.</p>
            <div className="mt-8 space-y-2">
              <p className="text-gray-600">Check your inbox for booking confirmation and further details.</p>
              <p className="text-gray-600">Need help? Contact us at <a href="mailto:info@soulasia.com.my" className="underline">info@soulasia.com.my</a></p>
              <p className="text-gray-600">We are looking forward to welcoming you!</p>
            </div>
            <div className="mt-8">
              <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full transition">Want to plan your next trip? Book now</Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Card className="bg-white rounded-xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-green-700 mb-6">
            Thank you{booking.guest_first_name ? `, ${booking.guest_first_name}` : ''}! Your booking is confirmed.
          </h1>
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
          <div className="mt-8 space-y-2">
            <p className="text-gray-600">Check your inbox for booking confirmation and further details.</p>
            <p className="text-gray-600">Need help? Contact us at <a href="mailto:info@soulasia.com.my" className="underline">info@soulasia.com.my</a></p>
            <p className="text-gray-600">We are looking forward to welcoming you!</p>
          </div>
          <div className="mt-8">
            <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full transition">Want to plan your next trip? Book now</Link>
          </div>
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
    <>
      <title>Soulasia | Booking Confirmation</title>
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
    </>
  );
} 