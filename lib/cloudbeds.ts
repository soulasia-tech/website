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