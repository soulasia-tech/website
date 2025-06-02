import { NextResponse } from 'next/server';
import { getRooms } from '@/lib/cloudbeds';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'propertyId is required' }, { status: 400 });
    }
    const rooms = await getRooms(propertyId);
    return NextResponse.json({ success: true, rooms });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 