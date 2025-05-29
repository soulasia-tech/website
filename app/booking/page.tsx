'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { format, parseISO, differenceInDays } from "date-fns";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { PropertyInformation } from '@/components/property-information';
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomId: string;
  createAccount: boolean;
  password: string;
  phone?: string;
  estimatedArrivalTime?: string;
  country: string;
}

// Replace COUNTRIES array with objects containing code and name
const COUNTRIES = [
  { code: 'MY', name: 'Malaysia' },
  { code: 'US', name: 'United States of America' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'IN', name: 'India' },
  // ...add more as needed, or use a full ISO country code list
];

// Helper for 24h arrival times
const ARRIVAL_TIMES = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

// Define a type for cart items
interface CartItem {
  roomTypeID: string;
  roomName: string;
  price: number;
  quantity: number;
  maxAvailable: number;
}

interface BookingCart {
  cart: CartItem[];
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  propertyId: string;
  city?: string;
}

function BookingForm() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingCart, setBookingCart] = useState<BookingCart | null>(null);
  const [cartChecked, setCartChecked] = useState(false);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    roomId: '',
    createAccount: false,
    password: '',
    phone: '',
    estimatedArrivalTime: '',
    country: '',
  });
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // On mount, read bookingCart from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cartStr = sessionStorage.getItem('bookingCart');
      if (cartStr) {
        try {
          const cartObj: BookingCart = JSON.parse(cartStr);
          setBookingCart(cartObj);
          setBookingData(prev => ({
            ...prev,
            checkIn: cartObj.checkIn || '',
            checkOut: cartObj.checkOut || '',
            adults: cartObj.adults || 2,
            children: cartObj.children || 0,
          }));
        } catch {
          setError('Booking data is corrupted. Please return to the search page and try again.');
        }
      } else {
        setError('No booking found. Please return to the search page and start your booking again.');
      }
      setLoading(false);
      setCartChecked(true);
    }
  }, []);

  // Pre-fill user info if logged in
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('first_name, last_name, email')
          .eq('id', user.id)
          .single();
        if (userError) return;
        setBookingData(prev => ({
          ...prev,
          firstName: userData?.first_name || '',
          lastName: userData?.last_name || '',
          email: userData?.email || user.email || '',
        }));
      }
    };
    getUser();
  }, [supabase]);

  // Calculate number of nights
  const numberOfNights = bookingCart && bookingCart.checkIn && bookingCart.checkOut
    ? differenceInDays(parseISO(bookingCart.checkOut), parseISO(bookingCart.checkIn))
    : 0;

  // Handle form submit: always use bookingCart
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage('');
    setLoadingMessage('Redirecting to payment...');
    try {
      if (!bookingCart || !bookingCart.cart || !bookingCart.propertyId) {
        setError('Booking data is missing. Please return to the search page and try again.');
        setSubmitting(false);
        return;
      }
      // Optionally, validate cart contents here
      // --- Generate a random token and store booking data in localStorage ---
      const bookingToken = crypto.randomUUID();
      const bookingPayload = {
        bookingData,
        bookingCart,
        userId: user?.id
      };
      localStorage.setItem(`booking_${bookingToken}`, JSON.stringify(bookingPayload));
      // --- Billplz Payment Flow (mocked) ---
      setLoadingMessage('Redirecting to payment...');
      // Use bookingToken as Billplz reference_1 and pass propertyId as reference_2
      const billPayload = {
        amount: bookingCart.cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0),
        name: `${bookingData.firstName} ${bookingData.lastName}`,
        email: bookingData.email,
        callback_url: `${window.location.origin}/api/payment/billplz-callback`,
        redirect_url: `${window.location.origin}/confirmation?bookingToken=${bookingToken}`,
        reference_1: bookingToken,
        reference_2: bookingCart.propertyId,
      };
      // Call our API route to create the Billplz bill
      const billRes = await fetch('/api/payment/create-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billPayload),
      });
      const billData = await billRes.json();
      if (!billData.success || !billData.bill?.url) {
        throw new Error(billData.error || 'Failed to create payment bill');
      }
      window.location.href = billData.bill.url;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setSubmitting(false);
    }
  };

  if (loading || !cartChecked) {
    return (
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
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Booking Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button onClick={() => router.push('/search')} className="mt-2">Back to Search</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Guest Contact details</h1>
          <Button 
            variant="outline"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const lastSearchParams = sessionStorage.getItem('lastSearchParams');
                if (lastSearchParams) {
                  try {
                    const paramsObj = JSON.parse(lastSearchParams);
                    const params = new URLSearchParams();
                    if (paramsObj.city) params.set('city', paramsObj.city);
                    if (paramsObj.startDate) params.set('startDate', paramsObj.startDate);
                    if (paramsObj.endDate) params.set('endDate', paramsObj.endDate);
                    if (paramsObj.adults) params.set('adults', paramsObj.adults);
                    if (paramsObj.children) params.set('children', paramsObj.children);
                    if (paramsObj.apartments) params.set('apartments', paramsObj.apartments);
                    router.push(`/search?${params.toString()}`);
                    return;
                  } catch {
                    // fallback to below
                  }
                }
              }
              if (bookingCart) {
                const params = new URLSearchParams();
                if (bookingCart.city) params.set('city', bookingCart.city);
                if (bookingCart.checkIn) params.set('startDate', bookingCart.checkIn);
                if (bookingCart.checkOut) params.set('endDate', bookingCart.checkOut);
                if (bookingCart.adults) params.set('adults', bookingCart.adults.toString());
                if (bookingCart.children) params.set('children', bookingCart.children.toString());
                if (bookingCart.propertyId) params.set('propertyId', bookingCart.propertyId);
                router.push(`/search?${params.toString()}`);
              } else {
                router.push('/search');
              }
            }}
            className="flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Search
          </Button>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {/* Booking Form */}
          <div className="md:col-span-2">
            <Card className="p-6">
              {successMessage && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
                  <p>{successMessage}</p>
                </div>
              )}
              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
                  <p>{error}</p>
                </div>
              )}
              {loadingMessage && (
                <div className="text-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-gray-600">{loadingMessage}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <Input required value={bookingData.firstName} onChange={e => setBookingData(prev => ({ ...prev, firstName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <Input required value={bookingData.lastName} onChange={e => setBookingData(prev => ({ ...prev, lastName: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input type="email" required value={bookingData.email} onChange={e => setBookingData(prev => ({ ...prev, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Check-in</label>
                  <Input type="date" required value={bookingData.checkIn} onChange={e => setBookingData(prev => ({ ...prev, checkIn: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Check-out</label>
                  <Input type="date" required value={bookingData.checkOut} onChange={e => setBookingData(prev => ({ ...prev, checkOut: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Number of adults</label>
                    <div className="py-2 px-3 bg-gray-100 rounded text-gray-800">{bookingData.adults}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Number of children</label>
                    <div className="py-2 px-3 bg-gray-100 rounded text-gray-800">{bookingData.children}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 mb-4">To change the number of adults or children, <button type="button" className="text-blue-600 underline" onClick={() => {
                  if (typeof window !== 'undefined') {
                    const lastSearchParams = sessionStorage.getItem('lastSearchParams');
                    if (lastSearchParams) {
                      try {
                        const paramsObj = JSON.parse(lastSearchParams);
                        const params = new URLSearchParams();
                        if (paramsObj.city) params.set('city', paramsObj.city);
                        if (paramsObj.startDate) params.set('startDate', paramsObj.startDate);
                        if (paramsObj.endDate) params.set('endDate', paramsObj.endDate);
                        if (paramsObj.adults) params.set('adults', paramsObj.adults);
                        if (paramsObj.children) params.set('children', paramsObj.children);
                        if (paramsObj.apartments) params.set('apartments', paramsObj.apartments);
                        router.push(`/search?${params.toString()}`);
                        return;
                      } catch {
                        // fallback to below
                      }
                    }
                  }
                  if (bookingCart) {
                    const params = new URLSearchParams();
                    if (bookingCart.city) params.set('city', bookingCart.city);
                    if (bookingCart.checkIn) params.set('startDate', bookingCart.checkIn);
                    if (bookingCart.checkOut) params.set('endDate', bookingCart.checkOut);
                    if (bookingCart.adults) params.set('adults', bookingCart.adults.toString());
                    if (bookingCart.children) params.set('children', bookingCart.children.toString());
                    if (bookingCart.propertyId) params.set('propertyId', bookingCart.propertyId);
                    router.push(`/search?${params.toString()}`);
                  } else {
                    router.push('/search');
                  }
                }}>go back to search</button>.</p>
                {/* Estimated Arrival Time */}
                <div>
                  <label className="block text-sm font-medium mb-1">Estimated Arrival Time (optional)</label>
                  <Select value={bookingData.estimatedArrivalTime || ''} onValueChange={value => setBookingData(prev => ({ ...prev, estimatedArrivalTime: value }))}>
                    <SelectTrigger className={cn("w-full text-left", !bookingData.estimatedArrivalTime && "text-gray-400")}> 
                      <SelectValue placeholder="Select time (optional)" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {ARRIVAL_TIMES.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Country */}
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <Select value={bookingData.country || ''} onValueChange={value => setBookingData(prev => ({ ...prev, country: value }))}>
                    <SelectTrigger className={cn("w-full text-left", !bookingData.country && "text-gray-400")}> 
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {COUNTRIES.map(country => (
                        <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Add account creation section for non-authenticated users */}
                {!user && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <input type="checkbox" id="createAccount" checked={bookingData.createAccount} onChange={e => setBookingData(prev => ({ ...prev, createAccount: e.target.checked, password: e.target.checked ? prev.password : '' }))} className="h-4 w-4" />
                      <label htmlFor="createAccount" className="text-sm font-medium">Create an account to manage your bookings</label>
                    </div>
                    {bookingData.createAccount && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Password</label>
                        <Input type="password" value={bookingData.password} onChange={e => setBookingData(prev => ({ ...prev, password: e.target.value }))} required={bookingData.createAccount} placeholder="••••••••" minLength={6} />
                        <p className="text-xs text-gray-500">Must be at least 6 characters long</p>
                      </div>
                    )}
                  </div>
                )}
                <Button type="submit" disabled={submitting} variant="outline" className="w-full h-12 border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-black transition">
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Continue to Payment'
                  )}
                </Button>
                {!user && (
                  <p className="text-sm text-gray-500 text-center mt-4">Already have an account?{' '}<Link href={`/auth/sign-in?redirect=/booking`} className="text-blue-600 hover:underline">Sign in</Link></p>
                )}
              </form>
            </Card>
          </div>
          {/* Booking Summary */}
          <div>
            <Card className="p-6 sticky top-6">
              <h2 className="font-semibold mb-4">Booking Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Check-in</span>
                  <span className="font-medium">{bookingCart?.checkIn ? format(parseISO(bookingCart.checkIn), 'MMM d, yyyy') : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out</span>
                  <span className="font-medium">{bookingCart?.checkOut ? format(parseISO(bookingCart.checkOut), 'MMM d, yyyy') : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of nights</span>
                  <span className="font-medium">{numberOfNights}</span>
                </div>
                {bookingCart && bookingCart.cart && bookingCart.cart.length > 0 && (
                  <>
                    <div className="pt-2 mt-2 border-t">
                      <span className="font-semibold">Apartments</span>
                    </div>
                    {bookingCart.cart.map((item: CartItem) => (
                      <div key={item.roomTypeID} className="flex justify-between">
                        <span>{item.quantity} x {item.roomName}</span>
                        <span>MYR {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="pt-2 mt-2 border-t flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-semibold">MYR {bookingCart.cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
        {/* Property Information Section */}
        {bookingCart?.propertyId && <div className="mt-12"><PropertyInformation propertyId={bookingCart.propertyId} /></div>}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <>
      <title>Soulasia | Guest Details</title>
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
        <BookingForm />
      </Suspense>
    </>
  );
} 