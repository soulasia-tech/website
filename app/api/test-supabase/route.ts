import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test 1: Insert a test booking
    const testBooking = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      check_in: new Date().toISOString().split('T')[0],
      check_out: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
      room_type: 'test_room',
      number_of_guests: 2,
      total_price: 100.00,
      status: 'test'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('guest_bookings')
      .insert(testBooking)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting test data:', insertError);
      return NextResponse.json({ 
        success: false, 
        error: insertError.message 
      }, { status: 500 });
    }

    // Test 2: Retrieve the test booking
    const { data: retrieveData, error: retrieveError } = await supabase
      .from('guest_bookings')
      .select('*')
      .eq('email', 'test@example.com')
      .single();

    if (retrieveError) {
      console.error('Error retrieving test data:', retrieveError);
      return NextResponse.json({ 
        success: false, 
        error: retrieveError.message 
      }, { status: 500 });
    }

    // Clean up: Delete the test booking
    const { error: deleteError } = await supabase
      .from('guest_bookings')
      .delete()
      .eq('email', 'test@example.com');

    if (deleteError) {
      console.warn('Warning: Could not delete test data:', deleteError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully tested Supabase connection!',
      details: {
        inserted: insertData,
        retrieved: retrieveData,
        cleanup: deleteError ? 'failed' : 'success'
      }
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 