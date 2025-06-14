import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addPaymentToReservation, getRoomTypes } from '@/lib/cloudbeds';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Add types for room validation
interface RoomType { roomTypeID: string; }
interface RoomSelection { roomTypeID: string; quantity: string | number; }

export async function POST(request: Request) {
  try {
    // Parse FormData from the request
    const formData = await request.formData();
    // Extract required fields (use PascalCase as per Cloudbeds docs)
    const propertyID = formData.get('propertyID');
    if (!propertyID) {
      return NextResponse.json({ success: false, message: 'Missing propertyID' }, { status: 400 });
    }
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');
    const guestFirstName = formData.get('guestFirstName');
    const guestLastName = formData.get('guestLastName');
    const guestEmail = formData.get('guestEmail');
    const paymentMethod = formData.get('paymentMethod');
    const roomsRaw = formData.get('rooms');
    if (!startDate || !endDate || !guestFirstName || !guestLastName || !guestEmail || !paymentMethod || !roomsRaw) {
      return NextResponse.json({ success: false, message: 'Missing one or more required fields: startDate, endDate, guestFirstName, guestLastName, guestEmail, paymentMethod, rooms' }, { status: 400 });
    }
    // Validate all roomTypeIDs belong to the property
    let rooms: RoomSelection[] = [];
    try {
      if (typeof roomsRaw === 'string') {
        rooms = JSON.parse(roomsRaw as string);
      } else {
        return NextResponse.json({ success: false, message: 'Invalid rooms format. Must be a JSON array.' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid rooms format. Must be a JSON array.' }, { status: 400 });
    }
    const validRoomTypes: RoomType[] = await getRoomTypes(propertyID.toString());
    const validRoomTypeIDs = new Set(validRoomTypes.map((rt) => rt.roomTypeID));
    const invalidRoomTypeIDs = rooms.filter((r) => !validRoomTypeIDs.has(r.roomTypeID)).map((r) => r.roomTypeID);
    if (invalidRoomTypeIDs.length > 0) {
      return NextResponse.json({ success: false, message: `Invalid roomTypeID(s) for property ${propertyID}: ${invalidRoomTypeIDs.join(', ')}` }, { status: 400 });
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
    // Prepare FormData to send to Cloudbeds
    const cbFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      cbFormData.append(key, value);
    }
    // Call Cloudbeds API with multipart/form-data
    const cbRes = await fetch(`https://api.cloudbeds.com/api/v1.2/postReservation?propertyID=${propertyID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
          // Do NOT set Content-Type; fetch will set it for FormData
        },
        body: cbFormData,
      }
    );
    const cbData = await cbRes.json();
    if (!cbData.success) {
      console.error('Cloudbeds API error response:', cbData);
      return NextResponse.json({ success: false, message: cbData.message || 'Failed to create reservation in Cloudbeds', cloudbedsResponse: cbData }, { status: 400 });
    }
    // Optionally add payment if requested
    const amount = formData.get('amount');
    let paymentResult = null;
    if (cbData.reservationID && amount) {
      try {
        paymentResult = await addPaymentToReservation({
          propertyId: propertyID.toString(),
          reservationId: cbData.reservationID,
          amount: Number(amount),
          paymentMethod: 'credit_card',
        });
      } catch (err) {
        // Still return reservation, but include payment error
        return NextResponse.json({ success: true, data: cbData, paymentError: err instanceof Error ? err.message : String(err) });
      }
    }
    return NextResponse.json({ success: true, data: cbData, paymentResult });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Error creating reservation in Cloudbeds';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
} 