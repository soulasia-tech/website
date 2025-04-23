import { supabase } from './supabase';

async function testSupabaseConnection() {
  try {
    // Test the connection by fetching the current user
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error connecting to Supabase:', error.message);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('Successfully connected to Supabase!');
    console.log('Current user:', data.user);
    
    return {
      success: true,
      data: data.user
    };
  } catch (error: any) {
    console.error('Unexpected error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testSupabaseConnection(); 