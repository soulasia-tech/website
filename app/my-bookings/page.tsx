'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

interface CloudbedsReservationDetails {
  guestName?: string;
  status?: string;
  assigned?: { roomName?: string }[];
  startDate?: string;
  endDate?: string;
  total?: number;
  // Add other fields as needed
}

function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

function BookingDetailsModal({ booking, isOpen, onClose }: BookingDetailsModalProps) {
  const [cloudbedsDetails, setCloudbedsDetails] = useState<CloudbedsReservationDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCloudbedsDetails = async () => {
      if (!booking?.cloudbeds_res_id || !booking?.cloudbeds_property_id) return;
      setLoading(true);
      setError(null);
      setCloudbedsDetails(null);
      try {
        // Fetch reservation details from our secure API route
        const res = await fetch(`/api/fetch-cloudbeds-reservation?propertyId=${booking.cloudbeds_property_id}&reservationId=${booking.cloudbeds_res_id}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to fetch Cloudbeds details');
        setCloudbedsDetails(data.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch Cloudbeds details');
      } finally {
        setLoading(false);
      }
    };
    if (isOpen && booking?.cloudbeds_res_id && booking?.cloudbeds_property_id) {
      fetchCloudbedsDetails();
    }
  }, [booking, isOpen]);

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
        {loading && <div>Loading Cloudbeds details...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {cloudbedsDetails && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Cloudbeds Reservation</h2>
              <div className="grid grid-cols-2 gap-2">
                <p className="text-gray-600">Guest Name:</p>
                <p>{cloudbedsDetails.guestName}</p>
                <p className="text-gray-600">Status:</p>
                <p>{cloudbedsDetails.status}</p>
                <p className="text-gray-600">Room:</p>
                <p>{cloudbedsDetails.assigned?.[0]?.roomName}</p>
                <p className="text-gray-600">Check-in:</p>
                <p>{cloudbedsDetails.startDate}</p>
                <p className="text-gray-600">Check-out:</p>
                <p>{cloudbedsDetails.endDate}</p>
                <p className="text-gray-600">Total:</p>
                <p>MYR {cloudbedsDetails.total?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
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
              <p>MYR {booking?.total_price?.toFixed(2)}</p>
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

interface Booking {
  id: string;
  created_at: string;
  user_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  number_of_guests: number;
  total_price: number;
  status: string;
  cloudbeds_res_id?: string;
  cloudbeds_property_id?: string;
}

interface BookingError {
  message: string;
}

export default function MyBookingsPage() {
  const supabase = createClientComponentClient();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<BookingError | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cloudbedsDetailsMap, setCloudbedsDetailsMap] = useState<Record<string, CloudbedsReservationDetails>>({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const fetchBookings = useCallback(async () => {
    try {
      // Get current user first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (bookingsError) {
        console.error('Supabase error:', bookingsError);
        throw bookingsError;
      }
      setBookings(bookingsData || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError({ message: error instanceof Error ? error.message : 'Failed to fetch bookings' });
    }
  }, [supabase]);

  // Fetch Cloudbeds details for all bookings
  useEffect(() => {
    const fetchAllCloudbedsDetails = async () => {
      setLoadingDetails(true);
      const detailsMap: Record<string, CloudbedsReservationDetails> = {};
      await Promise.all(
        bookings.map(async (booking) => {
          if (booking.cloudbeds_res_id && booking.cloudbeds_property_id) {
            try {
              const res = await fetch(`/api/fetch-cloudbeds-reservation?propertyId=${booking.cloudbeds_property_id}&reservationId=${booking.cloudbeds_res_id}`);
              const data = await res.json();
              if (data.success) {
                detailsMap[booking.id] = data.data;
              }
            } catch {}
          }
        })
      );
      setCloudbedsDetailsMap(detailsMap);
      setLoadingDetails(false);
    };
    if (bookings.length > 0) {
      fetchAllCloudbedsDetails();
    }
  }, [bookings]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">My bookings</h1>
      
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium mb-4">Your Bookings</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error.message}
            </div>
          )}

          {!error && bookings.length === 0 && (
            <p className="text-gray-600">You don&apos;t have any bookings yet.</p>
          )}

          {!error && bookings.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest Name
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => {
                    const cb = cloudbedsDetailsMap[booking.id];
                    return (
                      <tr 
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cb?.assigned?.[0]?.roomName || mockRooms[booking.room_id as keyof typeof mockRooms]?.name || booking.room_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cb?.guestName || <span className="text-gray-400">-</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            cb?.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            cb?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            cb?.status === 'checked_out' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {cb?.status || booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cb?.startDate || formatDate(booking.check_in)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cb?.endDate || formatDate(booking.check_out)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cb?.total !== undefined ? `MYR ${cb.total.toFixed(2)}` : (booking.total_price ? `MYR ${booking.total_price.toFixed(2)}` : <span className="text-gray-400">-</span>)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {loadingDetails && <div className="text-center py-4 text-gray-500">Loading Cloudbeds details...</div>}
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