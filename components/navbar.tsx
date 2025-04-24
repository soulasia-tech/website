'use client';

import Link from 'next/link';
import { Menu, User, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const pathname = usePathname();

  // Handle scroll events for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check auth state
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    if (pathname === '/my-bookings') {
      router.push('/');
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 w-full transition-all duration-300 ease-in-out z-40',
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
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full"
                  aria-label="User menu"
                >
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-normal text-sm text-muted-foreground">Signed in as</span>
                    <span className="truncate">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-bookings" className="flex items-center cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    My bookings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/sign-in">
              <Button variant="outline" size="sm" className="rounded-full">
                Sign in
              </Button>
            </Link>
          )}
          
          <Button variant="outline" className="rounded-full flex items-center gap-2 shadow-sm">
            <Menu className="w-4 h-4" />
            <span className="sr-only md:not-sr-only">Menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
} 