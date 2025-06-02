'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PropertyInformation } from '@/components/property-information';
import { Card } from "@/components/ui/card";

interface CartItem {
  roomTypeID: string;
  roomName: string;
  price: number;
  quantity: number;
  maxAvailable: number;
  propertyId: string;
  propertyName: string;
  rateId?: string;
  adults: number;
  children: number;
}
interface BookingCart {
  cart: CartItem[];
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  propertyId: string;
  city?: string;
}
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
interface BookingPayload {
  bookingData: BookingFormData;
  bookingCart: BookingCart;
  propertyId: string;
  userId?: string;
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<BookingPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingToken, setBookingToken] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('bookingToken');
    setBookingToken(token);
    if (!token) {
      setLoading(false);
      setError('Missing booking token.');
      console.error('[ConfirmationPage] Missing booking token');
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[ConfirmationPage] Fetching booking session for token:', token);
        const res = await fetch(`/api/booking-session?token=${token}`);
        const data = await res.json();
        if (!data.success || !data.bookingData) {
          setError('Booking not found. Please try your booking again.');
          setLoading(false);
          console.error('[ConfirmationPage] Booking not found for token:', token);
          return;
        }
        setBooking(data.bookingData as BookingPayload);
        console.log('[ConfirmationPage] Booking payload:', data.bookingData);
      } catch (err) {
        setError('Booking not found. Please try your booking again.');
        console.error('[ConfirmationPage] Error fetching booking session:', err);
      } finally {
        setLoading(false);
        console.log('[ConfirmationPage] Loading finished');
      }
    })();
  }, [searchParams]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }
  if (!booking) {
    return <div className="min-h-screen flex items-center justify-center">No booking found.</div>;
  }

  // Extract useful info
  const guestName = `${booking.bookingData?.firstName} ${booking.bookingData?.lastName}`;
  const guestEmail = booking.bookingData?.email;
  const checkIn = booking.bookingCart?.checkIn;
  const checkOut = booking.bookingCart?.checkOut;
  const propertyName = booking.bookingCart?.cart?.[0]?.propertyName || booking.bookingCart?.propertyId;
  const roomType = booking.bookingCart?.cart?.[0]?.roomName;
  const totalPrice = booking.bookingCart?.cart?.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <Card className="bg-white rounded-2xl shadow-lg p-6 w-full mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-green-600 text-left">Booking Confirmed!</h2>
          <div className="mb-4 text-left text-base md:text-lg">
            Thank you, {booking.bookingData?.firstName}! Your booking is confirmed.<br />
            <span className="text-sm text-gray-500">You&apos;ll receive a confirmation email shortly.</span>
          </div>

          {/* Booking Reference */}
          {bookingToken && (
            <div className="mb-4 text-sm text-gray-500 text-left">Booking Reference: <span className="font-mono text-gray-700">{bookingToken}</span></div>
          )}

          {/* Details Grid - Multi-apartment support */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-left mb-4">
            <div><span className="font-medium text-gray-600">Guest:</span> <span className="font-semibold">{guestName}</span></div>
            <div><span className="font-medium text-gray-600">Email:</span> <span className="font-semibold">{guestEmail}</span></div>
            <div><span className="font-medium text-gray-600">Property:</span> <span className="font-semibold">{propertyName}</span></div>
            <div><span className="font-medium text-gray-600">Check-in:</span> <span className="font-semibold">{checkIn}</span></div>
            <div><span className="font-medium text-gray-600">Check-out:</span> <span className="font-semibold">{checkOut}</span></div>
            {Array.isArray(booking.bookingCart?.cart) && booking.bookingCart.cart.length > 1 ? (
              <div className="md:col-span-2 mt-2">
                <div className="font-medium text-gray-600 mb-1">Apartments/Rooms Booked:</div>
                <ul className="list-disc pl-5 space-y-1">
                  {booking.bookingCart.cart.map((item, idx) => (
                    <li key={item.roomTypeID + idx} className="text-sm text-gray-800">
                      <span className="font-semibold">{item.quantity} x {item.roomName}</span> (MYR {(item.price * item.quantity).toFixed(2)})
                      <span className="ml-2 text-xs text-gray-600">[Adults: {item.adults}, Children: {item.children}]</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <span className="font-medium text-gray-600">Room:</span> <span className="font-semibold">{roomType}</span>
                {booking.bookingCart.cart && booking.bookingCart.cart[0] && (
                  <span className="ml-2 text-xs text-gray-600">[Adults: {booking.bookingCart.cart[0].adults}, Children: {booking.bookingCart.cart[0].children}]</span>
                )}
              </div>
            )}
            {typeof totalPrice === 'number' && (
              <div><span className="font-medium text-gray-600">Total:</span> <span className="font-semibold">MYR {totalPrice.toFixed(2)}</span></div>
            )}
          </div>

          {/* Next Steps / Help */}
          <div className="mt-4 text-sm text-gray-500 text-left">
            Need help? Contact us at <a href="mailto:info@soulasia.com.my" className="text-blue-600 underline">info@soulasia.com.my</a>
          </div>
        </Card>
        {/* Property Information Section, aligned with Card */}
        {booking.bookingCart?.propertyId && (
          <div className="w-full mt-8 mx-auto">
            <PropertyInformation propertyId={booking.bookingCart.propertyId} />
          </div>
        )}
      </div>
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