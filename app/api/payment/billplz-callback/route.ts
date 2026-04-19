import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyPayment } from '@/lib/billplz';
import { createReservation, addPaymentToReservation } from '@/lib/cloudbeds';
import { saveBookingInDB } from '@/lib/booking';
import { getBookingSession, upsertBookingSession } from '@/lib/booking-session';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    console.log('[billplz-callback] Callback received');
    let params: Record<string, string> = {};
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      params = Object.fromEntries(Object.entries(body).map(([k, v]) => [k, String(v)]));
    } else {
      const formData = await request.formData();
      formData.forEach((value, key) => { params[key] = String(value); });
    }
    const x_signature = params.x_signature;
    const bill_id = params.id || params.bill_id;

    if (!bill_id || !x_signature) {
      console.error('[billplz-callback] Missing required fields', { bill_id, x_signature });
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Verify payment with Billplz (includes x_signature check)
    console.log('[billplz-callback] Verifying payment with Billplz', { bill_id });
    const payment = await verifyPayment({ params, x_signature });
    console.log('[billplz-callback] Billplz payment verification result:', payment);
    if (!payment.paid || payment.state !== 'paid') {
      // Update booking session: payment failed
      if (payment.reference_1) {
        await upsertBookingSession({
          token: payment.reference_1,
          booking_data: {},
          payment_status: 'failed',
          reservation_status: 'failed',
          error_message: 'Payment not completed',
        });
      }
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
    const { data: sessionRow } = await getBookingSession(bookingToken);
    const sessionData = sessionRow
      ? { success: true, bookingData: sessionRow.booking_data }
      : { success: false, bookingData: null };
    console.log('[billplz-callback] Booking session data:', sessionData);
    if (!sessionData.success || !sessionData.bookingData) {
      // Update booking session: reservation failed (no booking data)
      await upsertBookingSession({
        token: bookingToken,
        booking_data: {},
        payment_status: 'succeeded',
        reservation_status: 'failed',
        error_message: 'Booking data not found for this token',
      });
      console.error('[billplz-callback] Booking data not found for this token', { bookingToken });
      return NextResponse.json({ success: false, error: 'Booking data not found for this token' }, { status: 404 });
    }
    const bookingPayload = sessionData.bookingData;

    // Idempotency check: if cloudbedsResId exists, do not create a new reservation
    if (bookingPayload.cloudbedsResId) {
      console.log('[billplz-callback] Idempotency: Reservation already exists for this booking token:', bookingPayload.cloudbedsResId);
      return NextResponse.json({ success: true, message: 'Reservation already exists for this booking token', reservationId: bookingPayload.cloudbedsResId });
    }

    // Atomic claim: set reservation_status = 'processing' only if not already processing/succeeded.
    // Prevents duplicate Cloudbeds reservations when Billplz fires the webhook more than once.
    const { data: claimed } = await supabase
      .from('booking_sessions')
      .update({ reservation_status: 'processing' })
      .eq('token', bookingToken)
      .or('reservation_status.is.null,reservation_status.eq.failed')
      .select('token');
    if (!claimed || claimed.length === 0) {
      console.log('[billplz-callback] Reservation already processing or completed, skipping duplicate webhook', { bookingToken });
      return NextResponse.json({ success: true, message: 'Reservation already being processed or completed' });
    }

    // Build rooms array from cart (each roomID gets its own entry)
    const rooms = bookingPayload.bookingCart.cart.flatMap((item: { roomIDs?: string[]; roomTypeID: string; rateId?: string; ratePlanName?: string; quantity?: number; roomName?: string }) =>
      (item.roomIDs || []).map((roomID: string) => {
        // Strict validation: ensure rateId and ratePlanName are present and valid
        if (!item.rateId || !item.ratePlanName ||
          (item.ratePlanName !== "Book Direct and Save – Up to 30% Cheaper Than Online Rates!")) {
          console.error('[billplz-callback] ERROR: Missing or invalid discounted rateId or ratePlanName for room', {
            roomTypeID: item.roomTypeID,
            roomName: item.roomName,
            rateId: item.rateId,
            ratePlanName: item.ratePlanName
          });
          throw new Error(`Cannot create reservation: missing or invalid discounted rateId for room ${item.roomTypeID}`);
        }
        console.log('[billplz-callback] Using discounted rateId for room', {
          roomTypeID: item.roomTypeID,
          roomName: item.roomName,
          rateId: item.rateId,
          ratePlanName: item.ratePlanName
        });
        return {
          roomTypeID: item.roomTypeID,
          roomID,
          quantity: '1',
          roomRateID: item.rateId,
        };
      })
    );
    if (!rooms.length) {
      // Update booking session: reservation failed (no rooms)
      await upsertBookingSession({
        token: bookingToken,
        booking_data: bookingPayload,
        payment_status: 'succeeded',
        reservation_status: 'failed',
        error_message: 'No rooms found in booking cart. Cannot create reservation.',
      });
      console.error('[billplz-callback] No rooms found in booking cart. Cannot create reservation.', { bookingToken, bookingCart: bookingPayload.bookingCart });
      return NextResponse.json({ success: false, error: 'No rooms found in booking cart. Cannot create reservation.' }, { status: 400 });
    }
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
    if (!reservation || reservation.success === false || !reservation.reservationID) {
      // Update booking session: reservation failed (Cloudbeds error)
      await upsertBookingSession({
        token: bookingToken,
        booking_data: bookingPayload,
        payment_status: 'succeeded',
        reservation_status: 'failed',
        error_message: 'Failed to create reservation in Cloudbeds',
      });
      console.error('[billplz-callback] Failed to create reservation in Cloudbeds:', reservation);
      return NextResponse.json({ success: false, error: 'Failed to create reservation in Cloudbeds', details: reservation }, { status: 500 });
    }

    // Add payment to reservation
    // Fetch reservation details to get the grand total
    const { getReservation } = await import('@/lib/cloudbeds');
    const reservationDetails = await getReservation(propertyId, reservation.reservationID);
    const grandTotal = reservationDetails.grandTotal || reservationDetails.total || reservationDetails.grand_total;
    const paidAmount = payment.amount;
    // Convert Billplz paid amount from cents to MYR for comparison
    const paidAmountMYR = Number(paidAmount) / 100;
    if (Number(paidAmountMYR) !== Number(grandTotal)) {
      console.warn('[billplz-callback] WARNING: Paid amount does not match Cloudbeds grand total', { paidAmount: paidAmountMYR, grandTotal, propertyId, reservationId: reservation.reservationID });
    }
    console.log('[billplz-callback] Adding payment to Cloudbeds reservation', { propertyId, reservationId: reservation.reservationID, amount: grandTotal });
    await addPaymentToReservation({ propertyId, reservationId: reservation.reservationID, amount: grandTotal, paymentMethod: 'credit_card' });
    console.log('[billplz-callback] Payment added to Cloudbeds reservation');

    // Save booking in DB only if userId is present
    let booking = null;
    if (bookingPayload.userId) {
      console.log('[billplz-callback] Saving booking in Supabase', { userId: bookingPayload.userId, cloudbedsResId: reservation.reservationID, cloudbedsPropertyId: propertyId });
      booking = await saveBookingInDB({ userId: bookingPayload.userId, cloudbedsResId: reservation.reservationID, cloudbedsPropertyId: propertyId });
      console.log('[billplz-callback] Booking saved in Supabase:', booking);
    }

    // Update booking session: all succeeded, and store cloudbedsResId for idempotency
    await upsertBookingSession({
      token: bookingToken,
      booking_data: { ...bookingPayload, cloudbedsResId: reservation.reservationID },
      payment_status: 'succeeded',
      reservation_status: 'succeeded',
      error_message: null,
    });

    return NextResponse.json({ success: true, payment, reservation, booking });
  } catch (error) {
    // Try to update booking session with error
    try {
      const bookingToken = (typeof error === 'object' && error && 'bookingToken' in error) ? error.bookingToken as string : undefined;
      if (bookingToken) {
        await upsertBookingSession({
          token: bookingToken,
          booking_data: {},
          payment_status: 'failed',
          reservation_status: 'failed',
          error_message: error instanceof Error ? error.message : String(error),
        });
      }
    } catch {}
    console.error('[billplz-callback] Error in callback:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 