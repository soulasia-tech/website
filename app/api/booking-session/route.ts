import { NextResponse } from 'next/server';
import { getBookingSession, upsertBookingSession } from '@/lib/booking-session';

export async function POST(request: Request) {
  try {
    const { token, bookingData, payment_status, reservation_status, error_message } = await request.json();
    if (!token || !bookingData) {
      return NextResponse.json({ success: false, error: 'Missing token or bookingData' }, { status: 400 });
    }
    const upsertObj: Parameters<typeof upsertBookingSession>[0] = { token, booking_data: bookingData };
    if (payment_status !== undefined) upsertObj.payment_status = payment_status;
    if (reservation_status !== undefined) upsertObj.reservation_status = reservation_status;
    if (error_message !== undefined) upsertObj.error_message = error_message;
    const { error } = await upsertBookingSession(upsertObj);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (!token) {
    return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });
  }
  const { data, error } = await getBookingSession(token);
  if (error || !data) {
    return NextResponse.json({ success: false, error: 'Booking session not found or expired' }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    bookingData: data.booking_data,
    payment_status: data.payment_status,
    reservation_status: data.reservation_status,
    error_message: data.error_message,
  });
}
