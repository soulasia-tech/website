'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { BookingWidget } from '@/components/booking-widget';

interface RoomResult {
  id: string;
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  available: boolean;
  images: string[];
  amenities: string[];
}

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<RoomResult[]>([]);

  // Get search parameters
  const location = searchParams.get('location');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  useEffect(() => {
    // Validate search parameters
    if (!location || !startDate || !endDate) {
      router.push('/');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setResults([
        {
          id: 'room1',
          name: 'Deluxe KLCC View Suite',
          description: 'Luxurious suite with breathtaking views of the Petronas Twin Towers',
          price: 250,
          maxGuests: 2,
          available: true,
          images: [
            'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699',
            'https://images.unsplash.com/photo-1560185007-cde436f6a4d0'
          ],
          amenities: ['King bed', 'City view', 'Free WiFi', 'Kitchen']
        },
        {
          id: 'room2',
          name: 'Premium Two-Bedroom Apartment',
          description: 'Spacious apartment perfect for families or extended stays',
          price: 350,
          maxGuests: 4,
          available: true,
          images: [
            'https://images.unsplash.com/photo-1540541338287-41700207dee6',
            'https://images.unsplash.com/photo-1560448204-603b3fc33ddc'
          ],
          amenities: ['2 bedrooms', 'Full kitchen', 'Washer/Dryer', 'Balcony']
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [location, startDate, endDate, router]);

  const handleBookNow = (roomId: string) => {
    router.push(`/booking?roomId=${roomId}&startDate=${startDate}&endDate=${endDate}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <BookingWidget />
          </div>
          <div className="animate-pulse space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <BookingWidget />
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {results.length} properties found in {location}
          </h1>
          {startDate && endDate && (
            <p className="text-gray-600">
              {format(parseISO(startDate), 'MMM d, yyyy')} - {format(parseISO(endDate), 'MMM d, yyyy')}
            </p>
          )}
        </div>
        
        <div className="space-y-6">
          {results.map(room => (
            <Card key={room.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-64 relative">
                  <Image 
                    src={`${room.images[0]}?w=600&h=400&fit=crop`}
                    alt={room.name}
                    width={600}
                    height={400}
                    className="object-cover"
                  />
                </div>
                <div className="p-6 md:w-2/3 flex flex-col">
                  <div className="flex-grow">
                    <h2 className="text-xl font-semibold mb-2">{room.name}</h2>
                    <p className="text-gray-600 mb-4">{room.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {room.amenities.map((amenity, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">Up to {room.maxGuests} guests</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div>
                      <p className="text-2xl font-bold">${room.price}</p>
                      <p className="text-gray-600">per night</p>
                    </div>
                    <Button 
                      onClick={() => handleBookNow(room.id)}
                      disabled={!room.available}
                      size="lg"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
} 