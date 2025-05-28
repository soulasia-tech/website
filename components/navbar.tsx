'use client';

import Link from 'next/link';
import { Menu, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { User as SupabaseUser } from '@supabase/supabase-js';
import Image from 'next/image';

export function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const pathname = usePathname();

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
      className="fixed top-0 w-full z-40 bg-white py-4"
    >
      <div className="container flex items-center justify-between px-4 mx-auto">
        <Link href="/" className="flex items-center group" aria-label="Soulasia Home">
          <Image 
            src="/Brand/logo.svg" 
            alt="Soulasia Logo" 
            width={140} 
            height={32} 
            priority 
            className="transition-transform duration-200 group-hover:scale-105 group-hover:opacity-90 cursor-pointer"
          />
        </Link>
        
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full"
                  aria-label="User menu"
                >
                  <Menu className="w-5 h-5" />
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
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/for-owners" className="flex items-center cursor-pointer">
                    For Owners
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/sustainability" className="flex items-center cursor-pointer">
                    Sustainability
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/contact-us" className="flex items-center cursor-pointer">
                    Contact Us
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {/* Desktop: show buttons, Mobile: hide */}
              <Link href="/auth/sign-in" className="hidden md:inline-block">
                <Button variant="outline" className="ml-2 font-semibold px-5 py-2">
                  Log In
                </Button>
              </Link>
              <Link href="/auth/sign-up" className="hidden md:inline-block">
                <Button
                  className="ml-2 font-semibold px-5 py-2 text-white shadow"
                  style={{ backgroundColor: '#0E3599', border: 'none' }}
                  onMouseOver={e => (e.currentTarget.style.backgroundColor = '#102e7a')}
                  onMouseOut={e => (e.currentTarget.style.backgroundColor = '#0E3599')}
                >
                  Sign Up
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full ml-2"
                    aria-label="Menu"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* Mobile only: Log In and Sign Up at the top of the menu */}
                  <div className="block md:hidden">
                    <DropdownMenuItem asChild>
                      <Link href="/auth/sign-in" className="flex items-center cursor-pointer w-full">
                        Log In
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/auth/sign-up" className="flex items-center cursor-pointer w-full">
                        Sign Up
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </div>
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-normal text-sm text-muted-foreground">Welcome to Soulasia</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/for-owners" className="flex items-center cursor-pointer">
                      For Owners
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/sustainability" className="flex items-center cursor-pointer">
                      Sustainability
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/contact-us" className="flex items-center cursor-pointer">
                      Contact Us
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  )
}