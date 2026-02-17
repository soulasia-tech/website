export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

export interface SearchRequest {
    startDate: string;
    endDate: string;
    guests: number;
}

export interface BookingRoomSelection {
    roomTypeID: string;
    quantity: number;
    rateId?: string;
}

export interface BookingRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    checkIn: string;
    checkOut: string;
    propertyId: string;
    rooms: BookingRoomSelection[];
    adults: number;
    children: number;
    country?: string;
}

export interface PaymentRequest {
    bookingId: string;
    paymentMethod: string;
    amount: number;
}

export interface RoomAvailability {
    id: string;
    name: string;
    description: string;
    price: number;
    maxGuests: number;
    isAvailable: boolean;
}

export interface BookingDetails {
    id: string;
    status: string;
    checkIn: string;
    checkOut: string;
    roomType: string;
    totalPrice: number;
    paymentStatus: string;
}

export interface PaymentDetails {
    id: string;
    status: string;
    amount: number;
    currency: string;
    createdAt: string;
} 
