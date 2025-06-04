'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AS', name: 'American Samoa' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AI', name: 'Anguilla' },
  { code: 'AQ', name: 'Antarctica' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AW', name: 'Aruba' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BM', name: 'Bermuda' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BR', name: 'Brazil' },
  { code: 'IO', name: 'British Indian Ocean Territory' },
  { code: 'BN', name: 'Brunei Darussalam' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CA', name: 'Canada' },
  { code: 'CV', name: 'Cape Verde' },
  { code: 'KY', name: 'Cayman Islands' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CX', name: 'Christmas Island' },
  { code: 'CC', name: 'Cocos (Keeling) Islands' },
  { code: 'CO', name: 'Colombia' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo' },
  { code: 'CD', name: 'Congo, the Democratic Republic of the' },
  { code: 'CK', name: 'Cook Islands' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'HR', name: 'Croatia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'EE', name: 'Estonia' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FK', name: 'Falkland Islands (Malvinas)' },
  { code: 'FO', name: 'Faroe Islands' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GF', name: 'French Guiana' },
  { code: 'PF', name: 'French Polynesia' },
  { code: 'TF', name: 'French Southern Territories' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GI', name: 'Gibraltar' },
  { code: 'GR', name: 'Greece' },
  { code: 'GL', name: 'Greenland' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GP', name: 'Guadeloupe' },
  { code: 'GU', name: 'Guam' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GG', name: 'Guernsey' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HM', name: 'Heard Island and McDonald Islands' },
  { code: 'VA', name: 'Holy See (Vatican City State)' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran, Islamic Republic of' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IM', name: 'Isle of Man' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' },
  { code: 'JE', name: 'Jersey' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KP', name: "Korea, Democratic People's Republic of" },
  { code: 'KR', name: 'Korea, Republic of' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: "Lao People's Democratic Republic" },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MO', name: 'Macao' },
  { code: 'MK', name: 'Macedonia, the former Yugoslav Republic of' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' },
  { code: 'MT', name: 'Malta' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MQ', name: 'Martinique' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'YT', name: 'Mayotte' },
  { code: 'MX', name: 'Mexico' },
  { code: 'FM', name: 'Micronesia, Federated States of' },
  { code: 'MD', name: 'Moldova, Republic of' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MS', name: 'Montserrat' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NC', name: 'New Caledonia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NU', name: 'Niue' },
  { code: 'NF', name: 'Norfolk Island' },
  { code: 'MP', name: 'Northern Mariana Islands' },
  { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PW', name: 'Palau' },
  { code: 'PS', name: 'Palestinian Territory, Occupied' },
  { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PN', name: 'Pitcairn' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RE', name: 'Réunion' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russian Federation' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'BL', name: 'Saint Barthélemy' },
  { code: 'SH', name: 'Saint Helena, Ascension and Tristan da Cunha' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'MF', name: 'Saint Martin (French part)' },
  { code: 'PM', name: 'Saint Pierre and Miquelon' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'WS', name: 'Samoa' },
  { code: 'SM', name: 'San Marino' },
  { code: 'ST', name: 'Sao Tome and Principe' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SX', name: 'Sint Maarten (Dutch part)' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'GS', name: 'South Georgia and the South Sandwich Islands' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SJ', name: 'Svalbard and Jan Mayen' },
  { code: 'SZ', name: 'Swaziland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syrian Arab Republic' },
  { code: 'TW', name: 'Taiwan, Province of China' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania, United Republic of' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' },
  { code: 'TK', name: 'Tokelau' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TC', name: 'Turks and Caicos Islands' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States of America' },
  { code: 'UM', name: 'United States Minor Outlying Islands' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'VE', name: 'Venezuela, Bolivarian Republic of' },
  { code: 'VN', name: 'Viet Nam' },
  { code: 'VG', name: 'Virgin Islands, British' },
  { code: 'VI', name: 'Virgin Islands, U.S.' },
  { code: 'WF', name: 'Wallis and Futuna' },
  { code: 'EH', name: 'Western Sahara' },
  { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
];

// Helper for 24h arrival times
const ARRIVAL_TIMES = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

// Define a type for cart items
type CartItem = {
  roomTypeID: string;
  roomName: string;
  price: number;
  quantity: number;
  maxAvailable: number;
  adults: number;
  children: number;
  roomIDs: string[];
};

interface BookingCart {
  cart: CartItem[];
  checkIn: string;
  checkOut: string;
  propertyId: string;
  city?: string;
}

// Add type for CloudbedsQuote
interface Breakdown {
  subtotal: number;
  sst: number;
  grandTotal: number;
}

interface CloudbedsQuote {
  subtotal: number;
  sst: number;
  grandTotal: number;
  breakdown?: Breakdown;
}

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookingCart, setBookingCart] = useState<BookingCart | null>(null);
  const [cartChecked, setCartChecked] = useState<boolean>(false);
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
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [cloudbedsQuote, setCloudbedsQuote] = useState<CloudbedsQuote | null>(null);

  // Always get propertyId from searchParams or bookingCart
  const propertyId = searchParams.get('propertyId') || bookingCart?.propertyId || '';

  // On mount, read bookingCart from sessionStorage
  useEffect(() => {
    async function tryRestoreCart() {
      if (typeof window !== 'undefined') {
        const cartStr = sessionStorage.getItem('bookingCart');
        console.log('[BookingPage] Attempting to restore cart from sessionStorage:', cartStr);
        if (cartStr) {
          try {
            const cartObj: BookingCart = JSON.parse(cartStr);
            setBookingCart(cartObj);
            setBookingData((prev: BookingFormData) => ({
              ...prev,
              checkIn: cartObj.checkIn || '',
              checkOut: cartObj.checkOut || '',
            }));
            setLoading(false);
            setCartChecked(true);
            console.log('[BookingPage] Cart restored:', cartObj);
            return;
          } catch (err: unknown) {
            setError('Booking data is corrupted. Please return to the search page and try again.');
            setLoading(false);
            setCartChecked(true);
            console.error('[BookingPage] Error parsing cart from sessionStorage:', err);
            return;
          }
        }
        // Try to recover from backend session store using latest booking token
        let latestToken = null;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('booking_')) {
            latestToken = key.replace('booking_', '');
            break;
          }
        }
        if (latestToken) {
          try {
            const res = await fetch(`/api/booking-session?token=${latestToken}`);
            const data = await res.json();
            if (data.success && data.bookingData?.bookingCart) {
              setBookingCart(data.bookingData.bookingCart as BookingCart);
              setBookingData((prev: BookingFormData) => ({
                ...prev,
                checkIn: data.bookingData.bookingCart.checkIn || '',
                checkOut: data.bookingData.bookingCart.checkOut || '',
              }));
              setLoading(false);
              setCartChecked(true);
              return;
            }
          } catch {}
        }
        setError('No booking found. Please return to the search page and start your booking again.');
        setLoading(false);
        setCartChecked(true);
        setTimeout(() => {
          window.location.href = '/search?error=missing_cart';
        }, 2000);
      }
    }
    tryRestoreCart();
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
    try {
      console.log('[BookingPage] Submitting booking form');
      if (!bookingCart || !bookingCart.cart || !bookingCart.propertyId) {
        setError('Booking data is missing. Please return to the search page and try again.');
        setSubmitting(false);
        console.error('[BookingPage] Booking data missing:', { bookingCart });
        return;
      }
      if (!bookingCart.cart.length) {
        setError('You must select at least one room to proceed with your booking.');
        setSubmitting(false);
        console.error('[BookingPage] No rooms selected in cart:', { bookingCart });
        return;
      }
      // Validate that every CartItem has non-empty roomIDs
      const invalidRoomIDs = bookingCart.cart.some((item: CartItem) => !item.roomIDs || !Array.isArray(item.roomIDs) || item.roomIDs.length === 0);
      if (invalidRoomIDs) {
        setError('One or more rooms in your cart are missing room assignments. Please return to the search page and select your rooms again.');
        setSubmitting(false);
        console.error('[BookingPage] One or more CartItems missing roomIDs:', bookingCart.cart);
        return;
      }
      // --- Generate a random token and store booking data in localStorage ---
      const bookingToken = crypto.randomUUID();
      const bookingPayload = {
        bookingData,
        bookingCart,
        propertyId,
        userId: user?.id
      };
      console.log('[BookingPage] bookingCart:', bookingCart);
      console.log('[BookingPage] bookingPayload:', bookingPayload);
      localStorage.setItem(`booking_${bookingToken}`, JSON.stringify(bookingPayload));
      // --- Save booking session to backend ---
      console.log('[BookingPage] Saving booking session to backend');
      const sessionRes = await fetch('/api/booking-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: bookingToken, bookingData: bookingPayload }),
      });
      const sessionData = await sessionRes.json();
      console.log('[BookingPage] booking-session POST response:', sessionData);
      if (!sessionData.success) {
        setError(sessionData.error || 'Failed to save booking session. Please try again.');
        setSubmitting(false);
        console.error('[BookingPage] Failed to save booking session:', sessionData.error);
        return;
      }
      // --- Billplz Payment Flow ---
      // Use propertyId for Billplz
      const totalAmount = cloudbedsQuote?.grandTotal ?? bookingCart.cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
      const billPayload = {
        amount: Math.round(totalAmount * 100), // Billplz expects amount in cents
        name: `${bookingData.firstName} ${bookingData.lastName}`,
        email: bookingData.email,
        callback_url: `${window.location.origin}/api/payment/billplz-callback`,
        redirect_url: `${window.location.origin}/confirmation?bookingToken=${bookingToken}`,
        reference_1: bookingToken,
        reference_2: propertyId,
        cart: bookingCart.cart, // Pass cart with per-room guests
      };
      console.log('[BookingPage] Creating Billplz bill with payload:', billPayload);
      // Call our API route to create the Billplz bill
      const billRes = await fetch('/api/payment/create-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billPayload),
      });
      const billData = await billRes.json();
      console.log('[BookingPage] create-bill response:', billData);
      if (!billData.success || !billData.bill?.url) {
        throw new Error(billData.error || 'Failed to create payment bill');
      }
      window.location.href = billData.bill.url;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setSubmitting(false);
      console.error('[BookingPage] Error during booking process:', error);
    }
  };

  useEffect(() => {
    if (bookingCart) {
      console.log('bookingCart:', bookingCart);
      console.log('propertyId for PropertyInformation:', bookingCart.propertyId);
    }
  }, [bookingCart]);

  // Debug logs for propertyId
  useEffect(() => {
    const spPropertyId = searchParams.get('propertyId');
    console.log('[BookingPage] searchParams.get(propertyId):', spPropertyId);
    console.log('[BookingPage] bookingCart:', bookingCart);
    console.log('[BookingPage] resolved propertyId:', propertyId);
    if (!propertyId) {
      setError('Error: propertyId is missing. Please return to the search page and try again.');
    }
  }, [searchParams, bookingCart, propertyId]);

  useEffect(() => {
    async function fetchCloudbedsQuote() {
      if (!bookingCart || !bookingCart.propertyId || !bookingCart.checkIn || !bookingCart.checkOut || !bookingCart.cart.length) return;
      // Call a new API endpoint to get a quote from Cloudbeds
      const res = await fetch(`/api/cloudbeds/quote?propertyId=${bookingCart.propertyId}&checkIn=${bookingCart.checkIn}&checkOut=${bookingCart.checkOut}&cart=${encodeURIComponent(JSON.stringify(bookingCart.cart))}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.quote) setCloudbedsQuote(data.quote);
      }
    }
    fetchCloudbedsQuote();
  }, [bookingCart]);

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
          <h1 className="text-3xl font-bold mb-8">Guest Contact Details</h1>
          <Button
            variant="outline"
            className="rounded-full px-5 py-2 font-medium border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-2 shadow-sm"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const lastSearchUrl = sessionStorage.getItem('lastSearchUrl');
                if (lastSearchUrl) {
                  router.push(lastSearchUrl);
                  return;
                }
                const lastSearchParams = sessionStorage.getItem('lastSearchParams');
                if (lastSearchParams) {
                  try {
                    const paramsObj = JSON.parse(lastSearchParams);
                    const params = new URLSearchParams();
                    if (paramsObj.city) params.set('city', paramsObj.city);
                    if (paramsObj.startDate) params.set('startDate', paramsObj.startDate);
                    if (paramsObj.endDate) params.set('endDate', paramsObj.endDate);
                    if (paramsObj.apartments) params.set('apartments', paramsObj.apartments);
                    if (paramsObj.adults) params.set('adults', paramsObj.adults);
                    if (paramsObj.children) params.set('children', paramsObj.children);
                    if (paramsObj.guests) params.set('guests', paramsObj.guests);
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
                if (bookingCart.propertyId) params.set('propertyId', bookingCart.propertyId);
                router.push(`/search?${params.toString()}`);
              } else {
                router.push('/search?city=Kuala Lumpur');
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back to Search
          </Button>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {/* Booking Form */}
          <div className="md:col-span-2">
            <Card className="p-8 bg-gray-50 rounded-2xl shadow-lg">
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
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-medium mb-2">First Name</label>
                    <Input required value={bookingData.firstName} onChange={e => setBookingData(prev => ({ ...prev, firstName: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-base font-medium mb-2">Last Name</label>
                    <Input required value={bookingData.lastName} onChange={e => setBookingData(prev => ({ ...prev, lastName: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-base font-medium mb-2">Email</label>
                  <Input type="email" required value={bookingData.email} onChange={e => setBookingData(prev => ({ ...prev, email: e.target.value }))} />
                </div>
                {/* Estimated Arrival Time */}
                <div>
                  <label className="block text-base font-medium mb-2">Estimated Arrival Time (optional)</label>
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
                  <label className="block text-base font-medium mb-2">Country</label>
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
                {/*
                {!user && (
                  <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <input type="checkbox" id="createAccount" checked={bookingData.createAccount} onChange={e => setBookingData(prev => ({ ...prev, createAccount: e.target.checked, password: e.target.checked ? prev.password : '' }))} className="h-4 w-4" />
                      <label htmlFor="createAccount" className="text-base font-medium">Create an account to manage your bookings</label>
                    </div>
                    {bookingData.createAccount && (
                      <div className="space-y-2">
                        <label className="block text-base font-medium">Password</label>
                        <Input type="password" value={bookingData.password} onChange={e => setBookingData(prev => ({ ...prev, password: e.target.value }))} required={bookingData.createAccount} placeholder="••••••••" minLength={6} />
                        <p className="text-xs text-gray-500">Must be at least 6 characters long</p>
                      </div>
                    )}
                  </div>
                )}
                */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-14 bg-[#0E3599] hover:bg-[#0b297a] text-white rounded-full font-bold shadow-xl text-lg flex items-center justify-center mt-4 transition"
                  style={{ boxShadow: '0 6px 32px 0 rgba(56, 132, 255, 0.18)' }}
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
                  <p className="text-sm text-gray-500 text-center mt-4">Already have an account?{' '}<Link href={`/auth/sign-in?redirect=/booking`} className="text-blue-600 hover:underline">Sign in</Link></p>
                )}
              </form>
            </Card>
          </div>
          {/* Booking Summary */}
          <div>
            <Card className="p-8 bg-gray-50 rounded-2xl shadow-lg sticky top-6">
              <h2 className="font-semibold text-2xl mb-6">Booking Summary</h2>
              <div className="space-y-2 text-base">
                <div className="space-y-1 text-sm">
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
                </div>
                {bookingCart && bookingCart.cart && bookingCart.cart.length > 0 && (
                  <>
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <span className="font-semibold text-base">Apartments</span>
                    </div>
                    {bookingCart.cart.map((item: CartItem) => (
                      <div key={item.roomTypeID} className="flex flex-col gap-1 mt-1 border-b border-gray-100 pb-2">
                        <div className="flex justify-between text-base">
                          <span>{item.quantity} x {item.roomName}</span>
                          <span>MYR {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-600 pl-2">
                          <span>Adults: {item.adults}</span>
                          <span>Children: {item.children}</span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 mt-4 border-t border-gray-200 flex justify-between items-center">
                      <span className="font-semibold text-lg">Total</span>
                      <span className="font-bold text-2xl text-gray-900">
                        {cloudbedsQuote ? `MYR ${cloudbedsQuote.grandTotal.toFixed(2)}` : `MYR ${bookingCart.cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0).toFixed(2)}`}
                      </span>
                    </div>
                    {cloudbedsQuote && (
                      <div className="text-xs text-gray-600 mt-2">
                        <div>Subtotal: MYR {cloudbedsQuote.subtotal.toFixed(2)}</div>
                        <div>SST/Tax: MYR {cloudbedsQuote.sst.toFixed(2)}</div>
                        <div>Grand Total: MYR {cloudbedsQuote.grandTotal.toFixed(2)}</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
        {/* Property Information Section */}
        {propertyId && <div className="mt-12"><PropertyInformation propertyId={propertyId} /></div>}
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