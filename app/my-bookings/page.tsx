'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
        {loading && <div>Loading your booking details...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {cloudbedsDetails && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Reservation</h2>
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
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<BookingError | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cloudbedsDetailsMap, setCloudbedsDetailsMap] = useState<Record<string, CloudbedsReservationDetails>>({});
  
  const fetchBookings = useCallback(async () => {
    try {
      // Get current user first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
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
  }, [supabase, router]);

  // Fetch Cloudbeds details for all bookings
  useEffect(() => {
    const fetchAllCloudbedsDetails = async () => {
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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error.message}
            </div>
          )}

          {!error && bookings.length === 0 && (
            <p className="text-gray-600">You don&apos;t have any bookings yet.</p>
          )}

          {!error && bookings.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bookings.map((booking) => {
                const cb = cloudbedsDetailsMap[booking.id];
                const imageUrl = "/placeholder-property.jpg";
                return (
                  <div 
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className="cursor-pointer bg-white rounded-xl shadow hover:shadow-md transition p-6 flex flex-col gap-4 border border-gray-100 hover:border-primary/30"
                  >
                    <div className="relative w-full h-40 rounded-lg overflow-hidden mb-2 bg-gray-100">
                      <Image
                        src={imageUrl}
                        alt="Room preview"
                        fill
                        className="object-cover w-full h-full"
                        style={{ minHeight: 120 }}
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="font-semibold text-lg truncate">{cb?.assigned?.[0]?.roomName || 'Room info unavailable'}</div>
                      <div className="text-gray-500 text-sm">{cb?.startDate || formatDate(booking.check_in)} - {cb?.endDate || formatDate(booking.check_out)}</div>
                      <div className="text-gray-500 text-sm">Guests: {booking.number_of_guests}</div>
                      <div className="text-gray-900 font-bold mt-1">{cb?.total !== undefined ? `MYR ${cb.total.toFixed(2)}` : (booking.total_price ? `MYR ${booking.total_price.toFixed(2)}` : <span className="text-gray-400">-</span>)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
      <div className="mt-12 flex flex-col items-center gap-6">
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg px-8 py-4 text-base font-semibold">
          <Link href="/">Book Your Next Trip</Link>
        </Button>
        <div className="max-w-xl w-full bg-blue-50 border border-blue-200 rounded-lg px-6 py-5 flex items-center gap-4 shadow-sm">
          <Info className="w-6 h-6 text-blue-500 flex-shrink-0" />
          <div className="text-blue-900 text-base font-medium">
            If you want to modify your booking, please refer to your confirmation email or <a href="/contact-us" className="underline text-blue-700 hover:text-blue-900">contact support</a>.
          </div>
        </div>
      </div>
    </div>
  );
} 