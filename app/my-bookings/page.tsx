'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import Link from "next/link";
import { RoomCard } from '@/components/room-card';
import { PropertyInformation } from '@/components/property-information';
import { ChevronDown, ChevronUp, BedDouble } from 'lucide-react';

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

// Add type for room type details
interface RoomTypeDetails {
  photos: { url: string; caption?: string }[];
  amenities?: string[];
  roomTypeID?: string;
  roomTypeName?: string;
}

interface CloudbedsRoomType {
  roomTypeID: string;
  roomTypeName: string;
  roomTypePhotos?: string[];
  amenities?: string[];
}

interface AssignedRoom {
  roomName?: string;
  rate?: number;
  photos?: { url: string; caption?: string }[];
}

export default function MyBookingsPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<BookingError | null>(null);
  const [cloudbedsDetailsMap, setCloudbedsDetailsMap] = useState<Record<string, CloudbedsReservationDetails>>({});
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [roomTypeDetailsMap, setRoomTypeDetailsMap] = useState<Record<string, RoomTypeDetails>>({});
  
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

  // Helper to fetch and cache room type details
  const fetchRoomTypeDetails = useCallback(async (propertyId: string, roomNameOrId: string) => {
    const cacheKey = `${propertyId}_${roomNameOrId}`;
    if (roomTypeDetailsMap[cacheKey]) return roomTypeDetailsMap[cacheKey];
    try {
      const res = await fetch(`/api/cloudbeds/room-types?propertyId=${propertyId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.roomTypes)) {
        const roomTypes: CloudbedsRoomType[] = data.roomTypes;
        // Try to match by roomTypeName (case-insensitive, trimmed)
        let found = roomTypes.find((rt) =>
          rt.roomTypeName?.trim().toLowerCase() === roomNameOrId?.trim().toLowerCase()
        );
        // If not found, try by roomTypeID
        if (!found) {
          found = roomTypes.find((rt) =>
            rt.roomTypeID?.trim().toLowerCase() === roomNameOrId?.trim().toLowerCase()
          );
        }
        // If still not found, try includes (partial match)
        if (!found) {
          found = roomTypes.find((rt) =>
            rt.roomTypeName?.toLowerCase().includes(roomNameOrId?.trim().toLowerCase())
          );
        }
        if (found) {
          const details: RoomTypeDetails = {
            photos: Array.isArray(found.roomTypePhotos)
              ? found.roomTypePhotos.map((url: string) => ({ url, caption: '' }))
              : [],
            amenities: Array.isArray(found.amenities) ? found.amenities : [],
            roomTypeID: found.roomTypeID,
            roomTypeName: found.roomTypeName,
          };
          setRoomTypeDetailsMap(prev => ({ ...prev, [cacheKey]: details }));
          return details;
        }
      }
    } catch {}
    setRoomTypeDetailsMap(prev => ({ ...prev, [cacheKey]: { photos: [], amenities: [] } }));
    return { photos: [], amenities: [] };
  }, [roomTypeDetailsMap]);

  // Prefetch room type details for expanded booking's rooms
  useEffect(() => {
    if (!expandedBookingId) return;
    const booking = bookings.find(b => b.id === expandedBookingId);
    if (!booking) return;
    const cb = cloudbedsDetailsMap[booking.id];
    const propertyId = booking.cloudbeds_property_id;
    const rooms = Array.isArray(cb?.assigned) ? cb.assigned : [];
    rooms.forEach(room => {
      if (propertyId && room.roomName) {
        const cacheKey = `${propertyId}_${room.roomName}`;
        if (!roomTypeDetailsMap[cacheKey]) {
          fetchRoomTypeDetails(propertyId, room.roomName);
        }
      }
    });
  }, [expandedBookingId, bookings, cloudbedsDetailsMap, roomTypeDetailsMap, fetchRoomTypeDetails]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <>
      <title>Soulasia | My Bookings</title>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-6">My bookings</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error.message}
          </div>
        )}

        {!error && bookings.length === 0 && (
          <p className="text-gray-600">Your bookings will appear here.</p>
        )}

        {!error && bookings.length > 0 && (
          bookings.map((booking) => {
            const cb = cloudbedsDetailsMap[booking.id];
            const propertyId = booking.cloudbeds_property_id;
            const rooms = Array.isArray(cb?.assigned) ? cb.assigned : [];
            const expanded = expandedBookingId === booking.id;
            return (
              <div
                key={booking.id}
                className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6"
              >
                {/* Summary Row */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <BedDouble className="w-5 h-5 text-primary" />
                    <span className="text-base">
                      {rooms.length > 0 ? rooms.map((room, idx) => (
                        <span key={idx}>{room.roomName || '-'}{idx < rooms.length - 1 ? ', ' : ''}</span>
                      )) : 'Room info loading...'}
                    </span>
                  </div>
                  <button onClick={() => setExpandedBookingId(expanded ? null : booking.id)} className="ml-auto p-2 rounded hover:bg-gray-100 transition">
                    {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
                {/* Grouped Info */}
                <div className="flex flex-wrap gap-6 mt-2">
                  <div>
                    <div className="text-gray-500 text-xs">Guest</div>
                    <div className="font-medium text-base">{cb?.guestName || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Check-in</div>
                    <div className="font-medium text-base">{cb?.startDate || formatDate(booking.check_in)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Check-out</div>
                    <div className="font-medium text-base">{cb?.endDate || formatDate(booking.check_out)}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-gray-500 text-xs">Total</div>
                    <div className="font-bold text-lg">MYR {cb?.total !== undefined ? cb.total.toFixed(2) : (booking.total_price ? booking.total_price.toFixed(2) : '-')}</div>
                  </div>
                </div>
                {/* Expandable Section */}
                {expanded && (
                  <div className="mt-4 space-y-6">
                    {/* Room Cards */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {rooms.length > 0 ? rooms.map((room: AssignedRoom, idx: number) => {
                        const cacheKey = propertyId && room.roomName ? `${propertyId}_${room.roomName}` : undefined;
                        const roomTypeDetails = cacheKey ? roomTypeDetailsMap[cacheKey] : undefined;
                        return (
                          <RoomCard
                            key={idx}
                            roomName={room.roomName || roomTypeDetails?.roomTypeName || '-'}
                            amenities={roomTypeDetails?.amenities || []}
                            rate={typeof room.rate === 'number' ? room.rate : undefined}
                          />
                        );
                      }) : <div className="text-gray-400">No room info</div>}
                    </div>
                    {/* Property Information */}
                    {propertyId && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <PropertyInformation propertyId={propertyId} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

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
    </>
  );
} 