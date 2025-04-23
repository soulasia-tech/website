import { NextResponse } from 'next/server';
import type { ApiResponse, SearchRequest, RoomAvailability } from '@/types/api';

export async function POST(request: Request) {
  try {
    const body: SearchRequest = await request.json();

    // Validate request
    if (!body.startDate || !body.endDate || !body.guests) {
      return NextResponse.json<ApiResponse<never>>({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Mock API call to check room availability
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock response data
    const availableRooms: RoomAvailability[] = [
      {
        id: 'room1',
        name: 'Deluxe Room',
        description: 'Spacious room with garden view',
        price: 150,
        maxGuests: 2,
        isAvailable: true
      },
      {
        id: 'room2',
        name: 'Suite',
        description: 'Luxury suite with ocean view',
        price: 250,
        maxGuests: 4,
        isAvailable: true
      }
    ];

    return NextResponse.json<ApiResponse<RoomAvailability[]>>({
      success: true,
      data: availableRooms
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json<ApiResponse<never>>({
      success: false,
      error: 'Failed to search rooms'
    }, { status: 500 });
  }
} 