import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId');
  if (!propertyId) {
    return NextResponse.json({ apiKey: null }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('cloudbeds_properties')
    .select('api_key')
    .eq('property_id', propertyId)
    .single();
  if (error || !data) {
    return NextResponse.json({ apiKey: null }, { status: 404 });
  }
  return NextResponse.json({ apiKey: data.api_key });
} 