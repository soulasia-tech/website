'use client';

import Link from 'next/link';
import { Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll events for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300 ease-in-out',
        isScrolled ? 'bg-white shadow-sm py-4' : 'bg-transparent py-6'
      )}
    >
      <div className="container flex items-center justify-between px-4 mx-auto">
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold text-blue-600">soulasia</span>
        </Link>
        <div className="hidden md:flex items-center space-x-1 bg-white rounded-full shadow-sm border border-gray-100 p-1 px-2">
          <Button variant="ghost" className="text-sm font-medium rounded-full">
            Places to stay
          </Button>
          <Button variant="ghost" className="text-sm font-medium rounded-full">
            Experiences
          </Button>
          <Button variant="ghost" className="text-sm font-medium rounded-full">
            Online Experiences
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="rounded-full hidden md:flex">
            Become a host
          </Button>
          <Button variant="outline" size="icon" className="rounded-full">
            <User className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="rounded-full flex items-center gap-2 shadow-sm">
            <Menu className="w-4 h-4" />
            <span className="sr-only md:not-sr-only">Menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
} 