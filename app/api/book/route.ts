import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      checkIn,
      checkOut,
      roomId,
      numberOfGuests,
      totalPrice
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !checkIn || !checkOut || !roomId || !numberOfGuests || !totalPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create booking in Supabase
    const { data, error } = await supabase
      .from('guest_bookings')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        check_in: checkIn,
        check_out: checkOut,
        room_type: roomId,
        number_of_guests: numberOfGuests,
        total_price: totalPrice,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Booking error:', error);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId: data.id,
        status: 'pending',
        message: 'Booking created successfully. Proceed to payment.'
      }
    });
  } catch (error: any) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
} 