import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { propertyID, ...bookingData } = body;
    if (!propertyID) {
      return NextResponse.json({ success: false, message: 'Missing propertyID' }, { status: 400 });
    }
    // Fetch API key for the property
    const { data, error } = await supabase
      .from('cloudbeds_properties')
      .select('api_key')
      .eq('property_id', propertyID)
      .single();
    if (error || !data) {
      return NextResponse.json({ success: false, message: 'API key not found for property' }, { status: 404 });
    }
    const apiKey = data.api_key;
    // Call Cloudbeds API
    console.log('Booking data sent to Cloudbeds:', bookingData);
    const cbRes = await fetch(`https://api.cloudbeds.com/api/v1.2/postReservation?propertyID=${propertyID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      }
    );
    const cbData = await cbRes.json();
    if (!cbData.success) {
      console.error('Cloudbeds API error response:', cbData);
      return NextResponse.json({ success: false, message: cbData.message || 'Failed to create reservation in Cloudbeds', cloudbedsResponse: cbData }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: cbData });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error creating reservation in Cloudbeds';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 