"use client";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Map, { Marker } from 'react-map-gl';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Search, Users, CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { calculateTotalGuests } from '@/lib/guest-utils';

// Store static lat/lng for each propertyId
const propertyLocationMap: Record<string, { lat: number; lng: number }> = {
  '270917': { lat: 3.163265, lng: 101.710802 }, // Scarletz Suites, KL
  '19928': { lat: 3.1579, lng: 101.7075 }, // Vortex KLCC (example coordinates)
  '318151': { lat: 3.1595, lng: 101.7051 }, // 188 Suites KLCC By Soulasia
  '318256': { lat: 3.1376, lng: 101.6998 }, // Opus Residences
};

// Images for each property
const propertyImagesMap: Record<string, string[]> = {
  '270917': [
    "/properties/Scarletz/DSC01327.jpg",
    "/properties/Scarletz/DSC01330.jpg",
    "/properties/Scarletz/DSC01351.jpg",
    "/properties/Scarletz/DSC01369.jpg",
    "/properties/Scarletz/DSC01531.jpg",
  ],
  '19928': [
    "/properties/Vortex/54c2879c_z copy 2.jpg",
    "/properties/Vortex/136238147.jpg",
    "/properties/Vortex/1692538_17102617240058359604.jpg",
    "/properties/Vortex/2332762_17082017030055533594.jpg",
    "/properties/Vortex/vortex_external.JPG",
    "/properties/Vortex/vortex_photo_gym_fitness.jpg",
    "/properties/Vortex/2332762_17082017030055533596.jpg",
  ],
  '318151': [
    "/properties/188/card.jpg",
  ],
  '318256': [
  "/properties/Opus/opus-by-soulasia-17.jpg",
],
};

export default function PropertiesPage() {
  const p = useParams() as { propertyId?: string | string[] };
const propertyId = typeof p.propertyId === 'string'
  ? p.propertyId
  : Array.isArray(p.propertyId)
    ? p.propertyId[0]
    : '270917';
  let pageTitle = 'Soulasia | Property';
  if (propertyId === '270917') pageTitle = 'Soulasia | Scarletz KLCC Apartments by Soulasia';
  else if (propertyId === '19928') pageTitle = 'Soulasia | Vortex KLCC Apartments by Soulasia';
  else if (propertyId === '318151') pageTitle = 'Soulasia | 188 Suites KLCC by Soulasia';
  else if (propertyId === '318256') pageTitle = 'Soulasia | Opus Residences by Soulasia';
  const isVortex = propertyId === "19928";
  const propertyImages = propertyImagesMap[String(propertyId)] || propertyImagesMap['270917'];
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev
  const total = propertyImages.length;
  const router = useRouter();

  // State for dynamic map position (for 19928)
  const [dynamicMapPosition, setDynamicMapPosition] = useState<{ lat: number; lng: number } | null>(null);
  const mapPosition = isVortex && dynamicMapPosition ? dynamicMapPosition : propertyLocationMap[String(propertyId)];

  // Responsive: show 1 image on mobile, 2 on desktop
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Carousel logic
  const handlePrev = () => {
    setDirection(-1);
    setCarouselIndex((prev) => (prev - 1 + total) % total);
  };
  const handleNext = () => {
    setDirection(1);
    setCarouselIndex((prev) => (prev + 1) % total);
  };

  const getVisibleImages = (): string[] => {
    if (!Array.isArray(propertyImages) || total < 1) return [];
    if (isMobile) {
      return [propertyImages[carouselIndex % total]];
    } else {
      if (total < 4) return propertyImages;
      // Show 4 images
      const idxs = [0, 1, 2, 3].map(i => (carouselIndex + i) % total);
      return idxs.map(idx => propertyImages[idx]);
    }
  };
  const visibleImages: string[] = getVisibleImages();

  // Booking widget state
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [adults, setAdults] = useState('2');
  const [children, setChildren] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  const handleBookNow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date?.from || !date?.to) return;
    setSubmitting(true);
    const totalGuests = calculateTotalGuests(Number(adults), Number(children));
    const params = new URLSearchParams({
      propertyId: propertyId.toString(),
      startDate: format(date.from, 'yyyy-MM-dd'),
      endDate: format(date.to, 'yyyy-MM-dd'),
      adults,
      children,
      guests: totalGuests.toString(),
    });
    router.push(`/search?${params.toString()}`);
  };

  // Fetch and geocode location for Vortex (19928)
  useEffect(() => {
    if (!isVortex) return;
    async function fetchAndGeocode() {
      try {
        const res = await fetch(`/api/cloudbeds/property?propertyId=19928`);
        const data = await res.json();
        if (data.success && data.hotel && data.hotel.propertyAddress) {
          const address = data.hotel.propertyAddress;
          const addressString = [
            address.propertyAddress1,
            address.propertyCity,
            address.propertyState,
            address.propertyPostalCode,
            address.propertyCountry
          ].filter(Boolean).join(", ");
          // Geocode
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}`);
          const geoData = await geoRes.json();
          if (geoData && geoData.length > 0) {
            setDynamicMapPosition({ lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon) });
          }
        }
      } catch {
        // fallback to static
      }
    }
    fetchAndGeocode();
  }, [isVortex]);

  return (
    <>
      <title>{pageTitle}</title>
      <div className="flex flex-col min-h-screen bg-white">
        <main className="flex-1">
          {/* Hero Section: Carousel with four square images on desktop, one square image on mobile */}
          <section className="relative w-full bg-gray-100 px-2 md:px-4">
            <div className="w-full">
              {/* Mobile: one square image, Desktop: four square images */}
              <div className="relative w-full aspect-square md:aspect-[4/1] rounded-b-2xl overflow-hidden flex items-center">
                <div className="relative w-full h-full">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={carouselIndex}
                      custom={direction}
                      initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="flex w-full h-full gap-4 absolute top-0 left-0"
                    >
                      {visibleImages.map((src: string, idx: number) => (
                        <div
                          key={idx}
                          className={
                            isMobile
                              ? "relative h-full w-full min-w-0 aspect-square rounded-2xl overflow-hidden"
                              : "relative h-full w-1/4 min-w-0 aspect-square rounded-2xl overflow-hidden"
                          }
                        >
                          <Image
                            src={src}
                            alt={`Property image ${carouselIndex + idx + 1}`}
                            fill
                            className="object-cover object-center"
                            sizes={isMobile ? "100vw" : "25vw"}
                            priority={carouselIndex === 0 && idx === 0}
                          />
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
                {/* Carousel navigation arrows */}
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                  onClick={handlePrev}
                  aria-label="Previous images"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow"
                  onClick={handleNext}
                  aria-label="Next images"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </section>

          {/* Two columns: left (info), right (sticky booking widget) */}
          <section className="w-full max-w-6xl mx-auto px-4 mt-12 flex flex-col md:flex-row gap-8">
            {/* Left: Property Info */}
            <div className="flex-1 min-w-0">
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
                {propertyId === '19928'
  ? 'Vortex KLCC Apartments'
  : propertyId === '318151'
    ? '188 Suites KLCC by Soulasia'
    : propertyId === '318256'
      ? 'Opus Residences by Soulasia'
      : 'Scarletz KLCC Apartments by Soulasia'}
                  <span className="ml-2 text-base font-normal text-gray-400">(ID: {propertyId})</span>
                </h1>
                <div className="flex flex-wrap gap-4 text-gray-600 text-base mb-2">
                  <span>Apartment Type: Studio & 1 Bedroom</span>
                  <span>•</span>
                  <span>2 Bathrooms</span>
                </div>
              </div>
              {/* Property Description */}
<section className="mb-12">
  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">About this property</h2>
  <div className="text-gray-700 leading-relaxed space-y-6">
    
    {/* Intro paragraph */}
    <p>
      {propertyId === '19928'
        ? "Welcome to Vortex KLCC Apartments, your stylish home away from home. Enjoy modern decor, a fully equipped kitchen, and a dining area with stunning views. Located near Kuala Lumpur City Center Business District, you're close to top attractions and amenities. Our building offers a rooftop pool and gym with breathtaking views, perfect for relaxation. Plus, our co-working space provides fast internet and panoramic views, ideal for productivity."
        : propertyId === '318151'
          ? "Welcome to 188 Suites KLCC by Soulasia. Spacious layouts, a practical kitchenette, and floor-to-ceiling windows make it a solid choice for both short and extended stays. You’re a short walk from KLCC and Pavilion, with dining and transit right at your doorstep."
          : "Welcome to Scarletz KLCC Apartments by Soulasia, your stylish home away from home. Enjoy modern decor, a fully equipped kitchen, and a dining area with stunning views. Located near Kuala Lumpur City Center Business District, you're close to top attractions and amenities. Our building offers a rooftop pool and gym with breathtaking views, perfect for relaxation. Plus, our co-working space on the 44th floor provides fast internet and panoramic views, ideal for productivity."}
    </p>

    {/* Co-working Space */}
    <p>
      <strong>Co-working Space</strong><br />
      {propertyId === '19928'
        ? "Discover our modern co-working space, designed to inspire creativity and productivity. This bright, stylish area offers a comfortable environment for focused work or collaborative projects, perfect for freelancers, remote workers, or those seeking a change of scenery. Enjoy panoramic views and fast internet, making it an ideal spot to boost your productivity and connect with like-minded professionals."
        : propertyId === '318151'
          ? "At 188 Suites, you’ll have fast in-room Wi-Fi suitable for remote work. If you prefer a full co-working setup, several KLCC shared offices and cafes are within walking distance."
          : "Head up to the 44th floor and discover our modern co-working space, designed to inspire creativity and productivity. This bright, stylish area offers a comfortable environment for focused work or collaborative projects, perfect for freelancers, remote workers, or those seeking a change of scenery. What's more, access to this space is included in your rent, providing flexibility and convenience to work on your schedule. Enjoy panoramic views and fast internet, making it an ideal spot to boost your productivity and connect with like-minded professionals."}
    </p>

    {/* Water Filter */}
    <p>
      <strong>Water Filter</strong><br />
      {propertyId === '19928'
        ? "In Vortex KLCC, convenience and comfort are top priorities. That's why each apartment is equipped with water filters, providing you with clean and refreshing water right from your tap. Not only does this save you time and energy, but it also eliminates the need to carry heavy water bottles. Enjoy the ease and sustainability of having filtered water on hand whenever you need it."
        : propertyId === '318151'
          ? "At 188 Suites KLCC by Soulasia, selected units include in-room water filters for convenient, clean drinking water. Where not available, complimentary bottled water is provided on arrival."
          : "In Scarletz KLCC by Soulasia convenience and comfort are top priorities. That's why each apartment is equipped with Cuckoo water filters, providing you with clean and refreshing water right from your tap. Not only does this save you time and energy, but it also eliminates the need to carry heavy water bottles. Enjoy the ease and sustainability of having filtered water on hand whenever you need it."}
    </p>

    {/* Wi-Fi & Facilities */}
    <p>
      <strong>Wi-Fi</strong><br />
      {propertyId === '19928'
        ? "Take a dip in the breathtaking rooftop swimming pool and enjoy panoramic city views. It's the perfect place to unwind and relax. Stay active at the state-of-the-art gym, featuring a wide variety of equipment to help you reach your fitness goals. On the ground floor, you'll find a handy convenience store for all your everyday essentials, making life just a little bit easier. At Vortex KLCC, you'll find everything you need for a comfortable and enjoyable stay."
        : propertyId === '318151'
          ? "Enjoy reliable Wi-Fi for both leisure and work. Facilities typically include access to a swimming pool and gym within the building. The location also puts you steps from KLCC, Avenue K, and LRT access for easy city movement."
          : "Take a dip in the breathtaking rooftop swimming pool and enjoy panoramic city views. It's the perfect place to unwind and relax. Stay active at the state-of-the-art gym, featuring a wide variety of equipment to help you reach your fitness goals. On the ground floor, you'll find a handy convenience store for all your everyday essentials, making life just a little bit easier. Stop by the cozy coffee booth for your morning brew or a relaxing chat with friends. At Scarletz KLCC, you'll find everything you need for a comfortable and enjoyable stay."}
    </p>

  </div>
</section>
              {/* Amenities Section (placeholders) */}
              <section className="mb-12">
                <h3 className="text-xl md:text-2xl font-bold mb-8 text-gray-900 text-center">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: "Co-working Space" },
                    { label: "Water Filter" },
                    { label: "Wi-Fi" },
                    { label: "Rooftop Pool" },
                    { label: "Gym" },
                    { label: "Convenience Store" },
                    { label: "Coffee Booth" },
                  ].map((amenity, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl">
                        {/* Placeholder icon */}
                        <span>🏢</span>
                      </div>
                      <span className="text-gray-700 text-sm text-center">{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </section>
              {/* Map Section (static Mapbox map) */}
              <section className="mb-12">
                <h3 className="text-xl md:text-2xl font-bold mb-8 text-gray-900 text-center">Location</h3>
                <div className="w-full h-64 rounded-xl overflow-hidden shadow bg-white flex items-center justify-center">
                  {(
                    // For Vortex, only show map after geocoding is done
                    (isVortex && dynamicMapPosition) ||
                    // For other properties, always show map
                    (!isVortex && mapPosition)
                  ) ? (
                    <Map
                      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                      initialViewState={{ longitude: mapPosition.lng, latitude: mapPosition.lat, zoom: 15 }}
                      style={{ width: '100%', height: '100%' }}
                      mapStyle="mapbox://styles/mapbox/streets-v11"
                    >
                      <Marker longitude={mapPosition.lng} latitude={mapPosition.lat} anchor="bottom">
                        <div style={{ fontSize: 32, color: '#3b82f6' }}>📍</div>
                      </Marker>
                    </Map>
                  ) : (
                    <span className="text-gray-400 text-sm text-center px-2">Location not found on map.</span>
                  )}
                </div>
              </section>
            </div>
            {/* Right: Sticky Booking Widget */}
            <div className="w-full md:w-[400px] flex-shrink-0 md:pl-4">
              <div className="md:sticky md:top-24">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 max-w-full flex flex-col gap-2 px-4 py-6">
                  <div className="text-lg font-semibold text-gray-900 mb-2 px-2">Book this property</div>
                  <form className="flex flex-col gap-1" onSubmit={handleBookNow}>
                    <div className="px-2 py-1">
                      <label className="block text-sm font-medium text-gray-800 mb-1">Dates</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start p-0 font-normal text-left",
                              !date?.from && "text-gray-400"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from && date?.to
                              ? `${format(date.from, "MMM d, yyyy")} - ${format(date.to, "MMM d, yyyy")}`
                              : <span>Pick dates</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={1}
                            initialFocus
                            className="rounded-lg border border-border p-2"
                            disabled={{ before: new Date() }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="px-2 py-1">
                      <label className="block text-sm font-medium text-gray-800 mb-1">Adults</label>
                      <Select
                        value={adults}
                        onValueChange={(value: string) => setAdults(value)}
                      >
                        <SelectTrigger className="w-full border-0 p-0 h-auto font-normal">
                          <SelectValue>
                            <div className="flex items-center">
                              <Users className="mr-2 h-4 w-4" />
                              {adults} {parseInt(adults) === 1 ? 'adult' : 'adults'}
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? 'adult' : 'adults'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="px-2 py-1">
                      <label className="block text-sm font-medium text-gray-800 mb-1">Children</label>
                      <Select
                        value={children}
                        onValueChange={(value: string) => setChildren(value)}
                      >
                        <SelectTrigger className="w-full border-0 p-0 h-auto font-normal">
                          <SelectValue>
                            <div className="flex items-center">
                              <Users className="mr-2 h-4 w-4" />
                              {children} {parseInt(children) === 1 ? 'child' : 'children'}
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? 'child' : 'children'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="submit"
                      className="mt-4 w-full h-12 rounded-full text-white shadow-lg text-base font-semibold"
                      style={{ backgroundColor: '#0E3599', border: 'none' }}
                      onMouseOver={e => (e.currentTarget.style.backgroundColor = '#102e7a')}
                      onMouseOut={e => (e.currentTarget.style.backgroundColor = '#0E3599')}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Search className="w-5 h-5" />
                      )}
                      <span className="ml-2">Book Now</span>
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
