'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    if (bookingId) {
      // Simulate API call delay
      setTimeout(() => {
        setBooking({
          id: bookingId,
          status: 'confirmed',
          checkIn: new Date().toISOString().split('T')[0],
          checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          roomType: 'Deluxe Room',
          totalPrice: 150
        });
        setLoading(false);
      }, 1000);
    } else {
      setError('No booking ID found');
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
        <p>{error}</p>
        <Button 
          onClick={() => window.location.href = '/'}
          className="mt-4"
        >
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Booking Confirmed!</h1>
      
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold">Booking Details</h2>
            <p>Booking ID: {booking.id}</p>
            <p>Status: {booking.status}</p>
          </div>

          <div>
            <h2 className="font-semibold">Dates</h2>
            <p>Check-in: {booking.checkIn}</p>
            <p>Check-out: {booking.checkOut}</p>
          </div>

          <div>
            <h2 className="font-semibold">Room</h2>
            <p>{booking.roomType}</p>
            <p>Total Price: ${booking.totalPrice}</p>
          </div>

          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Return to Home
          </Button>
        </div>
      </Card>
    </div>
  );
} 