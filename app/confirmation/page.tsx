'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

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
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    if (!bookingId) return;

    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Get booking from database
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

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Card className="bg-white rounded-xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Booking Not Found</h1>
            <p className="mb-6">Sorry, we couldn't find your booking. Please contact support if you think this is an error.</p>
            <Link href="/">
              <Button variant="outline">Return to Home</Button>
            </Link>
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
            <p>Total price: ${booking.total_price}</p>
            
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

          <div className="mt-8">
            <Link href="/">
              <Button variant="outline">Return to Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
} 