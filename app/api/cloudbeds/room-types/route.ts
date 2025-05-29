import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json({
        success: false,
        error: 'Property ID is required'
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

    const cloudbedsUrl = 'https://hotels.cloudbeds.com/api/v1.1/getRoomTypes';
    const params = new URLSearchParams({
      propertyID: propertyId,
      includeInactive: 'false'
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
        error: data.message || 'Failed to fetch room types'
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      roomTypes: data.data
    });

  } catch (error) {
    console.error('Error fetching room types:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 