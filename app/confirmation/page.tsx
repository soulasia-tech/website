'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PropertyInformation } from '@/components/property-information';
import { Card } from "@/components/ui/card";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingToken = searchParams.get('bookingToken');
  // Define explicit types for booking and cloudbedsBreakdown
  type CartItem = {
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
    roomIDs: string[];
  };
  type BookingCart = {
  cart: CartItem[];
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  propertyId: string;
  city?: string;
  };
  type BookingFormData = {
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
  };
  type BookingSession = {
  bookingData: BookingFormData;
  bookingCart: BookingCart;
  propertyId: string;
  userId?: string;
    cloudbedsResId?: string;
    cloudbedsBreakdown?: CloudbedsBreakdown;
  };
  type CloudbedsBreakdown = {
    grandTotal?: number;
    total?: number;
    grand_total?: number;
    subtotal?: number;
    sst?: number;
    tax?: number;
    [key: string]: unknown;
  };

  const [booking, setBooking] = useState<BookingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [reservationStatus, setReservationStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let stopped = false;
    async function fetchBooking() {
      if (!bookingToken) {
        setLoading(false);
        setError('Missing booking token.');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/booking-session?token=${bookingToken}`);
        const data = await res.json();
        setBooking(data.bookingData);
        setPaymentStatus(data.payment_status || null);
        setReservationStatus(data.reservation_status || null);
        setErrorMessage(data.error_message || null);
        // Fetch Cloudbeds reservation details if available
        if (data.bookingData?.cloudbedsResId && data.bookingData?.propertyId) {
          try {
            const cbRes = await fetch(`/api/fetch-cloudbeds-reservation?propertyId=${data.bookingData.propertyId}&reservationId=${data.bookingData.cloudbedsResId}`);
            const cbData = await cbRes.json();
            if (cbData.success && cbData.data) {
              // setCloudbedsBreakdown(cbData.data); // This line was removed
            }
          } catch {
            // Ignore Cloudbeds fetch errors for now
          }
        }
        // If status is not final, schedule next poll
        if (!stopped && data.payment_status !== 'succeeded' && data.payment_status !== 'failed' && data.reservation_status !== 'succeeded' && data.reservation_status !== 'failed') {
          interval = setTimeout(fetchBooking, 2000);
        }
      } catch {
        setError('Booking not found. Please try your booking again.');
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
    return () => {
      stopped = true;
      if (interval) clearTimeout(interval);
    };
  }, [bookingToken]);

  // Remove the separate Loading state; always show processing until final status
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }
  // If booking is not loaded yet, show nothing (no message or spinner)
  if (!booking) {
    return null;
  }
  if (paymentStatus === 'failed' || reservationStatus === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">There was a problem with your payment or reservation</h2>
          <div className="mb-2 text-base text-gray-700">Reservation was not complete. Please try again later.</div>
          {errorMessage && <div className="mb-2 text-sm text-red-500">{errorMessage}</div>}
          <div className="mt-4 text-sm text-gray-500">Need help? Contact us at <a href="mailto:info@soulasia.com.my" className="text-blue-600 underline">info@soulasia.com.my</a></div>
        </Card>
      </div>
    );
  }
  if (loading || paymentStatus !== 'succeeded' || reservationStatus !== 'succeeded') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <div className="text-lg font-medium text-gray-700 text-center max-w-md">
          Processing your booking.<br />It might take a few seconds.<br />Don&apos;t close this page.
        </div>
      </div>
    );
  }

  // Extract useful info
  const guestName = `${booking.bookingData?.firstName} ${booking.bookingData?.lastName}`;
  const guestEmail = booking.bookingData?.email;
  const checkIn = booking.bookingCart?.checkIn;
  const checkOut = booking.bookingCart?.checkOut;
  const propertyName = booking.bookingCart?.cart?.[0]?.propertyName || booking.bookingCart?.propertyId;

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
            <div>
              <div><span className="font-medium text-gray-600">Check-in:</span> <span className="font-semibold">{checkIn}</span></div>
              <div><span className="font-medium text-gray-600">Check-out:</span> <span className="font-semibold">{checkOut}</span></div>
            </div>
            {/* Room/rooms breakdown removed as per user request */}
            {/* Remove price breakdown section entirely */}
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