// Mock booking utility

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

export async function createReservationInCloudbeds({ guestName }: { guestName: string }): Promise<Reservation> {
  // Simulate Cloudbeds reservation creation
  return {
    id: 'mock_reservation_id_456',
    status: 'confirmed',
    guestName,
    createdAt: new Date().toISOString(),
  };
}

export async function saveBookingInDB({ userId, reservationId, amount }: { userId?: string; reservationId: string; amount: number }): Promise<Booking> {
  // Simulate saving booking in DB
  return {
    id: 'mock_booking_id_789',
    userId,
    reservationId,
    amount,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
} 