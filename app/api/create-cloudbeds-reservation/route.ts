import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addPaymentToReservation } from '@/lib/cloudbeds';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    // Parse FormData from the request
    const formData = await request.formData();
    // Log all incoming fields for debugging
    for (const [key, value] of formData.entries()) {
      console.log(`Received field: ${key} =`, value);
    }
    // Extract required fields (use PascalCase as per Cloudbeds docs)
    const propertyID = formData.get('propertyID');
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
      return NextResponse.json({ success: false, message: cbData.message || 'Failed to create reservation in Cloudbeds', cloudbedsResponse: cbData }, { status: 500 });
    }
    // Optionally add payment if requested
    const addPayment = formData.get('addPayment');
    const amount = formData.get('amount');
    let paymentResult = null;
    if (addPayment && addPayment === 'true' && cbData.reservationID && amount) {
      try {
        paymentResult = await addPaymentToReservation({
          propertyId: propertyID.toString(),
          reservationId: cbData.reservationID,
          amount: Number(amount),
          paymentMethod: 'credit_card',
        });
      } catch (err) {
        console.error('Error adding payment to reservation:', err);
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