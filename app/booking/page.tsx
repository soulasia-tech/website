'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    checkIn: searchParams.get('startDate') || '',
    checkOut: searchParams.get('endDate') || '',
    roomId: searchParams.get('roomId') || '',
    numberOfGuests: parseInt(searchParams.get('guests') || '1'),
    totalPrice: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock successful booking
      const mockBookingId = `booking_${Date.now()}`;
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to confirmation page
      router.push(`/confirmation?bookingId=${mockBookingId}`);
    } catch (error) {
      console.error('Booking failed:', error);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Complete Your Booking</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <Input
                required
                value={bookingData.firstName}
                onChange={(e) => setBookingData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <Input
                required
                value={bookingData.lastName}
                onChange={(e) => setBookingData(prev => ({ ...prev, lastName: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              required
              value={bookingData.email}
              onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <Input
              type="tel"
              value={bookingData.phone}
              onChange={(e) => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Check-in Date</label>
              <Input
                type="date"
                required
                value={bookingData.checkIn}
                onChange={(e) => setBookingData(prev => ({ ...prev, checkIn: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Check-out Date</label>
              <Input
                type="date"
                required
                value={bookingData.checkOut}
                onChange={(e) => setBookingData(prev => ({ ...prev, checkOut: e.target.value }))}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full relative"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing Payment...
              </div>
            ) : (
              'Proceed to Payment'
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
} 