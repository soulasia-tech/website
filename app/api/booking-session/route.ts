import { NextResponse } from 'next/server';

interface BookingSessionData {
  bookingData: unknown; // Replace 'unknown' with a more specific type if possible
}

// In-memory store for booking sessions (token -> { data, timestamp })
const bookingSessions: Record<string, { data: BookingSessionData; timestamp: number }> = {};
const EXPIRY_MS = 2 * 60 * 60 * 1000; // 2 hours

function cleanup() {
  const now = Date.now();
  for (const [token, { timestamp }] of Object.entries(bookingSessions)) {
    if (now - timestamp > EXPIRY_MS) {
      delete bookingSessions[token];
    }
  }
}

export async function POST(request: Request) {
  cleanup();
  try {
    const { token, bookingData } = await request.json();
    if (!token || !bookingData) {
      return NextResponse.json({ success: false, error: 'Missing token or bookingData' }, { status: 400 });
    }
    bookingSessions[token] = { data: { bookingData }, timestamp: Date.now() };
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function GET(request: Request) {
  cleanup();
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (!token) {
    return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });
  }
  const session = bookingSessions[token];
  if (!session) {
    return NextResponse.json({ success: false, error: 'Booking session not found or expired' }, { status: 404 });
  }
  return NextResponse.json({ success: true, bookingData: session.data.bookingData });
} 