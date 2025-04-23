export interface Room {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  images: string[];
}

export interface RoomAvailability {
  roomId: string;
  date: string;
  isAvailable: boolean;
  price: number;
}

// Mock rooms data
export const rooms: Room[] = [
  {
    id: 'room-1',
    name: 'Deluxe Room',
    description: 'Spacious room with ocean view',
    price: 150,
    capacity: 2,
    amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'Ocean View'],
    images: ['/images/rooms/deluxe-1.jpg', '/images/rooms/deluxe-2.jpg']
  },
  {
    id: 'room-2',
    name: 'Suite',
    description: 'Luxury suite with separate living area',
    price: 250,
    capacity: 4,
    amenities: ['WiFi', 'Air Conditioning', 'Mini Bar', 'Living Room', 'Ocean View'],
    images: ['/images/rooms/suite-1.jpg', '/images/rooms/suite-2.jpg']
  },
  {
    id: 'room-3',
    name: 'Standard Room',
    description: 'Comfortable room with garden view',
    price: 100,
    capacity: 2,
    amenities: ['WiFi', 'Air Conditioning', 'Garden View'],
    images: ['/images/rooms/standard-1.jpg', '/images/rooms/standard-2.jpg']
  }
];

// Helper function to generate availability for a date range
export function generateAvailability(startDate: string, endDate: string): RoomAvailability[] {
  const availability: RoomAvailability[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0];
    
    rooms.forEach(room => {
      // Randomly set availability (80% chance of being available)
      const isAvailable = Math.random() > 0.2;
      
      availability.push({
        roomId: room.id,
        date: dateStr,
        isAvailable,
        price: room.price
      });
    });
  }
  
  return availability;
} 