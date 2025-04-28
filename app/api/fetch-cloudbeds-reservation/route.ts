import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId');
  const reservationId = searchParams.get('reservationId');
  if (!propertyId || !reservationId) {
    return NextResponse.json({ success: false, message: 'Missing propertyId or reservationId' }, { status: 400 });
  }
  // Fetch API key from DB
  const { data, error } = await supabase
    .from('cloudbeds_properties')
    .select('api_key')
    .eq('property_id', propertyId)
    .single();
  if (error || !data) {
    return NextResponse.json({ success: false, message: 'API key not found for property' }, { status: 404 });
  }
  const apiKey = data.api_key;
  // Call Cloudbeds API
  try {
    const cbRes = await fetch(`https://api.cloudbeds.com/api/v1.2/getReservation?propertyID=${propertyId}&reservationID=${reservationId}`,
      { headers: { 'Authorization': `Bearer ${apiKey}` } });
    const cbData = await cbRes.json();
    if (!cbData.success) {
      return NextResponse.json({ success: false, message: cbData.message || 'Failed to fetch from Cloudbeds' }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: cbData.data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || 'Error fetching from Cloudbeds' }, { status: 500 });
  }
} 