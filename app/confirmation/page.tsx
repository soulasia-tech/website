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
  const [cloudbedsTotal, setCloudbedsTotal] = useState<number | null>(null);
  const [cloudbedsBreakdown, setCloudbedsBreakdown] = useState<CloudbedsBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [reservationStatus, setReservationStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingToken) {
        setLoading(false);
        setError('Missing booking token.');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Fetch booking session as before
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
              setCloudbedsTotal(cbData.data.grandTotal || cbData.data.total || cbData.data.grand_total);
              setCloudbedsBreakdown(cbData.data);
            }
          } catch {
            // Ignore Cloudbeds fetch errors for now
          }
        }
      } catch {
        setError('Booking not found. Please try your booking again.');
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingToken]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }
  if (!booking) {
    return <div className="min-h-screen flex items-center justify-center">Booking not found.</div>;
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
  if (paymentStatus !== 'succeeded' || reservationStatus !== 'succeeded') {
    return <div className="min-h-screen flex items-center justify-center">Processing your booking...</div>;
  }

  // Extract useful info
  const guestName = `${booking.bookingData?.firstName} ${booking.bookingData?.lastName}`;
  const guestEmail = booking.bookingData?.email;
  const checkIn = booking.bookingCart?.checkIn;
  const checkOut = booking.bookingCart?.checkOut;
  const propertyName = booking.bookingCart?.cart?.[0]?.propertyName || booking.bookingCart?.propertyId;
  const totalPrice = typeof cloudbedsTotal === 'number' ? cloudbedsTotal : (booking?.bookingCart?.cart?.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0) || 0);

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
                      <span className="font-semibold">{item.quantity} x Room {idx + 1}</span> (MYR {(item.price * item.quantity).toFixed(2)})
                      <span className="ml-2 text-xs text-gray-600">[Adults: {item.adults}, Children: {item.children}]</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <span className="font-medium text-gray-600">Room:</span> <span className="font-semibold">Room 1</span>
                {booking.bookingCart.cart && booking.bookingCart.cart[0] && (
                  <span className="ml-2 text-xs text-gray-600">[Adults: {booking.bookingCart.cart[0].adults}, Children: {booking.bookingCart.cart[0].children}]</span>
                )}
              </div>
            )}
            {typeof totalPrice === 'number' && (
              <div><span className="font-medium text-gray-600">Total:</span> <span className="font-semibold">MYR {totalPrice.toFixed(2)}</span></div>
            )}
            {/* Always show breakdown if available */}
            {cloudbedsBreakdown && (
              <div className="md:col-span-2 mt-2 text-xs text-gray-600">
                <div>Subtotal: MYR {cloudbedsBreakdown.subtotal !== undefined ? cloudbedsBreakdown.subtotal : '-'}</div>
                <div>SST/Tax: MYR {cloudbedsBreakdown.sst !== undefined ? cloudbedsBreakdown.sst : (cloudbedsBreakdown.tax !== undefined ? cloudbedsBreakdown.tax : '-')}</div>
                <div>Grand Total: MYR {cloudbedsBreakdown.grandTotal !== undefined ? cloudbedsBreakdown.grandTotal : (cloudbedsBreakdown.total !== undefined ? cloudbedsBreakdown.total : '-')}</div>
                <div className="text-[10px] text-gray-400 mt-1">This is the official total from Cloudbeds, including all taxes and fees.</div>
              </div>
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