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

export async function getRooms(propertyId: string, pageSize?: number) {
  const property = await getCloudbedsProperty(propertyId);
  let url = `${CLOUDBEDS_API_BASE}/getRooms?propertyID=${propertyId}`;
  if (pageSize) {
    url += `&pageSize=${pageSize}`;
  }

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
  adults?: number;
  children?: number;
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
  const cloudbedsUrl = 'https://hotels.cloudbeds.com/api/v1.2/postReservation';
  const requestHeaders = new Headers();
  requestHeaders.append('Authorization', `Bearer ${property.api_key}`);
  // Do NOT set Content-Type; fetch will set it for FormData

  // Prepare FormData
  const formData = new FormData();
  formData.append('propertyID', bookingData.propertyId);
  formData.append('startDate', bookingData.checkIn);
  formData.append('endDate', bookingData.checkOut);
  formData.append('guestFirstName', bookingData.guestFirstName);
  formData.append('guestLastName', bookingData.guestLastName);
  formData.append('guestEmail', bookingData.guestEmail);
  formData.append('guestCountry', bookingData.country);
  formData.append('guestZip', '00000');
  formData.append('paymentMethod', 'credit_card');
  formData.append('sendEmailConfirmation', 'true');
  if (bookingData.phone) formData.append('guestPhone', bookingData.phone);
  if (bookingData.estimatedArrivalTime) formData.append('estimatedArrivalTime', bookingData.estimatedArrivalTime);

  // Add rooms, adults, and children as arrays of objects
  bookingData.rooms.forEach((room, index) => {
    formData.append(`rooms[${index}][roomTypeID]`, room.roomTypeID);
    formData.append(`rooms[${index}][roomID]`, room.roomID);
    formData.append(`rooms[${index}][quantity]`, room.quantity.toString());
    if (room.roomRateID && room.roomRateID.trim() !== '') {
      formData.append(`rooms[${index}][roomRateID]`, room.roomRateID);
    }
    // Adults per room
    formData.append(`adults[${index}][roomTypeID]`, room.roomTypeID);
    formData.append(`adults[${index}][roomID]`, room.roomID);
    formData.append(`adults[${index}][quantity]`, (room.adults || 2).toString());
    // Children per room
    formData.append(`children[${index}][roomTypeID]`, room.roomTypeID);
    formData.append(`children[${index}][roomID]`, room.roomID);
    formData.append(`children[${index}][quantity]`, (room.children || 0).toString());
  });

  // Call Cloudbeds API
  console.log('[createReservation] Sending reservation to Cloudbeds (multipart/form-data)', { url: cloudbedsUrl, bookingData });
  const response = await fetch(cloudbedsUrl, {
    method: 'POST',
    headers: requestHeaders,
    body: formData,
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
  if (!response.ok || !data.reservationID) {
    console.error('[createReservation] Cloudbeds API error:', data);
    return { success: false, message: data.message || 'Failed to create reservation', cloudbedsResponse: data };
  }
  return {
    reservationID: data.reservationID,
    status: data.status,
    success: true,
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
