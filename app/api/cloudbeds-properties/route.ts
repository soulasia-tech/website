import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface CloudbedsPropertyRow {
  property_id: string;
  name: string;
  city: string;
}

export async function GET() {
  const { data, error } = await supabase
    .from('cloudbeds_properties')
    .select('property_id, name, city');

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // Map to expected format
  const properties = (data || []).map((row: CloudbedsPropertyRow) => ({
    propertyId: row.property_id,
    propertyName: row.name,
    city: row.city,
  }));

  return NextResponse.json({ success: true, properties });
} 