import { NextResponse } from 'next/server';
import { getRooms } from '@/lib/cloudbeds';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId') || '19928';
  try {
    const rooms = await getRooms(propertyId);
    return NextResponse.json({ success: true, rooms });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
} 