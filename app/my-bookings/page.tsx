'use client';

import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {createClientComponentClient} from '@supabase/auth-helpers-nextjs';
import {format} from 'date-fns';
import {useRouter} from 'next/navigation';
import {ChevronDown, ChevronUp} from 'lucide-react';
import {User as SupabaseUser} from "@supabase/supabase-js";
import Image from "next/image";
import {PropertyRoom, useUI} from "@/lib/context";
import {Gallery} from "@/components/Gallery";
import {PropertyInformationNew} from "@/components/property-information-new";
import {cn} from "@/lib/utils";

interface CloudbedsReservationDetails {
    guestName?: string;
    status?: string;
    propertyName?: string;
    roomNames?: string;
    roomTypes?: PropertyRoom[];
    assigned?: { roomName?: string, roomTypeName?: string, roomTypeID?: string }[];
    unassigned?: { roomName?: string, roomTypeName?: string, roomTypeID?: string }[];
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

function formatDateDay(dateString: string | undefined | null): string {
    if (!dateString) return '';
    try {
        return format(new Date(dateString), 'EEE, d MMMM yyyy');
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}

function formatDate(dateString: string | undefined | null): string {
    if (!dateString) return '';
    try {
        return format(new Date(dateString), 'd MMMM yyyy');
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

function RoomPhoto({images, selectedIndex, onClickImage}: {
    images: string[];
    selectedIndex?: number,
    onClickImage: () => void;
}) {
    const [selectedIdx, setSelectedIdx] = useState<number>(selectedIndex ?? 0);

    const hasPrev = selectedIdx > 0;
    const hasNext = selectedIdx < images.length - 1;

    const handleNext = () => {
        setSelectedIdx((prev) =>
            prev < images.length - 1 ? prev + 1 : prev
        );
    };

    const handlePrev = () => {
        setSelectedIdx((prev) =>
            prev > 0 ? prev - 1 : prev
        );
    };

    return (
        <div
            className="flex relative rounded-xl aspect-[1/1] max-h-[90px] tb:max-h-[130px] overflow-hidden ">
            {/* arrows */}
            <button
                onClick={() => {
                    handlePrev()
                }}
                className={cn("absolute left-2 top-1/2 -translate-y-1/2 z-10 cursor-pointer mb-2 flex items-center rounded-sm justify-center aspect-[1/1] w-[16px] tb:w-[24px]",
                    !hasPrev ? "bg-white/20" : "bg-white")}>
                <Image
                    src={`/icons/arrow-${!hasPrev ? 'light' : 'dark'}.svg`}
                    alt="Prev"
                    className="transform rotate-180 w-2 h-2 tb:w-2.5 tb:h-2.5"
                    width={8}
                    height={8}
                />
            </button>


            {/* arrows */}
            <button
                onClick={() => {
                    handleNext()
                }}
                className={cn("cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 z-10 mb-2 flex items-center rounded-sm justify-center aspect-[1/1] w-[16px] tb:w-[24px] custom-next",
                    !hasNext ? "bg-white/20" : "bg-white")}>
                <Image
                    src={`/icons/arrow-${!hasNext ? 'light' : 'dark'}.svg`}
                    alt="Next"
                    className="w-2 h-2 tb:w-2.5 tb:h-2.5"
                    width={8}
                    height={8}
                />
            </button>
            <Image
                src={`${images[selectedIdx]}?w=400&h=400&fit=crop`}
                alt="room"
                width={130}
                height={130}
                className="object-cover cursor-pointer w-full h-full"
                onClick={() => onClickImage()}
            />
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
    const {propertiesSaved, rooms} = useUI();

    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [status, setStatus] = useState<string>('active');
    const [hasChanged, setHasChanged] = useState<boolean>(false);
    const [selectedRoomImages, setSelectedRoomImages] = useState<string[] | null>(null);

    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            const cb = cloudbedsDetailsMap[booking.id];
            const bookingStatus =
                cb?.status?.toLowerCase() ||
                booking.status?.toLowerCase() ||
                '';

            switch (status) {
                case 'active':
                    return ['confirmed', 'checked_in'].includes(bookingStatus);
                case 'past':
                    return ['checked_out', 'not_confirmed', 'no_show'].includes(bookingStatus);
                case 'canceled':
                    return bookingStatus === 'canceled';
                default:
                    return true;
            }
        });
    }, [status, bookings, cloudbedsDetailsMap]);

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
                                const property = propertiesSaved.find(item => item.propertyId == booking.cloudbeds_property_id)

                                const detail = data.data as CloudbedsReservationDetails;

                                detail.propertyName = property?.propertyName ?? 'Hotel Name';

                                const assignedRoomTypeNames = detail.assigned?.map(a => a.roomTypeName?.replace('(Book Direct and Save – Up to 30% Cheaper Than Online Rates!)', '').trim()) || [];
                                const unassignedRoomTypeNames = detail.unassigned?.map(u => u.roomTypeName?.replace('(Book Direct and Save – Up to 30% Cheaper Than Online Rates!)', '').trim()) || [];
                                const allRoomTypeNames = [...assignedRoomTypeNames, ...unassignedRoomTypeNames];

                                detail.roomNames = allRoomTypeNames?.join(', ') ?? 'Room Name';

                                detailsMap[booking.id] = detail;
                            }
                        } catch {
                        }
                    }
                })
            );
            setCloudbedsDetailsMap(detailsMap);
        };
        if (bookings.length > 0) {
            fetchAllCloudbedsDetails().then();
        }
    }, [bookings]);

    useEffect(() => {
        if (!rooms) return;

        setCloudbedsDetailsMap(prevMap => {
            if (!prevMap || Object.keys(prevMap).length === 0) {
                return prevMap; // prevent running on empty map
            }

            const updatedMap: Record<string, CloudbedsReservationDetails> = {};

            Object.entries(prevMap).forEach(([bookingId, details]) => {
                const assignedRoomTypeIds =
                    details.assigned?.map(a => a.roomTypeID) || [];

                const unassignedRoomTypeIds =
                    details.unassigned?.map(u => u.roomTypeID) || [];

                const allRoomTypeIds = [
                    ...assignedRoomTypeIds,
                    ...unassignedRoomTypeIds,
                ];

                const matchedRooms = rooms.filter(r =>
                    allRoomTypeIds.includes(r.roomTypeID)
                );

                updatedMap[bookingId] = {
                    ...details,
                    roomTypes: matchedRooms,
                };
            });

            return updatedMap;
        });
    }, [rooms]);

    useEffect(() => {
        fetchBookings().then();
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
                                className="flex flex-col relative justify-center items-center  bg-[#f7f7f7] h-max p-4 tb:p-6 lp:p-10 text-card-foreground  gap-5 rounded-xl border border-[#DEE3ED] overflow-hidden">
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
                                <Image
                                    src="/icons/edit.svg"
                                    alt=""
                                    width={16}
                                    height={16}
                                    className="w-5 h-5 tb:w-6 tb:h-6 lp:w-8 lp:h-8  absolute top-6 right-6 lp:top-10 lp:right-10 cursor-pointer"
                                />
                            </div>
                        </div>
                        <div className="lp:flex-[7]">
                            <h2 className="h2 font-semibold mb-5">Bookings</h2>
                            <div className="flex items-center gap-3.5 full:gap-5 mb-5.5">
                                <div
                                    className={cn(
                                        "cursor-pointer px-5 py-2.5 font-lg lp:font-xl font-medium rounded-[10px]",
                                        status == 'active' ? 'border bg-[#101828] text-white' : 'border border-[#DEE3ED] bg-white text-[#4A4F5B]'
                                    )}
                                    onClick={() => setStatus('active')}
                                >Active
                                </div>
                                <div
                                    className={cn(
                                        "cursor-pointer px-5 py-2.5 font-lg lp:font-xl font-medium rounded-[10px]",
                                        status == 'past' ? 'border bg-[#101828] text-white' : 'border border-[#DEE3ED] bg-white text-[#4A4F5B]'
                                    )}
                                    onClick={() => setStatus('past')}
                                >Past
                                </div>
                                <div
                                    className={cn(
                                        "cursor-pointer px-5 py-2.5 font-lg lp:font-xl font-medium rounded-[10px]",
                                        status == 'canceled' ? 'border bg-[#101828] text-white' : 'border border-[#DEE3ED] bg-white text-[#4A4F5B]'
                                    )}
                                    onClick={() => setStatus('canceled')}
                                >Canceled
                                </div>
                            </div>
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                                    {error.message}
                                </div>
                            )}

                            {!error && bookings.length === 0 && (
                                <p className="text-gray-600">Your bookings will appear here.</p>
                            )}

                            {!error && filteredBookings.length  > 0 && (
                                filteredBookings.map((booking) => {
                                    const propertyId = booking.cloudbeds_property_id;
                                    const cb = cloudbedsDetailsMap[booking.id];

                                    const roomTypePhotos: string[] =
                                        cb?.roomTypes?.flatMap(room =>
                                            room.roomTypePhotos?.map(photo => photo.url) || []
                                        ) || ['/rooms/room.svg'];

                                    console.log(roomTypePhotos)
                                    const expanded = expandedBookingId === booking.id;

                                    return (
                                        <div
                                            key={booking.id}
                                            className="flex flex-col w-full bg-[#f7f7f7] rounded-xl text-card-foreground border overflow-hidden p-5 mb-3.5 gap-5 tb:gap-7.5"
                                        >
                                            <div
                                                className="flex flex-col tb:flex-row justify-between w-full gap-3 tb:gap-7.5">
                                                <div
                                                    className="flex items-center h-full gap-5 full:gap-10">
                                                    <RoomPhoto images={roomTypePhotos} onClickImage={() => {
                                                        setSelectedRoomImages(roomTypePhotos)
                                                    }}></RoomPhoto>
                                                    {/* Grouped Info */}
                                                    <div className="flex flex-col gap-2.5 tb:gap-5">
                                                        <div
                                                            className="flex items-center gap-5 tb:gap-0 text-sm text-[#4A4F5B] font-medium">
                                                            <div className="flex flex-col gap-1 lp:gap-2.5">
                                                                <h2 className="text-lg tb:text-xl font-semibold text-[#101828]">
                                                                    {cb.propertyName}
                                                                </h2>
                                                                <div
                                                                    className="text-sm tb:text-base text-[#4a4f5b] font-normal">
                                                                    {cb.roomNames}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="hidden tb:flex gap-5 full:gap-10">
                                                            <div>
                                                                <div
                                                                    className="font-normal text-[#4A4F5B] text-xs tb:text-sm">Check-in
                                                                </div>
                                                                <div
                                                                    className="hidden tb:flex font-medium text-base tb:text-lg">{formatDateDay(cb?.startDate)}</div>
                                                                <div
                                                                    className="flex tb:hidden font-medium text-base tb:text-lg">{formatDate(cb?.startDate)}</div>
                                                            </div>
                                                            <div>
                                                                <div
                                                                    className="font-normal text-[#4A4F5B] text-xs tb:text-sm">Check-out
                                                                </div>
                                                                <div
                                                                    className="hidden tb:flex font-medium text-base tb:text-lg">{formatDateDay(cb?.endDate)}</div>
                                                                <div
                                                                    className="flex tb:hidden font-medium text-base tb:text-lg">{formatDate(cb?.endDate)}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex tb:hidden gap-5 full:gap-10">
                                                    <div>
                                                        <div
                                                            className="font-normal text-[#4A4F5B] text-xs tb:text-sm">Check-in
                                                        </div>
                                                        <div
                                                            className="hidden tb:flex font-medium text-base tb:text-lg">{formatDateDay(cb?.startDate)}</div>
                                                        <div
                                                            className="flex tb:hidden font-medium text-base tb:text-lg">{formatDate(cb?.startDate)}</div>
                                                    </div>
                                                    <div>
                                                        <div
                                                            className="font-normal text-[#4A4F5B] text-xs tb:text-sm">Check-out
                                                        </div>
                                                        <div
                                                            className="hidden tb:flex font-medium text-base tb:text-lg">{formatDateDay(cb?.endDate)}</div>
                                                        <div
                                                            className="flex tb:hidden font-medium text-base tb:text-lg">{formatDate(cb?.endDate)}</div>
                                                    </div>
                                                </div>
                                                {/* Summary Row */}
                                                <div
                                                    className="flex flex-row tb:flex-col items-end justify-between gap-4">
                                                    {/* Removed Adults, Children, Apartments fields */}
                                                    <div className="tb:text-right">
                                                        <div
                                                            className="font-medium text-[#4A4F5B] text-base tb:text-lg">Total
                                                        </div>
                                                        <div
                                                            className="text-[#0E3599] font-bold text-lg tb:text-xl">MYR {cb?.grandTotal !== undefined ? cb.grandTotal.toFixed(2) : (cb?.total !== undefined ? cb.total.toFixed(2) : (booking.total_price ? booking.total_price.toFixed(2) : '-'))}</div>
                                                        {/* Always show breakdown if available */}
                                                        {(cb?.subtotal !== undefined || cb?.sst !== undefined || cb?.tax !== undefined || cb?.grandTotal !== undefined) && (
                                                            <div className="mt-1 text-xs text-gray-600 text-right">
                                                                <div>Subtotal:
                                                                    MYR {cb?.subtotal !== undefined ? cb.subtotal : '-'}</div>
                                                                <div>SST/Tax:
                                                                    MYR {cb?.sst !== undefined ? cb.sst : (cb?.tax !== undefined ? cb.tax : '-')}</div>
                                                                <div>Grand Total:
                                                                    MYR {cb?.grandTotal !== undefined ? cb.grandTotal : (cb?.total !== undefined ? cb.total : '-')}</div>
                                                                <div className="text-[10px] text-gray-400 mt-1">This
                                                                    is
                                                                    the
                                                                    official total from
                                                                    Cloudbeds, including all taxes and fees.
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => setExpandedBookingId(expanded ? null : booking.id)}
                                                        className="ml-auto p-2 rounded hover:bg-gray-100 transition">
                                                        {expanded ? <ChevronUp className="w-5 h-5"/> :
                                                            <ChevronDown className="w-5 h-5"/>}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expandable Section */}
                                            {expanded && propertyId && (
                                                <div className="grid grid-cols-1 rounded-xl">
                                                    <PropertyInformationNew propertyId={propertyId}/>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}

                            {selectedRoomImages && (
                                <div
                                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#141826] p-5 lp:p-10"
                                    tabIndex={-1}
                                    aria-modal="true"
                                    role="dialog"
                                >
                                    <Gallery
                                        images={selectedRoomImages.map(src => ({src, alt: "Room image"}))}
                                        onClose={() => {
                                            setSelectedRoomImages(null);
                                        }}
                                    ></Gallery>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}


