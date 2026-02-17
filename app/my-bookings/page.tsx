'use client';

import React, {useState, useEffect, useCallback} from 'react';
import {createClientComponentClient} from '@supabase/auth-helpers-nextjs';
import {format} from 'date-fns';
import {useRouter} from 'next/navigation';
import {Button} from "@/components/ui/button";
import {Info} from "lucide-react";
import Link from "next/link";
import {PropertyInformation} from '@/components/property-information';
import {ChevronDown, ChevronUp, BedDouble} from 'lucide-react';
import {User as SupabaseUser} from "@supabase/supabase-js";

interface CloudbedsReservationDetails {
    guestName?: string;
    status?: string;
    assigned?: { roomName?: string }[];
    startDate?: string;
    endDate?: string;
    total?: number;
    numberOfChildren?: number;
    // Add other fields as needed
    grandTotal?: number;
    subtotal?: number;
    sst?: number;
    tax?: number;
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

// Minimal RoomCard for MyBookingsPage (no images)
function MinimalRoomCard({roomName, amenities, rate}: { roomName: string; amenities?: string[]; rate?: number }) {
    return (
        <div className="w-full group">
            <div className="flex flex-col gap-1">
                <h3 className="font-medium text-[15px] leading-5">{roomName}</h3>
                {rate !== undefined && (
                    <p className="text-[15px] leading-5 mt-1">
                        <span className="font-medium">MYR {rate.toFixed(2)}</span>
                        <span className="text-gray-500"> night</span>
                    </p>
                )}
                {amenities && amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {amenities.slice(0, 6).map((amenity: string, idx: number) => (
                            <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {amenity}
              </span>
                        ))}
                        {amenities.length > 6 && (
                            <span
                                className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">+{amenities.length - 6} more</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MyBookingsPage() {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [error, setError] = useState<BookingError | null>(null);
    const [cloudbedsDetailsMap, setCloudbedsDetailsMap] = useState<Record<string, CloudbedsReservationDetails>>({});
    const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
    const [roomTypeDetailsMap, setRoomTypeDetailsMap] = useState<Record<string, RoomTypeDetails>>({});
    const [user, setUser] = useState<SupabaseUser | null>(null);

    const fetchBookings = useCallback(async () => {
        try {
            // Get current user first
            const {data: {user}} = await supabase.auth.getUser();
            if (!user) {
                router.push('/');
                return;
            }

            setUser(user);

            const {data: bookingsData, error: bookingsError} = await supabase
                .from('bookings')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', {ascending: false});
            if (bookingsError) {
                console.error('Supabase error:', bookingsError);
                throw bookingsError;
            }
            setBookings(bookingsData || []);
            setError(null);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setError({message: error instanceof Error ? error.message : 'Failed to fetch bookings'});
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
                        } catch {
                        }
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
                            ? found.roomTypePhotos.map((url: string) => ({url, caption: ''}))
                            : [],
                        amenities: Array.isArray(found.amenities) ? found.amenities : [],
                        roomTypeID: found.roomTypeID,
                        roomTypeName: found.roomTypeName,
                    };
                    setRoomTypeDetailsMap(prev => ({...prev, [cacheKey]: details}));
                    return details;
                }
            }
        } catch {
        }
        setRoomTypeDetailsMap(prev => ({...prev, [cacheKey]: {photos: [], amenities: []}}));
        return {photos: [], amenities: []};
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
            <div className="bg-white">
                <section className="section-component-p-y bg-white">
                    <div
                        className="container mx-auto px-4 flex lp:flex-row flex-col w-full gap-8 lp:gap-[20px] full:gap-y-[30px]">
                        <div className="lp:sticky lp:top-[calc(var(--nav-h)*2)] lp:flex-[5]">
                            <h2 className="h2 font-semibold mb-5">Profile</h2>
                            <div
                                className="flex flex-col justify-center items-center  bg-[#f7f7f7] h-max p-4 tb:p-5 text-card-foreground  gap-5 rounded-xl border border-[#DEE3ED] overflow-hidden">
                                <span
                                    className="flex justify-center items-center  bg-[#101828] w-15 h-15 tb:w-30 tb:h-30 lp:w-40 lp:h-40 rounded-full font-medium text-white text-3xl tb:text-5xl lp:text-7xl"
                                >
                                    {(() => {
                                        return user?.user_metadata?.first_name?.[0];
                                    })()}
                                </span>
                                <div className="flex flex-col justify-center items-center gap-1 lp:gap-2.5">
                                    <h4 className="font-semibold text-2xl lp:text-[32px]">
                                        {user?.user_metadata.first_name} {user?.user_metadata.last_name || ''}
                                    </h4>
                                    <h3 className="font-semibold text-black/60 mb-2 text-lg full:text-2xl lp:mb-4 leading-tight">
                                        {user?.email}
                                    </h3>
                                </div>
                            </div>

                        </div>
                        <div className="lp:flex-[7]">
                            <h2 className="h2 font-semibold mb-5">Bookings</h2>

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
                                                    <BedDouble className="w-5 h-5 text-primary"/>
                                                </div>
                                                <button
                                                    onClick={() => setExpandedBookingId(expanded ? null : booking.id)}
                                                    className="ml-auto p-2 rounded hover:bg-gray-100 transition">
                                                    {expanded ? <ChevronUp className="w-5 h-5"/> :
                                                        <ChevronDown className="w-5 h-5"/>}
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
                                                    <div
                                                        className="font-medium text-base">{cb?.startDate || formatDate(booking.check_in)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-500 text-xs">Check-out</div>
                                                    <div
                                                        className="font-medium text-base">{cb?.endDate || formatDate(booking.check_out)}</div>
                                                </div>
                                                {/* Removed Adults, Children, Apartments fields */}
                                                <div className="ml-auto text-right">
                                                    <div className="text-gray-500 text-xs">Total</div>
                                                    <div
                                                        className="font-bold text-lg">MYR {cb?.grandTotal !== undefined ? cb.grandTotal.toFixed(2) : (cb?.total !== undefined ? cb.total.toFixed(2) : (booking.total_price ? booking.total_price.toFixed(2) : '-'))}</div>
                                                    {/* Always show breakdown if available */}
                                                    {(cb?.subtotal !== undefined || cb?.sst !== undefined || cb?.tax !== undefined || cb?.grandTotal !== undefined) && (
                                                        <div className="mt-1 text-xs text-gray-600 text-right">
                                                            <div>Subtotal:
                                                                MYR {cb?.subtotal !== undefined ? cb.subtotal : '-'}</div>
                                                            <div>SST/Tax:
                                                                MYR {cb?.sst !== undefined ? cb.sst : (cb?.tax !== undefined ? cb.tax : '-')}</div>
                                                            <div>Grand Total:
                                                                MYR {cb?.grandTotal !== undefined ? cb.grandTotal : (cb?.total !== undefined ? cb.total : '-')}</div>
                                                            <div className="text-[10px] text-gray-400 mt-1">This is the
                                                                official total from
                                                                Cloudbeds, including all taxes and fees.
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Expandable Section */}
                                            {expanded && (
                                                <div className="mt-4 space-y-6">
                                                    {/* Room Cards */}
                                                    <div className="grid gap-4 lp:grid-cols-2">
                                                        {rooms.length > 0 ? rooms.map((room: AssignedRoom, idx: number) => {
                                                            // No name shown in MinimalRoomCard
                                                            return (
                                                                <MinimalRoomCard
                                                                    key={idx}
                                                                    roomName={''}
                                                                    amenities={[]}
                                                                    rate={typeof room.rate === 'number' ? room.rate : undefined}
                                                                />
                                                            );
                                                        }) : <div className="text-gray-400">Room info loading...</div>}
                                                    </div>
                                                    {/* Property Information */}
                                                    {propertyId && (
                                                        <div className="bg-gray-50 rounded-xl p-4">
                                                            <PropertyInformation propertyId={propertyId}/>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                    </div>
                </section>
            </div>
        </>
    );
}
