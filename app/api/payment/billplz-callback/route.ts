import { NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/billplz';
import { createReservationInCloudbeds, saveBookingInDB } from '@/lib/booking';

export async function POST(request: Request) {
  try {
    // In real Billplz callback, these would come from Billplz POST params
    const { bill_id, x_signature, guestName, userId, amount } = await request.json();

    if (!bill_id || !x_signature || !guestName || !amount) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Simulate payment verification
    const payment = await verifyPayment({ bill_id, x_signature });

    if (!payment.paid) {
      return NextResponse.json({ success: false, error: 'Payment not completed', payment }, { status: 402 });
    }

    // Create reservation in Cloudbeds (mock)
    const reservation = await createReservationInCloudbeds({ guestName });

    // Save booking in DB (mock)
    const booking = await saveBookingInDB({ userId, reservationId: reservation.id, amount });

    return NextResponse.json({ success: true, payment, reservation, booking });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 