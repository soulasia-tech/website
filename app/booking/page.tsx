'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { format, parseISO, differenceInDays } from "date-fns";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { PropertyInformation } from '@/components/property-information';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface RoomType {
  roomTypeID: string;
  maxGuests: number;
  roomTypePhotos?: string[];
  roomTypeName?: string;
  roomTypeDescription?: string;
  price?: number;
  // Add other fields as needed
}

interface RatePlan {
  roomTypeID: string;
  ratePlanID: string;
  totalRate: number;
  // Add other fields as needed
}

// Add a full list of countries
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)",
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. \"Swaziland\")", "Ethiopia",
  "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan",
  "Vanuatu", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe"
];

// Helper for 24h arrival times
const ARRIVAL_TIMES = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomType | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [propertyId, setPropertyId] = useState<string>(searchParams.get('propertyId') || '');
  const [bookingData, setBookingData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    checkIn: searchParams.get('startDate') || '',
    checkOut: searchParams.get('endDate') || '',
    adults: 2,
    children: 0,
    roomId: searchParams.get('roomId') || '',
    createAccount: false,
    password: '',
    phone: '',
    estimatedArrivalTime: '',
    country: '',
  });
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [ratePlanId, setRatePlanId] = useState<string>('');

  // Fetch real room info and price
  useEffect(() => {
    const roomId = searchParams.get('roomId') || '';
    const checkIn = searchParams.get('startDate') || '';
    const checkOut = searchParams.get('endDate') || '';
    const propertyIdFromParams = searchParams.get('propertyId') || '';

    // If any required param is missing, show error and do not fetch
    if (!propertyIdFromParams || !roomId || !checkIn || !checkOut) {
      setRoom(null);
      setPrice(null);
      setRatePlanId('');
      setLoading(false);
      setError('Missing required booking information. Please return to the search page and select your room and dates again.');
      return;
    }
    setLoading(true);
    (async () => {
      try {
        // Always use production endpoints
        const roomRes = await fetch(`/api/cloudbeds/room-types?propertyId=${propertyIdFromParams}`);
        const roomData = await roomRes.json();
        let foundRoom = null;
        if (roomData.success && Array.isArray(roomData.roomTypes)) {
          foundRoom = roomData.roomTypes.find((r: RoomType) => String(r.roomTypeID) === String(roomId));
        }
        setRoom(foundRoom);
        // Fetch rates
        const rateRes = await fetch(`/api/cloudbeds/rate-plans?propertyId=${propertyIdFromParams}&startDate=${checkIn}&endDate=${checkOut}`);
        const rateData = await rateRes.json();
        let foundPrice = null;
        let foundRatePlanId = '';
        if (rateData.success && Array.isArray(rateData.ratePlans)) {
          // Match logic to search page: filter all rates for this roomTypeID, pick the minimum totalRate
          const rates = rateData.ratePlans.filter((r: RatePlan) => String(r.roomTypeID) === String(roomId));
          if (rates.length > 0) {
            // Find the rate with the minimum totalRate
            const minRate = rates.reduce((min: RatePlan, r: RatePlan) => r.totalRate < min.totalRate ? r : min, rates[0]);
            foundPrice = minRate.totalRate;
            foundRatePlanId = minRate.ratePlanID || '';
          }
        }
        setPrice(foundPrice);
        setRatePlanId(foundRatePlanId);
      } catch {
        setRoom(null);
        setPrice(null);
        setRatePlanId('');
      }
      setLoading(false);
    })();
  }, [searchParams]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Pre-fill form with user data from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('first_name, last_name, email')
          .eq('id', user.id)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          return;
        }

        // If user exists in auth but not in users table, create the record
        if (!userData) {
          const { error: createError } = await supabase
            .from('users')
            .insert([{
              id: user.id,
              email: user.email,
              first_name: '',
              last_name: ''
            }]);

          if (createError) {
            console.error('Error creating user record:', createError);
            return;
          }
        }

        setBookingData(prev => ({
          ...prev,
          firstName: userData?.first_name || '',
          lastName: userData?.last_name || '',
          email: userData?.email || user.email || '',  // Fallback to auth email
        }));
      }
    };

    getUser();
  }, [supabase]);

  useEffect(() => {
    if (!loading && room === null) {
      setError('Could not load the selected room. Please try again or start your booking again.');
    } else if (!loading && room !== null) {
      setError(null); // Clear error if room is found
    }
  }, [loading, room]);

  useEffect(() => {
    setBookingData(prev => ({
      ...prev,
      roomId: searchParams.get('roomId') || '',
      checkIn: searchParams.get('startDate') || '',
      checkOut: searchParams.get('endDate') || '',
      // Optionally update adults/children if you want to sync those too
    }));
    setPropertyId(searchParams.get('propertyId') || '');
  }, [searchParams]);

  // Calculate number of nights
  const numberOfNights = bookingData.checkIn && bookingData.checkOut && room
    ? differenceInDays(parseISO(bookingData.checkOut), parseISO(bookingData.checkIn))
    : 0;

  // Calculate total price
  const totalPrice = price !== null && numberOfNights > 0 ? price * numberOfNights : null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage('');
    setLoadingMessage('Processing your booking...');

    try {
      console.log('Starting booking process...', {
        createAccount: bookingData.createAccount,
        user: user,
        bookingData
      });

      if (!room) {
        throw new Error('Invalid room selection');
      }
      if (numberOfNights <= 0) {
        throw new Error('Invalid date selection');
      }
      if (bookingData.adults > room.maxGuests) {
        throw new Error(`Maximum ${room.maxGuests} guests allowed for this room`);
      }

      let currentUser = user;

      // If user is already authenticated, update their information
      if (currentUser) {
        console.log('Updating existing user information...');
        const { error: updateError } = await supabase
          .from('users')
          .update({
            first_name: bookingData.firstName,
            last_name: bookingData.lastName,
            email: bookingData.email
          })
          .eq('id', currentUser.id);

        if (updateError) {
          console.error('Error updating user information:', updateError);
          throw new Error(`Failed to update user information: ${updateError.message}`);
        }
      }
      // Handle new user creation (existing code)
      else if (bookingData.createAccount) {
        setLoadingMessage('Creating your account...');
        console.log('Creating new user account...');
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: bookingData.email,
          password: bookingData.password,
          options: {
            data: {
              first_name: bookingData.firstName,
              last_name: bookingData.lastName
            }
          }
        });

        console.log('User creation response:', { authData, authError });

        if (authError || !authData.user) {
          throw new Error(`Failed to create account: ${authError?.message || 'No user created'}`);
        }

        currentUser = authData.user;
        setUser(currentUser);
        console.log('New user set:', currentUser);

        // Ensure user record exists in public.users table
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            id: currentUser.id,
            email: bookingData.email,
            first_name: bookingData.firstName,
            last_name: bookingData.lastName
          });

        if (userError) {
          console.error('Error creating user record:', userError);
          throw new Error(`Failed to create user record: ${userError.message}`);
        }
      }

      setLoadingMessage('Creating your reservation...');
      const formData = new FormData();
      
      // Add basic reservation details
      formData.append('propertyId', propertyId);
      formData.append('startDate', bookingData.checkIn);
      formData.append('endDate', bookingData.checkOut);
      
      // Add guest information
      formData.append('guestFirstName', bookingData.firstName);
      formData.append('guestLastName', bookingData.lastName);
      formData.append('guestEmail', bookingData.email);
      formData.append('guestCountry', bookingData.country);
      formData.append('guestZip', '00000'); // Default zip
      formData.append('paymentMethod', 'cash'); // Default to cash
      formData.append('sendEmailConfirmation', 'true');
      
      if (bookingData.phone) {
        formData.append('guestPhone', bookingData.phone);
      }

      // Add room data
      const roomData = [{
        roomTypeID: bookingData.roomId,
        roomID: `${bookingData.roomId}-1`,
        quantity: "1",
        roomRateID: ratePlanId
      }];
      formData.append('rooms', JSON.stringify(roomData));

      // Add adults data
      const adultsData = [{
        roomTypeID: bookingData.roomId,
        roomID: `${bookingData.roomId}-1`,
        quantity: String(bookingData.adults)
      }];
      formData.append('adults', JSON.stringify(adultsData));

      // Add children data
      const childrenData = [{
        roomTypeID: bookingData.roomId,
        roomID: `${bookingData.roomId}-1`,
        quantity: String(bookingData.children)
      }];
      formData.append('children', JSON.stringify(childrenData));

      console.log('Sending reservation request with data:', {
        propertyId,
        roomData,
        adultsData,
        childrenData
      });

      // Call our API route to create the reservation
      const res = await fetch('/api/create-reservation', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      console.log('Cloudbeds reservation response:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create reservation');
      }

      setLoadingMessage('Saving your booking...');

      // Create booking in Supabase
      let bookingId = '';
      
      if (currentUser) {
        console.log('Attempting to save booking to Supabase with user:', {
          userId: currentUser.id,
          cloudbedsResId: data.data.reservationID,
          cloudbedsPropertyId: propertyId
        });
        
        // Create the booking with required fields
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .insert({
            user_id: currentUser.id,
            cloudbeds_res_id: data.data.reservationID,
            cloudbeds_property_id: propertyId
          })
          .select()
          .single();

        if (bookingError) {
          console.error('Detailed booking error:', bookingError);
          throw new Error(`Failed to save booking: ${bookingError.message}`);
        } else {
          bookingId = booking.id;
          console.log('Successfully created booking with ID:', bookingId);
        }
      }

      setSuccessMessage('Booking successful! Redirecting to confirmation...');
      
      if (bookingId) {
        console.log('Redirecting to confirmation with booking ID:', bookingId);
        router.push(`/confirmation?bookingId=${bookingId}`);
      } else {
        // For guest bookings without an account
        console.log('Redirecting guest to confirmation');
        router.push(`/confirmation?bookingId=guest_${data.data.reservationID}&checkIn=${bookingData.checkIn}&checkOut=${bookingData.checkOut}&totalPrice=${totalPrice}&firstName=${bookingData.firstName}&lastName=${bookingData.lastName}&email=${bookingData.email}&guests=${bookingData.adults + bookingData.children}&roomId=${bookingData.roomId}`);
      }
    } catch (error) {
      console.error('Booking process error:', error);
      handleError(error);
      setSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e);
  };

  const handleError = (error: Error | unknown) => {
    console.error('Error:', error);
    setError(error instanceof Error ? error.message : 'An unexpected error occurred');
  };

  if (loading) {
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
          <Button onClick={() => router.push('/')} className="mt-2">Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Add Guests</h1>
            <Button 
              variant="outline"
              onClick={() => {
                // Use all current search params to reconstruct the search URL
                const params = new URLSearchParams();
                searchParams.forEach((value, key) => {
                  params.set(key, value);
                });
                router.push(`/search?${params.toString()}`);
              }}
              className="flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
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

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name</label>
                      <Input
                        required
                        value={bookingData.firstName}
                        onChange={(e) => setBookingData(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name</label>
                      <Input
                        required
                        value={bookingData.lastName}
                        onChange={(e) => setBookingData(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      required
                      value={bookingData.email}
                      onChange={(e) => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Check-in</label>
                    <Input
                      type="date"
                      required
                      value={bookingData.checkIn}
                      onChange={(e) => setBookingData(prev => ({ ...prev, checkIn: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Check-out</label>
                    <Input
                      type="date"
                      required
                      value={bookingData.checkOut}
                      onChange={(e) => setBookingData(prev => ({ ...prev, checkOut: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Adults</label>
                    <Input
                      type="number"
                      required
                      value={bookingData.adults}
                      onChange={(e) => setBookingData(prev => ({ ...prev, adults: Number(e.target.value) }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Children</label>
                    <Input
                      type="number"
                      value={bookingData.children}
                      onChange={(e) => setBookingData(prev => ({ ...prev, children: Number(e.target.value) }))}
                    />
                  </div>

                  {/* Estimated Arrival Time */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Arrival Time (optional)</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "form-control flex items-center justify-between w-full text-left",
                            !bookingData.estimatedArrivalTime && "text-gray-400"
                          )}
                        >
                          {bookingData.estimatedArrivalTime || "Select time (optional)"}
                          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                        {ARRIVAL_TIMES.map(time => (
                          <DropdownMenuItem
                            key={time}
                            onSelect={() => setBookingData(prev => ({ ...prev, estimatedArrivalTime: time }))}
                            className="flex items-center justify-between"
                          >
                            <span>{time}</span>
                            {bookingData.estimatedArrivalTime === time && <Check className="h-4 w-4 text-green-600" />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "form-control flex items-center justify-between w-full text-left",
                            !bookingData.country && "text-gray-400"
                          )}
                        >
                          {bookingData.country || "Select country"}
                          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                        {COUNTRIES.map(country => (
                          <DropdownMenuItem
                            key={country}
                            onSelect={() => setBookingData(prev => ({ ...prev, country }))}
                            className="flex items-center justify-between"
                          >
                            <span>{country}</span>
                            {bookingData.country === country && <Check className="h-4 w-4 text-green-600" />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Add account creation section for non-authenticated users */}
                  {!user && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <input
                          type="checkbox"
                          id="createAccount"
                          checked={bookingData.createAccount}
                          onChange={(e) => setBookingData(prev => ({ 
                            ...prev, 
                            createAccount: e.target.checked,
                            password: e.target.checked ? prev.password : '' 
                          }))}
                          className="h-4 w-4"
                        />
                        <label htmlFor="createAccount" className="text-sm font-medium">
                          Create an account to manage your bookings
                        </label>
                      </div>

                      {bookingData.createAccount && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">Password</label>
                          <Input
                            type="password"
                            value={bookingData.password}
                            onChange={(e) => setBookingData(prev => ({ ...prev, password: e.target.value }))}
                            required={bookingData.createAccount}
                            placeholder="••••••••"
                            minLength={6}
                          />
                          <p className="text-xs text-gray-500">
                            Must be at least 6 characters long
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={submitting}
                    variant="outline"
                    className="w-full h-12 border-gray-300 text-gray-800 hover:bg-gray-100 hover:text-black transition"
                  >
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
                    <p className="text-sm text-gray-500 text-center mt-4">
                      Want to save your booking details?{' '}
                      <Link href={`/auth/sign-in?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`} className="text-blue-600 hover:underline">
                        Sign in
                      </Link>
                      {' '}or{' '}
                      <Link href={`/auth/sign-up?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`} className="text-blue-600 hover:underline">
                        create an account
                      </Link>
                    </p>
                  )}
                </form>
              </Card>
            </div>

            {/* Booking Summary */}
            <div>
              <Card className="p-6 sticky top-6">
                <h2 className="font-semibold mb-4">Booking Summary</h2>
                
                <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
                  {room && room.roomTypePhotos && room.roomTypePhotos[0] ? (
                    <Image
                      src={`${room.roomTypePhotos[0]}?w=400&h=300&fit=crop`}
                      alt={room.roomTypeName || ''}
                      width={400}
                      height={300}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>

                <h3 className="font-medium mb-2">{room ? room.roomTypeName : ''}</h3>
                <p className="text-sm text-gray-600 mb-4">{room ? room.roomTypeDescription : ''}</p>

                <div className="space-y-2 text-sm">
                  {price === null && (
                    <div className="text-red-500 text-sm mb-2">No rates available for this room and date selection. Please try different dates or another room.</div>
                  )}
                  <div className="flex justify-between">
                    <span>Check-in</span>
                    <span className="font-medium">{format(parseISO(bookingData.checkIn), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Check-out</span>
                    <span className="font-medium">{format(parseISO(bookingData.checkOut), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of nights</span>
                    <span className="font-medium">{numberOfNights}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per night</span>
                    <span className="font-medium">
                      {price !== null ? `MYR ${price.toFixed(2)}` : 'N/A'}
                    </span>
                  </div>
                  <div className="pt-2 mt-2 border-t flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">
                      {typeof totalPrice === 'number' ? `MYR ${totalPrice.toFixed(2)}` : 'N/A'}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          {/* Property Information Section (added below booking form/summary) */}
          {propertyId && <div className="mt-12"><PropertyInformation propertyId={propertyId} /></div>}
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
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
      <BookingForm />
    </Suspense>
  );
} 