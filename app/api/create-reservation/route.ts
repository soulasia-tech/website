import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface RoomData {
  roomTypeID: string;
  roomID: string;
  quantity: string;
  roomRateID: string;
}

interface GuestData {
  roomTypeID: string;
  roomID: string;
  quantity: string;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Get all form fields
    const propertyId = formData.get('propertyId');
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');
    const guestFirstName = formData.get('guestFirstName');
    const guestLastName = formData.get('guestLastName');
    const guestEmail = formData.get('guestEmail');
    const guestCountry = formData.get('guestCountry');
    const guestZip = formData.get('guestZip');
    const paymentMethod = formData.get('paymentMethod');
    const sendEmailConfirmation = formData.get('sendEmailConfirmation');
    const guestPhone = formData.get('guestPhone');
    const estimatedArrivalTime = formData.get('estimatedArrivalTime');
    
    // Parse JSON strings back to objects
    let rooms: RoomData[] = [];
    let adults: GuestData[] = [];
    let children: GuestData[] = [];
    try {
      const roomsRaw = formData.get('rooms');
      if (typeof roomsRaw === 'string') {
        rooms = JSON.parse(roomsRaw) as RoomData[];
      } else {
        return NextResponse.json({ success: false, error: 'Invalid or missing rooms data' }, { status: 400 });
      }
      const adultsRaw = formData.get('adults');
      if (typeof adultsRaw === 'string') {
        adults = JSON.parse(adultsRaw) as GuestData[];
      } else {
        return NextResponse.json({ success: false, error: 'Invalid or missing adults data' }, { status: 400 });
      }
      const childrenRaw = formData.get('children');
      if (childrenRaw && typeof childrenRaw === 'string') {
        children = JSON.parse(childrenRaw) as GuestData[];
      } else {
        children = [];
      }
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON in rooms, adults, or children' }, { status: 400 });
    }

    // Validate required fields
    if (!propertyId || !startDate || !endDate || !guestFirstName || 
        !guestLastName || !guestEmail || !guestCountry || !guestZip || 
        !rooms || !adults) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get API keys from Supabase
    const { data: property, error: propertyError } = await supabase
      .from('cloudbeds_properties')
      .select('api_key')
      .eq('property_id', propertyId)
      .single();

    if (propertyError || !property) {
      console.error('Error fetching property API key:', propertyError);
      return NextResponse.json({
        success: false,
        error: 'API key not found for property'
      }, { status: 500 });
    }

    // Prepare the request to Cloudbeds API
    const cloudbedsUrl = 'https://hotels.cloudbeds.com/api/v1.1/postReservation';
    const requestHeaders = new Headers();
    requestHeaders.append('Authorization', `Bearer ${property.api_key}`);
    requestHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

    // Convert FormData to URLSearchParams for Cloudbeds API
    const params = new URLSearchParams();
    params.append('propertyID', propertyId as string);
    params.append('startDate', startDate as string);
    params.append('endDate', endDate as string);
    params.append('guestFirstName', guestFirstName as string);
    params.append('guestLastName', guestLastName as string);
    params.append('guestEmail', guestEmail as string);
    params.append('guestCountry', guestCountry as string);
    params.append('guestZip', guestZip as string);
    params.append('paymentMethod', paymentMethod as string);
    params.append('sendEmailConfirmation', sendEmailConfirmation as string);

    if (guestPhone) {
      params.append('guestPhone', guestPhone as string);
    }
    if (estimatedArrivalTime) {
      params.append('estimatedArrivalTime', estimatedArrivalTime as string);
    }

    // Add room data
    rooms.forEach((room: RoomData, index: number) => {
      params.append(`rooms[${index}][roomTypeID]`, room.roomTypeID);
      params.append(`rooms[${index}][roomID]`, room.roomID);
      params.append(`rooms[${index}][quantity]`, room.quantity);
      params.append(`rooms[${index}][roomRateID]`, room.roomRateID);
    });

    // Add adults data
    adults.forEach((adult: GuestData, index: number) => {
      params.append(`adults[${index}][roomTypeID]`, adult.roomTypeID);
      params.append(`adults[${index}][roomID]`, adult.roomID);
      params.append(`adults[${index}][quantity]`, adult.quantity);
    });

    // Add children data (always, even if empty)
    let childrenToSend = children;
    if (!childrenToSend || childrenToSend.length === 0) {
      childrenToSend = [{
        roomTypeID: rooms[0].roomTypeID,
        roomID: rooms[0].roomID,
        quantity: "0"
      }];
    }
    childrenToSend.forEach((child: GuestData, index: number) => {
        params.append(`children[${index}][roomTypeID]`, child.roomTypeID);
        params.append(`children[${index}][roomID]`, child.roomID);
        params.append(`children[${index}][quantity]`, child.quantity);
      });

    // Make the request to Cloudbeds API
    const response = await fetch(cloudbedsUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: params
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cloudbeds API error:', data);
      return NextResponse.json({
        success: false,
        error: data.message || 'Failed to create reservation'
      }, { status: response.status });
    }

    // --- Handle payment-only requests ---
    const addPayment = formData.get('addPayment');
    const amount = formData.get('amount');
    const reservationID = formData.get('reservationID');
    if (addPayment && amount && reservationID && propertyId) {
      try {
        const { addPaymentToReservation, getReservation } = await import('@/lib/cloudbeds');
        // Fetch reservation details to get grand total
        let paidAmount = Number(amount);
        try {
          const reservation = await getReservation(propertyId.toString(), reservationID.toString());
          paidAmount = reservation?.grandTotal || reservation?.grand_total || reservation?.total || paidAmount;
        } catch (err) {
          console.error('Failed to fetch reservation or extract grand total, falling back to original amount:', err);
        }
        console.log('Posting payment to Cloudbeds (payment-only request):', { propertyId, reservationID, paidAmount });
        const paymentResult = await addPaymentToReservation({
          propertyId: propertyId.toString(),
          reservationId: reservationID.toString(),
          amount: Number(paidAmount),
          paymentMethod: 'credit_card',
        });
        console.log('Payment posted to Cloudbeds:', paymentResult);
        return NextResponse.json({ success: true, paymentResult });
      } catch (err) {
        console.error('Error adding payment to reservation (payment-only request):', err);
        return NextResponse.json({ success: false, paymentError: err instanceof Error ? err.message : String(err) }, { status: 500 });
      }
    }

    // --- Add payment to reservation if amount is present ---
    let paymentResult = null;
    if (data.reservationID && amount) {
      try {
        // Dynamically import addPaymentToReservation and getReservation to avoid circular deps
        const { addPaymentToReservation, getReservation } = await import('@/lib/cloudbeds');
        // Fetch reservation details to get grand total
        let paidAmount = Number(amount);
        try {
          const reservation = await getReservation(propertyId.toString(), data.reservationID);
          paidAmount = reservation?.grandTotal || reservation?.grand_total || reservation?.total || paidAmount;
        } catch (err) {
          console.error('Failed to fetch reservation or extract grand total, falling back to original amount:', err);
        }
        console.log('Posting payment to Cloudbeds:', { propertyId, reservationID: data.reservationID, paidAmount });
        paymentResult = await addPaymentToReservation({
          propertyId: propertyId.toString(),
          reservationId: data.reservationID,
          amount: Number(paidAmount),
          paymentMethod: 'credit_card',
        });
        console.log('Payment posted to Cloudbeds:', paymentResult);
      } catch (err) {
        console.error('Error adding payment to reservation:', err);
        // Still return reservation, but include payment error
        return NextResponse.json({
          success: true,
          data: {
            reservationID: data.reservationID,
            status: data.status
          },
          paymentError: err instanceof Error ? err.message : String(err)
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        reservationID: data.reservationID,
        status: data.status
      },
      paymentResult
    });

  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 