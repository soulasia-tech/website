import { NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/billplz';
import { createReservation, addPaymentToReservation } from '@/lib/cloudbeds';
import { saveBookingInDB } from '@/lib/booking';

export async function POST(request: Request) {
  try {
    console.log('[billplz-callback] Callback received');
    let bill_id, x_signature;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      bill_id = body.bill_id || body.id;
      x_signature = body.x_signature;
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      bill_id = formData.get('id'); // Billplz uses 'id' for bill_id
      x_signature = formData.get('x_signature');
    } else {
      // fallback: try formData
      const formData = await request.formData();
      bill_id = formData.get('id');
      x_signature = formData.get('x_signature');
    }

    if (!bill_id || !x_signature) {
      console.error('[billplz-callback] Missing required fields', { bill_id, x_signature });
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Verify payment with Billplz
    console.log('[billplz-callback] Verifying payment with Billplz', { bill_id });
    const payment = await verifyPayment({ bill_id, x_signature });
    console.log('[billplz-callback] Billplz payment verification result:', payment);
    if (!payment.paid || payment.state !== 'paid') {
      console.error('[billplz-callback] Payment not completed', payment);
      return NextResponse.json({ success: false, error: 'Payment not completed', payment }, { status: 402 });
    }

    // Get booking token and propertyId from Billplz references
    const bookingToken = payment.reference_1;
    const propertyId = payment.reference_2 || process.env.DEFAULT_PROPERTY_ID;
    if (!bookingToken || !propertyId) {
      console.error('[billplz-callback] Missing booking token or property ID', { bookingToken, propertyId });
      return NextResponse.json({ success: false, error: 'Missing booking token or property ID' }, { status: 400 });
    }

    // Fetch booking data from session store
    console.log('[billplz-callback] Fetching booking session', { bookingToken });
    const sessionRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/booking-session?token=${bookingToken}`);
    const sessionData = await sessionRes.json();
    console.log('[billplz-callback] Booking session data:', sessionData);
    if (!sessionData.success || !sessionData.bookingData) {
      console.error('[billplz-callback] Booking data not found for this token', { bookingToken });
      return NextResponse.json({ success: false, error: 'Booking data not found for this token' }, { status: 404 });
    }
    const bookingPayload = sessionData.bookingData;

    // Delete the booking session after use
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await supabase.from('booking_sessions').delete().eq('token', bookingToken);
      console.log('[billplz-callback] Booking session deleted from Supabase:', bookingToken);
    } catch (err) {
      console.error('[billplz-callback] Failed to delete booking session from Supabase:', err);
    }

    // Build rooms array from cart (each roomID gets its own entry)
    const rooms = bookingPayload.bookingCart.cart.flatMap((item: { roomIDs?: string[]; roomTypeID: string; rateId?: string; quantity?: number }) =>
      (item.roomIDs || []).map((roomID: string) => ({
        roomTypeID: item.roomTypeID,
        roomID,
        quantity: '1',
        roomRateID: item.rateId || '',
      }))
    );
    // Calculate total adults and children from all rooms
    const adults = bookingPayload.bookingCart.cart.reduce((sum: number, item: { adults?: number; quantity?: number }) => sum + (item.adults || 0) * (item.quantity || 1), 0);
    const children = bookingPayload.bookingCart.cart.reduce((sum: number, item: { children?: number; quantity?: number }) => sum + (item.children || 0) * (item.quantity || 1), 0);
    const reservationData = {
      propertyId,
      rooms,
      checkIn: bookingPayload.bookingCart.checkIn,
      checkOut: bookingPayload.bookingCart.checkOut,
      guestFirstName: bookingPayload.bookingData.firstName,
      guestLastName: bookingPayload.bookingData.lastName,
      guestEmail: bookingPayload.bookingData.email,
      country: bookingPayload.bookingData.country || 'MY',
      phone: bookingPayload.bookingData.phone,
      estimatedArrivalTime: bookingPayload.bookingData.estimatedArrivalTime,
      adults,
      children,
    };
    console.log('[billplz-callback] Creating reservation in Cloudbeds', reservationData);
    const reservation = await createReservation(reservationData);
    console.log('[billplz-callback] Cloudbeds reservation created:', reservation);

    // Add payment to reservation
    type CartItem = { price: number; quantity: number; [key: string]: unknown };
    const totalAmount = bookingPayload.bookingCart.cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
    console.log('[billplz-callback] Adding payment to Cloudbeds reservation', { propertyId, reservationId: reservation.reservationID, amount: Math.round(totalAmount * 100) });
    await addPaymentToReservation({ propertyId, reservationId: reservation.reservationID, amount: Math.round(totalAmount * 100), paymentMethod: 'credit_card' });
    console.log('[billplz-callback] Payment added to Cloudbeds reservation');

    // Save booking in DB only if userId is present
    let booking = null;
    if (bookingPayload.userId) {
      console.log('[billplz-callback] Saving booking in Supabase', { userId: bookingPayload.userId, cloudbedsResId: reservation.reservationID, cloudbedsPropertyId: propertyId });
      booking = await saveBookingInDB({ userId: bookingPayload.userId, cloudbedsResId: reservation.reservationID, cloudbedsPropertyId: propertyId });
      console.log('[billplz-callback] Booking saved in Supabase:', booking);
    }

    return NextResponse.json({ success: true, payment, reservation, booking });
  } catch (error) {
    console.error('[billplz-callback] Error in callback:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 