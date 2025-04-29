import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!propertyId || !startDate || !endDate) {
      return NextResponse.json({
        success: false,
        error: 'Property ID, start date, and end date are required'
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

    const cloudbedsUrl = 'https://hotels.cloudbeds.com/api/v1.1/getRatePlans';
    const params = new URLSearchParams({
      propertyID: propertyId,
      startDate: startDate,
      endDate: endDate
    });

    const response = await fetch(`${cloudbedsUrl}?${params}`, {
      headers: {
        'Authorization': `Bearer ${property.api_key}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cloudbeds API error:', data);
      return NextResponse.json({
        success: false,
        error: data.message || 'Failed to fetch rate plans'
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      ratePlans: data.data
    });

  } catch (error) {
    console.error('Error fetching rate plans:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 