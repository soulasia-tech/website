'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate: searchParams.get('startDate'),
            endDate: searchParams.get('endDate'),
            guests: parseInt(searchParams.get('guests') || '1')
          })
        });
        const data = await response.json();
        if (data.success) {
          setRooms(data.data);
        }
      } catch (error) {
        console.error('Search failed:', error);
      }
      setLoading(false);
    };

    fetchRooms();
  }, [searchParams]);

  const handleBook = (roomId: string) => {
    router.push(`/booking?roomId=${roomId}&startDate=${searchParams.get('startDate')}&endDate=${searchParams.get('endDate')}&guests=${searchParams.get('guests')}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Searching...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Available Rooms</h1>
      
      <div className="grid gap-4">
        {rooms.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-600">No rooms available for the selected dates.</p>
            <Button 
              onClick={() => router.push('/')}
              className="mt-4"
            >
              Try Different Dates
            </Button>
          </Card>
        ) : (
          rooms.map((room) => (
            <Card key={room.id} className="p-4">
              <h2 className="text-xl font-semibold">{room.name}</h2>
              <p className="text-gray-600">{room.description}</p>
              <p className="font-bold">${room.price} per night</p>
              <Button 
                onClick={() => handleBook(room.id)}
                disabled={!room.isAvailable}
                className="mt-2"
              >
                {room.isAvailable ? 'Book Now' : 'Not Available'}
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 