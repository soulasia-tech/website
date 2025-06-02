import { createClient } from '@supabase/supabase-js';

const CLOUDBEDS_API_BASE = 'https://hotels.cloudbeds.com/api/v1.2';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function getCloudbedsProperty(propertyId: string) {
  const { data, error } = await supabase
    .from('cloudbeds_properties')
    .select('*')
    .eq('property_id', propertyId)
    .single();
  if (error || !data) {
    throw new Error('Cloudbeds property not found or DB error');
  }
  return data;
}

export async function getRoomTypes(propertyId: string) {
  const property = await getCloudbedsProperty(propertyId);
  const url = `${CLOUDBEDS_API_BASE}/getRoomTypes?propertyID=${propertyId}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${property.api_key}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Cloudbeds API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!data.success) {
    throw new Error(`Cloudbeds API error: ${data.message}`);
  }
  return data.data;
}

export async function getRooms(propertyId: string) {
  const property = await getCloudbedsProperty(propertyId);
  const url = `${CLOUDBEDS_API_BASE}/getRooms?propertyID=${propertyId}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${property.api_key}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Cloudbeds API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!data.success) {
    throw new Error(`Cloudbeds API error: ${data.message}`);
  }
  return data.data;
}

export async function getRatePlans(propertyId: string, startDate: string, endDate: string) {
  const property = await getCloudbedsProperty(propertyId);
  const url = `${CLOUDBEDS_API_BASE}/getRatePlans?propertyID=${propertyId}&startDate=${startDate}&endDate=${endDate}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${property.api_key}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Cloudbeds API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!data.success) {
    throw new Error(`Cloudbeds API error: ${data.message}`);
  }
  return data.data;
}

export async function getHotelDetails(propertyId: string) {
  const property = await getCloudbedsProperty(propertyId);
  const url = `${CLOUDBEDS_API_BASE}/getHotelDetails?propertyID=${propertyId}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${property.api_key}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Cloudbeds API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!data.success) {
    throw new Error(`Cloudbeds API error: ${data.message}`);
  }
  return data.data;
}

export async function getReservation(propertyId: string, reservationId: string) {
  const property = await getCloudbedsProperty(propertyId);
  const url = `${CLOUDBEDS_API_BASE}/getReservation?propertyID=${propertyId}&reservationID=${reservationId}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${property.api_key}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Cloudbeds API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!data.success) {
    throw new Error(`Cloudbeds API error: ${data.message}`);
  }
  return data.data;
}

export interface RoomData {
  roomTypeID: string;
  roomID: string;
  quantity: string;
  roomRateID: string;
}

export interface BookingData {
  propertyId: string;
  rooms: RoomData[];
  checkIn: string;
  checkOut: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  country: string;
  phone?: string;
  estimatedArrivalTime?: string;
  adults: number;
  children: number;
}

export async function createReservation(bookingData: BookingData) {
  // Fetch property API key
  const property = await getCloudbedsProperty(bookingData.propertyId);
  const cloudbedsUrl = 'https://hotels.cloudbeds.com/api/v1.1/postReservation';
  const requestHeaders = new Headers();
  requestHeaders.append('Authorization', `Bearer ${property.api_key}`);
  requestHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

  // Convert to URLSearchParams
  const params = new URLSearchParams();
  params.append('propertyID', bookingData.propertyId);
  params.append('startDate', bookingData.checkIn);
  params.append('endDate', bookingData.checkOut);
  params.append('guestFirstName', bookingData.guestFirstName);
  params.append('guestLastName', bookingData.guestLastName);
  params.append('guestEmail', bookingData.guestEmail);
  params.append('guestCountry', bookingData.country);
  params.append('guestZip', '00000');
  params.append('paymentMethod', 'credit_card');
  params.append('sendEmailConfirmation', 'true');
  if (bookingData.phone) params.append('guestPhone', bookingData.phone);
  if (bookingData.estimatedArrivalTime) params.append('estimatedArrivalTime', bookingData.estimatedArrivalTime);

  // Add all rooms
  bookingData.rooms.forEach((room, index) => {
    params.append(`rooms[${index}][roomTypeID]`, room.roomTypeID);
    params.append(`rooms[${index}][roomID]`, room.roomID);
    params.append(`rooms[${index}][quantity]`, room.quantity);
    params.append(`rooms[${index}][roomRateID]`, room.roomRateID);
  });

  // Add adults and children (total for all rooms)
  params.append('adults', bookingData.adults.toString());
  params.append('children', bookingData.children.toString());

  // Call Cloudbeds API
  console.log('[createReservation] Sending reservation to Cloudbeds:', {
    url: cloudbedsUrl,
    params: params.toString(),
    bookingData
  });
  const response = await fetch(cloudbedsUrl, {
    method: 'POST',
    headers: requestHeaders,
    body: params,
  });
  let data;
  try {
    data = await response.json();
    console.log('[createReservation] Cloudbeds API response:', data);
  } catch {
    const text = await response.text();
    console.error('[createReservation] Cloudbeds API returned non-JSON:', text);
    throw new Error('Cloudbeds API returned non-JSON: ' + text);
  }
  if (!response.ok) {
    console.error('[createReservation] Cloudbeds API error:', data);
    throw new Error(data.message || 'Failed to create reservation');
  }
  return {
    reservationID: data.reservationID,
    status: data.status,
  };
}

export async function addPaymentToReservation({ propertyId, reservationId, amount, paymentMethod = 'credit_card', note = 'Paid via Billplz' }: {
  propertyId: string;
  reservationId: string;
  amount: number;
  paymentMethod?: string;
  note?: string;
}) {
  const property = await getCloudbedsProperty(propertyId);
  const cloudbedsUrl = 'https://hotels.cloudbeds.com/api/v1.1/postPayment';
  const requestHeaders = new Headers();
  requestHeaders.append('Authorization', `Bearer ${property.api_key}`);
  requestHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

  const params = new URLSearchParams();
  params.append('propertyID', propertyId);
  params.append('reservationID', reservationId);
  params.append('amount', amount.toString());
  params.append('paymentMethod', paymentMethod);
  params.append('note', note);
  params.append('type', 'Billplz');

  // Detailed logging
  console.log('Posting payment to Cloudbeds:', {
    url: cloudbedsUrl,
    propertyId,
    reservationId,
    amount,
    paymentMethod,
    note,
    type: 'Billplz',
    params: params.toString()
  });

  const response = await fetch(cloudbedsUrl, {
    method: 'POST',
    headers: requestHeaders,
    body: params,
  });
  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
    console.log('Cloudbeds payment API JSON response:', data);
  } else {
    const text = await response.text();
    console.error('Cloudbeds payment API returned non-JSON:', text);
    throw new Error('Cloudbeds payment API returned non-JSON: ' + text);
  }
  if (!response.ok) {
    throw new Error(data.message || 'Failed to add payment to reservation');
  }
  return data;
} 