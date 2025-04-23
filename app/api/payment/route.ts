import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, paymentMethod } = body;

    if (!bookingId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Booking ID and payment method are required' },
        { status: 400 }
      );
    }

    // Mock payment processing
    const paymentSuccess = Math.random() > 0.1; // 90% success rate

    if (!paymentSuccess) {
      return NextResponse.json(
        { error: 'Payment failed. Please try again.' },
        { status: 400 }
      );
    }

    // Update booking status in Supabase
    const { error } = await supabase
      .from('guest_bookings')
      .update({
        payment_status: 'completed',
        status: 'confirmed',
        stripe_payment_id: `mock_payment_${Date.now()}`
      })
      .eq('id', bookingId);

    if (error) {
      console.error('Payment update error:', error);
      return NextResponse.json(
        { error: 'Failed to update booking status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId,
        status: 'confirmed',
        message: 'Payment successful. Booking confirmed.'
      }
    });
  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
} 