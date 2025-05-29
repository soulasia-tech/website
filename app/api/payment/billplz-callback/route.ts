import { NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/billplz';
import { createReservation, addPaymentToReservation } from '@/lib/cloudbeds';
import { saveBookingInDB } from '@/lib/booking';

interface CartItem {
  roomTypeID: string;
  roomName: string;
  price: number;
  quantity: number;
  maxAvailable: number;
  propertyId: string;
  propertyName: string;
  rateId?: string;
}

interface BookingCart {
  cart: CartItem[];
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  propertyId: string;
  city?: string;
}

interface BookingData {
  firstName: string;
  lastName: string;
  email: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomId: string;
  createAccount: boolean;
  password: string;
  phone?: string;
  estimatedArrivalTime?: string;
  country: string;
}

interface BookingPayload {
  bookingData: BookingData;
  bookingCart: BookingCart;
  propertyId: string;
  userId?: string;
}

export async function POST(request: Request) {
  try {
    const { bill_id, x_signature } = await request.json();

    if (!bill_id || !x_signature) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Verify payment with Billplz
    const payment = await verifyPayment({ bill_id, x_signature });
    if (!payment.paid || payment.state !== 'paid') {
      return NextResponse.json({ success: false, error: 'Payment not completed', payment }, { status: 402 });
    }

    // Get booking token and propertyId from Billplz references
    const bookingToken = payment.reference_1;
    const propertyId = payment.reference_2 || process.env.DEFAULT_PROPERTY_ID;
    if (!bookingToken || !propertyId) {
      return NextResponse.json({ success: false, error: 'Missing booking token or property ID' }, { status: 400 });
    }

    // Fetch booking data from session store
    const sessionRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/booking-session?token=${bookingToken}`);
    const sessionData = await sessionRes.json();
    if (!sessionData.success || !sessionData.bookingData) {
      return NextResponse.json({ success: false, error: 'Booking data not found for this token' }, { status: 404 });
    }
    const bookingPayload: BookingPayload = sessionData.bookingData;

    // Create reservation in Cloudbeds
    // (You may need to adapt this to your multi-room cart structure)
    // For now, assume single property, multi-room
    // You may need to loop over rooms if Cloudbeds API requires separate calls
    // Here, just pass the first room for demo
    const firstRoom = bookingPayload.bookingCart.cart[0];
    const reservationData = {
      propertyId,
      roomId: firstRoom.roomTypeID,
      checkIn: bookingPayload.bookingCart.checkIn,
      checkOut: bookingPayload.bookingCart.checkOut,
      guests: bookingPayload.bookingCart.adults,
      guestFirstName: bookingPayload.bookingData.firstName,
      guestLastName: bookingPayload.bookingData.lastName,
      guestEmail: bookingPayload.bookingData.email,
      country: bookingPayload.bookingData.country || 'MY',
      rateId: firstRoom.rateId || '',
      phone: bookingPayload.bookingData.phone,
      estimatedArrivalTime: bookingPayload.bookingData.estimatedArrivalTime,
      children: bookingPayload.bookingCart.children,
    };
    const reservation = await createReservation(reservationData);

    // Add payment to reservation
    const totalAmount = bookingPayload.bookingCart.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await addPaymentToReservation({ propertyId, reservationId: reservation.reservationID, amount: Math.round(totalAmount * 100), paymentMethod: 'credit_card' });

    // Save booking in DB only if userId is present
    let booking = null;
    if (bookingPayload.userId) {
      booking = await saveBookingInDB({ userId: bookingPayload.userId, reservationId: reservation.reservationID, amount: Math.round(totalAmount * 100) });
    }

    return NextResponse.json({ success: true, payment, reservation, booking });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 