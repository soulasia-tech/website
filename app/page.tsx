'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    startDate: '',
    endDate: '',
    guests: 1
  });

  const handleSearch = async () => {
    if (!searchParams.startDate || !searchParams.endDate) {
      return;
    }
    router.push(`/search?startDate=${searchParams.startDate}&endDate=${searchParams.endDate}&guests=${searchParams.guests}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Booking Plugin */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Welcome to SoulAsia</h1>
            <p className="text-xl">Find your perfect stay with us</p>
          </div>

          {/* Booking Plugin */}
          <Card className="max-w-4xl mx-auto p-6 bg-white/10 backdrop-blur-sm">
            <div className="grid gap-4">
              <div className="flex gap-4">
                <Input
                  type="date"
                  value={searchParams.startDate}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
                  className="bg-white/20 text-white placeholder:text-white/70"
                />
                <Input
                  type="date"
                  value={searchParams.endDate}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
                  className="bg-white/20 text-white placeholder:text-white/70"
                />
                <Input
                  type="number"
                  min="1"
                  value={searchParams.guests}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                  className="bg-white/20 text-white placeholder:text-white/70"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={loading}
                  className="bg-white text-blue-700 hover:bg-white/90"
                >
                  {loading ? 'Searching...' : 'Search Rooms'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Additional Content */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Luxury Rooms</h3>
            <p className="text-gray-600">Experience comfort and elegance in our carefully designed rooms.</p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Great Location</h3>
            <p className="text-gray-600">Perfectly situated to explore the best of the area.</p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Excellent Service</h3>
            <p className="text-gray-600">Our staff is dedicated to making your stay memorable.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
