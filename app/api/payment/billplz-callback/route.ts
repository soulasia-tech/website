import { NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/billplz';
import { addPaymentToReservation, getReservation } from '@/lib/cloudbeds';
import { saveBookingInDB } from '@/lib/booking';

export async function POST(request: Request) {
  try {
    const { bill_id, x_signature, userId, amount } = await request.json();

    if (!bill_id || !x_signature) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Use the real Billplz payment verification
    const payment = await verifyPayment({ bill_id, x_signature });

    if (!payment.paid || payment.state !== 'paid') {
      return NextResponse.json({ success: false, error: 'Payment not completed', payment }, { status: 402 });
    }

    // Extract reservation ID from Billplz reference_1
    const reservationID = payment.reference_1;
    if (!reservationID) {
      return NextResponse.json({ success: false, error: 'Missing reservation ID in Billplz reference_1' }, { status: 400 });
    }

    // You may need to pass propertyId as well; if not available, you can store it in reference_2 or elsewhere
    // For now, let's assume you pass propertyId as reference_2 (or hardcode/test with a propertyId)
    const propertyId = payment.reference_2 || process.env.DEFAULT_PROPERTY_ID;
    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'Missing property ID for Cloudbeds payment update' }, { status: 400 });
    }

    // Add payment to reservation in Cloudbeds
    // Fetch reservation details from Cloudbeds to get the grand total
    let paidAmount = amount || 100;
    try {
      const reservation = await getReservation(propertyId, reservationID);
      // Try to extract the grand total (try several possible fields)
      paidAmount =
        reservation?.grandTotal ||
        reservation?.grand_total ||
        reservation?.total ||
        reservation?.balanceDue ||
        paidAmount;
    } catch (err) {
      console.error('Failed to fetch reservation or extract grand total, falling back to Billplz amount:', err);
    }
    await addPaymentToReservation({ propertyId, reservationId: reservationID, amount: paidAmount, paymentMethod: 'credit_card' });

    // Save booking in DB (mock or real)
    const booking = await saveBookingInDB({ userId, reservationId: reservationID, amount });

    return NextResponse.json({ success: true, payment, reservationID, booking });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 