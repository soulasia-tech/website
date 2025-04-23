'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClientComponentClient();
  const [bookingDetails, setBookingDetails] = useState({
    bookingId: searchParams.get('bookingId'),
    status: '',
    checkIn: '',
    checkOut: '',
    roomType: '',
    totalPrice: 0
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();
  }, [supabase.auth]);

  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      setBookingDetails(prev => ({
        ...prev,
        status: 'Confirmed',
        checkIn: '2024-04-01',
        checkOut: '2024-04-05',
        roomType: 'Deluxe Room',
        totalPrice: 600
      }));
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Loading booking confirmation...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Booking Confirmation</h1>
          <p className="text-green-600 font-semibold">Status: {bookingDetails.status}</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <h2 className="font-semibold">Booking ID:</h2>
            <p>{bookingDetails.bookingId}</p>
          </div>
          <div>
            <h2 className="font-semibold">Room Type:</h2>
            <p>{bookingDetails.roomType}</p>
          </div>
          <div>
            <h2 className="font-semibold">Check-in Date:</h2>
            <p>{bookingDetails.checkIn}</p>
          </div>
          <div>
            <h2 className="font-semibold">Check-out Date:</h2>
            <p>{bookingDetails.checkOut}</p>
          </div>
          <div>
            <h2 className="font-semibold">Total Price:</h2>
            <p>${bookingDetails.totalPrice}</p>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="border-t pt-6 mt-6">
            <div className="text-center space-y-4">
              <h2 className="text-lg font-semibold">Create an Account</h2>
              <p className="text-gray-600">
                Sign up to track your bookings, get exclusive deals, and manage your reservations easily!
              </p>
              <Button asChild className="w-full sm:w-auto">
                <Link href={`/auth/sign-up?redirect=${encodeURIComponent('/dashboard')}`}>
                  Create Account
                </Link>
              </Button>
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link href="/auth/sign-in" className="text-blue-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        )}

        <div className="text-center mt-6">
          <Link href="/">
            <Button variant="outline">Return to Home</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading confirmation details...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
} 