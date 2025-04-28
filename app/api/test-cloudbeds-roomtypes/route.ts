import { NextResponse } from 'next/server';
import { getRoomTypes } from '@/lib/cloudbeds';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId') || '19928';
  try {
    const roomTypes = await getRoomTypes(propertyId);
    return NextResponse.json({ success: true, roomTypes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 