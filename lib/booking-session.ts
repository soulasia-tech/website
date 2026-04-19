import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type BookingSessionUpsert = {
  token: string;
  booking_data: unknown;
  payment_status?: string;
  reservation_status?: string;
  error_message?: string | null;
};

export async function getBookingSession(token: string) {
  const { data, error } = await supabase
    .from('booking_sessions')
    .select('booking_data, payment_status, reservation_status, error_message')
    .eq('token', token)
    .single();
  return { data, error };
}

export async function upsertBookingSession(session: BookingSessionUpsert) {
  const { error } = await supabase.from('booking_sessions').upsert(session);
  return { error };
}
