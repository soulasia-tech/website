import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { token, bookingData } = await request.json();
    if (!token || !bookingData) {
      return NextResponse.json({ success: false, error: 'Missing token or bookingData' }, { status: 400 });
    }
    const { error } = await supabase
      .from('booking_sessions')
      .upsert({ token, booking_data: bookingData });
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
  const { data, error } = await supabase
    .from('booking_sessions')
    .select('booking_data')
    .eq('token', token)
    .single();
  if (error || !data) {
    return NextResponse.json({ success: false, error: 'Booking session not found or expired' }, { status: 404 });
  }
  return NextResponse.json({ success: true, bookingData: data.booking_data });
} 