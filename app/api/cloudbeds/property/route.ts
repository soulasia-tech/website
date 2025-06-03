import { NextResponse } from 'next/server';
import { getHotelDetails } from '@/lib/cloudbeds';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId') || '19928';
  try {
    const hotel = await getHotelDetails(propertyId);
    return NextResponse.json({ success: true, hotel });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[cloudbeds/property] Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
} 