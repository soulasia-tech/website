'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from 'date-fns';

// Mock room data (matching booking page)
const mockRooms = {
  room1: {
    id: 'room1',
    name: 'Deluxe KLCC View Suite',
    description: 'Luxurious suite with breathtaking views of the Petronas Twin Towers',
    price: 250,
    maxGuests: 2,
    images: [
      'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0'
    ],
    amenities: ['King bed', 'City view', 'Free WiFi', 'Kitchen']
  },
  room2: {
    id: 'room2',
    name: 'Premium Two-Bedroom Apartment',
    description: 'Spacious apartment perfect for families or extended stays',
    price: 350,
    maxGuests: 4,
    images: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6',
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc'
    ],
    amenities: ['2 bedrooms', 'Full kitchen', 'Washer/Dryer', 'Balcony']
  }
};

interface BookingDetailsModalProps {
  booking: any;
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(dateString: string | null) {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

function BookingDetailsModal({ booking, isOpen, onClose }: BookingDetailsModalProps) {
  const room = mockRooms[booking?.room_id as keyof typeof mockRooms];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <div className="mt-2">
            <span className={`inline-flex px-2 text-sm font-semibold rounded-full ${
              booking?.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              booking?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {booking?.status}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {room && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Property Details</h2>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-gray-600">Room Type:</p>
                <p>{room.name}</p>
                <p className="text-gray-600">Description:</p>
                <p>{room.description}</p>
                <p className="text-gray-600">Max Guests:</p>
                <p>{room.maxGuests} persons</p>
                <p className="text-gray-600">Amenities:</p>
                <p>{room.amenities.join(', ')}</p>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-2">Booking Information</h2>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-gray-600">Booking ID:</p>
              <p>{booking?.id}</p>
              <p className="text-gray-600">Check-in:</p>
              <p>{formatDate(booking?.check_in)}</p>
              <p className="text-gray-600">Check-out:</p>
              <p>{formatDate(booking?.check_out)}</p>
              <p className="text-gray-600">Number of Guests:</p>
              <p>{booking?.number_of_guests}</p>
              <p className="text-gray-600">Total Price:</p>
              <p>${booking?.total_price}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  
  // Fetch bookings on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', session?.user?.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } catch (error: any) {
        console.error('Error fetching bookings:', error);
        setError(error.message);
      }
    };

    fetchBookings();
  }, [supabase]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">My bookings</h1>
      
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium mb-4">Your Bookings</h2>
          
          {error && (
            <div className="text-red-600 mb-4">
              Failed to load bookings. Please try again later.
            </div>
          )}

          {bookings && bookings.length === 0 && (
            <p className="text-gray-600">You don&apos;t have any bookings yet.</p>
          )}

          {bookings && bookings.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guests
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr 
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mockRooms[booking.room_id as keyof typeof mockRooms]?.name || booking.room_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(booking.check_in)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(booking.check_out)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.number_of_guests}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${booking.total_price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
} 