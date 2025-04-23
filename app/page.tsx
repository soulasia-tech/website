'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function Home() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({
    startDate: '',
    endDate: '',
    guests: '1'
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryString = new URLSearchParams(searchParams).toString();
    router.push(`/search?${queryString}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">Welcome to Soul Asia</h1>
        
        <Card className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Check-in Date</label>
                <Input
                  type="date"
                  required
                  value={searchParams.startDate}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Check-out Date</label>
                <Input
                  type="date"
                  required
                  value={searchParams.endDate}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Number of Guests</label>
              <Input
                type="number"
                min="1"
                required
                value={searchParams.guests}
                onChange={(e) => setSearchParams(prev => ({ ...prev, guests: e.target.value }))}
              />
            </div>

            <Button type="submit" className="w-full">
              Search Availability
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
