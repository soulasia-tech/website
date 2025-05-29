import { NextResponse } from 'next/server';
import type { ApiResponse, BookingRequest, BookingDetails } from '@/types/api';

export async function POST(request: Request) {
  try {
    const body: BookingRequest = await request.json();

    // Validate request
    if (!body.firstName || !body.lastName || !body.email || !body.checkIn || !body.checkOut || !body.propertyId || !body.rooms || !Array.isArray(body.rooms) || body.rooms.length === 0) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Mock API call to create booking
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock booking response
    const booking: BookingDetails = {
      id: `booking_${Date.now()}`,
      status: 'pending',
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      roomType: body.rooms.map(r => `${r.quantity} x ${r.roomTypeID}`).join(', '),
      totalPrice: 150 * body.rooms.reduce((sum, r) => sum + r.quantity, 0),
      paymentStatus: 'pending'
    };

    return NextResponse.json<ApiResponse<BookingDetails>>({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json<ApiResponse<never>>({
      success: false,
      error: 'Failed to create booking'
    }, { status: 500 });
  }
} 