'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface RoomResult {
  id: string;
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  available: boolean;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<RoomResult[]>([]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setResults([
        {
          id: 'room1',
          name: 'Deluxe Room',
          description: 'Spacious room with garden view',
          price: 150,
          maxGuests: 2,
          available: true
        },
        {
          id: 'room2',
          name: 'Suite',
          description: 'Luxury suite with ocean view',
          price: 250,
          maxGuests: 4,
          available: true
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleBookNow = (roomId: string) => {
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const guests = searchParams.get('guests');
    
    router.push(`/booking?roomId=${roomId}&startDate=${startDate}&endDate=${endDate}&guests=${guests}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Searching available rooms...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Available Rooms</h1>
      
      <div className="grid gap-4">
        {results.map(room => (
          <Card key={room.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{room.name}</h2>
                <p className="text-gray-600">{room.description}</p>
                <p className="mt-2">Max Guests: {room.maxGuests}</p>
                <p className="font-semibold mt-2">${room.price} per night</p>
              </div>
              <Button 
                onClick={() => handleBookNow(room.id)}
                disabled={!room.available}
              >
                Book Now
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
} 