'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from "next/link";
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

  useEffect(() => {
    const bookingToken = searchParams.get('bookingToken');
    if (!bookingToken) {
      setLoading(false);
      setError('Missing booking token.');
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/booking-session?token=${bookingToken}`);
        const data = await res.json();
        if (!data.success || !data.bookingData) {
          setError('Booking not found. Please try your booking again.');
          setLoading(false);
          return;
        }
        setBooking(data.bookingData as BookingPayload);
      } catch {
        setError('Booking not found. Please try your booking again.');
      } finally {
        setLoading(false);
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
  // Render booking summary and status
  return (
    <div className="min-h-screen flex items-center justify-center flex-col">
      <Card className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-green-600">Booking Confirmed!</h2>
        <div className="mb-4">Thank you for your reservation.</div>
        <div className="mb-2">Name: {booking.bookingData?.firstName} {booking.bookingData?.lastName}</div>
        <div className="mb-2">Email: {booking.bookingData?.email}</div>
        <div className="mb-2">Check-in: {booking.bookingCart?.checkIn}</div>
        <div className="mb-2">Check-out: {booking.bookingCart?.checkOut}</div>
        <div className="mb-2">Guests: {booking.bookingCart?.adults} adults, {booking.bookingCart?.children} children</div>
        <div className="mb-2">Property: {booking.bookingCart?.propertyId}</div>
        <Link href="/" className="mt-4 inline-block text-blue-600 underline">Back to Home</Link>
      </Card>
      {/* Property Information Section, aligned with Card */}
      {booking.bookingCart?.propertyId && (
        <div className="max-w-md w-full mt-8 mx-auto">
          <PropertyInformation propertyId={booking.bookingCart.propertyId} />
        </div>
      )}
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