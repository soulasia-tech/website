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

export interface BookingData {
  propertyId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  country: string;
  rateId: string;
  phone?: string;
  estimatedArrivalTime?: string;
}

export async function createReservation(bookingData: BookingData) {
  // Fetch property API key
  const property = await getCloudbedsProperty(bookingData.propertyId);
  const cloudbedsUrl = 'https://hotels.cloudbeds.com/api/v1.1/postReservation';
  const requestHeaders = new Headers();
  requestHeaders.append('Authorization', `Bearer ${property.api_key}`);
  requestHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

  // Prepare room and guest data
  const rooms = [{
    roomTypeID: bookingData.roomId,
    roomID: `${bookingData.roomId}-1`,
    quantity: '1',
    roomRateID: bookingData.rateId,
  }];
  const adults = Array.from({ length: bookingData.guests }).map(() => ({
    roomTypeID: bookingData.roomId,
    roomID: `${bookingData.roomId}-1`,
    quantity: '1',
  }));
  const children: { roomTypeID: string; roomID: string; quantity: string }[] = [];

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
  params.append('paymentMethod', 'cash');
  params.append('sendEmailConfirmation', 'true');
  if (bookingData.phone) params.append('guestPhone', bookingData.phone);
  if (bookingData.estimatedArrivalTime) params.append('estimatedArrivalTime', bookingData.estimatedArrivalTime);

  rooms.forEach((room, index) => {
    params.append(`rooms[${index}][roomTypeID]`, room.roomTypeID);
    params.append(`rooms[${index}][roomID]`, room.roomID);
    params.append(`rooms[${index}][quantity]`, room.quantity);
    params.append(`rooms[${index}][roomRateID]`, room.roomRateID);
  });
  adults.forEach((adult, index) => {
    params.append(`adults[${index}][roomTypeID]`, adult.roomTypeID);
    params.append(`adults[${index}][roomID]`, adult.roomID);
    params.append(`adults[${index}][quantity]`, adult.quantity);
  });
  // Always add children as an empty array
  params.append('children', JSON.stringify(children));

  // Call Cloudbeds API
  const response = await fetch(cloudbedsUrl, {
    method: 'POST',
    headers: requestHeaders,
    body: params,
  });
  const data = await response.json();
  if (!response.ok) {
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
  const cloudbedsUrl = 'https://hotels.cloudbeds.com/api/v1.1/addPayment';
  const requestHeaders = new Headers();
  requestHeaders.append('Authorization', `Bearer ${property.api_key}`);
  requestHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

  const params = new URLSearchParams();
  params.append('propertyID', propertyId);
  params.append('reservationID', reservationId);
  params.append('amount', amount.toString());
  params.append('paymentMethod', paymentMethod);
  params.append('note', note);

  const response = await fetch(cloudbedsUrl, {
    method: 'POST',
    headers: requestHeaders,
    body: params,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to add payment to reservation');
  }
  return data;
} 