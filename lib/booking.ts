// Mock booking utility

import {createClient} from '@supabase/supabase-js';

export interface Reservation {
    id: string;
    status: string;
    guestName: string;
    createdAt: string;
    // ...other fields as needed
}

export interface Booking {
    id: string;
    userId?: string;
    reservationId: string;
    amount: number;
    status: string;
    createdAt: string;
    // ...other fields as needed
}

export async function createReservationInCloudbeds({guestName}: { guestName: string }): Promise<Reservation> {
    // Simulate Cloudbeds reservation creation
    return {
        id: 'mock_reservation_id_456',
        status: 'confirmed',
        guestName,
        createdAt: new Date().toISOString(),
    };
}

export async function saveBookingInDB({userId, cloudbedsResId, cloudbedsPropertyId}: {
    userId: string;
    cloudbedsResId: string;
    cloudbedsPropertyId?: string;
}) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {data, error} = await supabase
        .from('bookings')
        .insert([
            {
                user_id: userId,
                cloudbeds_res_id: cloudbedsResId,
                cloudbeds_property_id: cloudbedsPropertyId,
            },
        ])
        .select()
        .single();

    if (error) {
        throw new Error('Failed to save booking in Supabase: ' + error.message);
    }
    return data;
} 
