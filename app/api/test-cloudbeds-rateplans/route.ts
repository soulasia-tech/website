import { NextResponse } from 'next/server';
import { getRatePlans } from '@/lib/cloudbeds';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId') || '19928';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json({ success: false, error: 'Missing startDate or endDate' }, { status: 400 });
  }

  try {
    const ratePlans = await getRatePlans(propertyId, startDate, endDate);
    return NextResponse.json({ success: true, ratePlans });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 