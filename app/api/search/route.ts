import { NextResponse } from 'next/server';
import { rooms, generateAvailability } from '@/data/mock-rooms';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { startDate, endDate, guests } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    // Generate availability for the date range
    const availability = generateAvailability(startDate, endDate);

    // Filter rooms based on guest count
    const availableRooms = rooms.filter(room => room.capacity >= (guests || 1));

    // Combine room data with availability
    const results = availableRooms.map(room => {
      const roomAvailability = availability.filter(a => a.roomId === room.id);
      const isAvailable = roomAvailability.every(a => a.isAvailable);
      
      return {
        ...room,
        availability: roomAvailability,
        isAvailable
      };
    });

    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search rooms' },
      { status: 500 }
    );
  }
} 