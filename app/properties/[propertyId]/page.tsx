"use client";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, {useState, useEffect, useRef} from "react";
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
};

const rooms = [
  {
    id: "room-1",
    title: "Two Bedroom Apartment",
    description: "Vortex KLCC Apartments.",
    price: "MYR 161.00",
    href: "/rooms/1",
    image: "/rooms/room.svg",
  },
  {
    id: "room-2",
    title: "Two Bedroom Apartment",
    description: "Vortex KLCC Apartments.",
    price: "MYR 161.00",
    href: "/rooms/1",
    image: "/rooms/room.svg",
  },
  {
    id: "room-3",
    title: "Two Bedroom Apartment",
    description: "Vortex KLCC Apartments.",
    price: "MYR 161.00",
    href: "/rooms/1",
    image: "/rooms/room.svg",
  },
  {
    id: "room-4",
    title: "Two Bedroom Apartment",
    description: "Vortex KLCC Apartments.",
    price: "MYR 161.00",
    href: "/rooms/1",
    image: "/rooms/room.svg",
  },
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}


export default function PropertiesPage() {
  const params = useParams();
  const propertyId = params.propertyId || "270917";
  let pageTitle = 'Soulasia | Property';
  if (propertyId === '270917') pageTitle = 'Soulasia | Scarletz KLCC Apartments by Soulasia';
  else if (propertyId === '19928') pageTitle = 'Soulasia | Vortex KLCC Apartments by Soulasia';
  const isVortex = propertyId === "19928";
  const propertyImages = propertyImagesMap[String(propertyId)] || propertyImagesMap['270917'];
  const total = propertyImages.length;
  const router = useRouter();

  // State for dynamic map position (for 19928)
  const [dynamicMapPosition, setDynamicMapPosition] = useState<{ lat: number; lng: number } | null>(null);
  const mapPosition = isVortex && dynamicMapPosition ? dynamicMapPosition : propertyLocationMap[String(propertyId)];

  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  // clamp so we don't scroll past the last visible card
  const next = () => {
    if (trackRef.current) {
      const card = trackRef.current.querySelector("div");
      if (card) {
        const cardWidth = (card as HTMLElement).offsetWidth;
        const maxScroll =
            trackRef.current.scrollWidth - trackRef.current.clientWidth ;

        setOffset((o) => Math.min(o + cardWidth, maxScroll));
      }
    }
  };

  const prev = () => {
    if (trackRef.current) {
      const card = trackRef.current.querySelector("div");
      if (card) {
        const cardWidth = (card as HTMLElement).offsetWidth;
        setOffset((o) => Math.max(o - cardWidth, 0));
      }
    }
  };

  const getVisibleImages = (): string[] => {
    if (!Array.isArray(propertyImages) || total < 1) return [];
    return propertyImages;
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
        <main className="py-8 bg-white">
          <div className="container">
            {/* Back button */}
            <button className="flex items-center gap-1 text-medium text-[#4a4f5b] border border-[#dee3ed] hover:bg-[#F9FAFB]
                  mb-4 lp:mb-5 rounded-lg tb:rounded-[10px] px-2 py-1 tb:px-3 tb:py-2 lp:px-4 lp:py-3
                  text-xs tb:text-sm lp:text-base">
              <svg className="w-3 h-3 lp:w-4 lp:h-4" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.666 8H3.33268" stroke="#4A4F5B" stroke-width="1.33333" stroke-linejoin="round"/>
                <path d="M8 12.667L3.33333 8.00033L8 3.33366" stroke="#4A4F5B" stroke-width="1.33333"
                      stroke-linejoin="round"/>
              </svg>
              Back
            </button>

            {/* Title & meta */}
            <div className="mb-6 gap-2 space-y-3 lp:space-y-5">
              <h1 className="h1 font-semibold text-[#101828] ">
                Scarletz KLCC Apartments by Soulasia
              </h1>
              <div className="flex flex-col lp:flex-row lp:justify-between gap-2">
                <div className="flex tb:space-y-0 items-center gap-1 lp:gap-3 text-sm text-[#4A4F5B]">
                  <img src="/icons/location-grey.svg" alt="" className="w-4 h-4 tb:w-5 tb:h-5"/>
                  <span className="text-xs tb:text-sm lp:text-base">800m from Twin Towers</span>
                </div>
                <div className="flex tb:space-y-0 items-center gap-1 lp:gap-3 text-sm text-[#4A4F5B]">
                  <div className="flex items-center gap-1">
                    <img src="/icons/bed.svg" alt="" className="w-4 h-4 tb:w-5 tb:h-5"/>
                    <span className="text-xs tb:text-sm lp:text-base">Studio & 1 Bedroom</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <img src="/icons/shower.svg" alt="" className="w-4 h-4 tb:w-5 tb:h-5"/>
                    <span className="text-xs tb:text-sm lp:text-base">3 Bathrooms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery */}
          <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{once: true, margin: "-100px"}}
              variants={fadeIn}
              className="relative overflow-hidden w-full"
          >
            {/* Track */}
            <div
                ref={trackRef}
                className="flex transition-transform duration-700 "
                style={{transform: `translateX(-${offset}px)`}}
            >
              {visibleImages.map((src: string, idx: number) => (
                  <div
                      key={idx}
                      className="flex-shrink-0 basis-3/4 tb:basis-2/5 lp:basis-2/7 full:basis-5/15 group overflow-hidden px-1 tb:px-2.5  last:pr-0 ">
                    <div
                        className="relative w-full aspect-[5/4] h-[210px] tb:h-[260px] lp:h-[286px] full:h-[380px]">
                      <Image
                          src={src}
                          alt={`Property image ${idx + 1}`}
                          fill
                          // sizes="(max-width: 768px) 100vw, 400px"
                          className="object-cover rounded-xl"
                      />
                    </div>
                  </div>
              ))}
            </div>
            <div onClick={prev}
                 className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white flex items-center rounded-md justify-center aspect-[1/1] w-[32px] lp:w-[40px]">
              <img src="/icons/arrow.svg" alt="" className="transform rotate-180"/>
            </div>
            <div onClick={next}
                 className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white mb-2 flex items-center rounded-md justify-center aspect-[1/1] w-[32px] lp:w-[40px]">
              <img src="/icons/arrow.svg" alt=""/>
            </div>
          </motion.div>

          <div
              className="mt-15 container grid grid-cols-1 lp:grid-cols-3 mb-12 gap-8 space-y-4 tb:space-y-5 lp:space-y-6">
            <div className="col-span-1 lg:col-span-2 space-y-6">
              {/* About */}
              <section>
                <h2 className="h2 font-semibold mb-3 tb:mb-4 lp:mb-5">About this property</h2>
                <div
                    className="text-normal text-[#3b4a68] text-base tb:text-lg lp:text-xl full:text-2xl mb-4 max-w-fit">
                  Welcome to Scarletz KLCC Apartments by Soulasia, your stylish home away from home. Enjoy modern decor,
                  a fully equipped kitchen, and a dining area with stunning views. Located near Kuala Lumpur City Center
                  Business District, you're close to top attractions and amenities. Our building offers a rooftop pool
                  and gym with breathtaking views, perfect for relaxation. Plus, our co-working space on the 44th floor
                  provides fast internet and panoramic views, ideal for productivity.
                </div>
              </section>
              <div className="border border-[#dee3ed] "></div>
              <section>
                <h2 className="h2 font-semibold mb-3 tb:mb-4 lp:mb-5">Amenities</h2>
                <ul className="grid grid-cols-2 gap-4 text-[#101828]">
                  {[
                    {icon: '/icons/coworking.svg', label: "Co-working Space"},
                    {icon: '/icons/water.svg', label: "Water Filter"},
                    {icon: '/icons/wifi.svg', label: "Wi-Fi"},
                    {icon: '/icons/pool.svg', label: "Rooftop Pool"},
                    {icon: '/icons/gym.svg', label: "Gym"},
                    {icon: '/icons/store.svg', label: "Convenience Store"},
                    {icon: '/icons/coffee.svg', label: "Coffee Booth"},
                  ].map((amenity, idx) => (
                      <li key={idx} className="flex items-center gap-2 tb:gap-3 lp:gap-5">
                        <Image src={amenity.icon} alt="Soulasia Logo White"
                               className="aspect-[1/1] w-4 tb:w-6 lp:w-8 full:w-10" width={40} height={40} priority/>
                        <span className="text-normal text-sm tb:text-xl full:text-2xl">{amenity.label}</span>
                      </li>
                  ))}
                </ul>
              </section>
              <div className="border border-[#dee3ed] my-4 tb:my-5 lp:my-6"></div>
              {/* Rooms */}
              <section>
                <h2 className="h2 font-semibold mb-3 tb:mb-4 lp:mb-5">Rooms</h2>
                <div className="grid grid-cols-2 gap-6">
                  {rooms.map((item) => (
                      <div
                          key={item.id}
                          className="flex-shrink-0 overflow-hidden space-y-[16px] lp:space-y-[20px]"
                      >
                        <div className="relative w-full aspect-[4/3] full:aspect-[16/9]">
                          <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              quality={90}
                              sizes="(max-width: 768px) 100vw, 400px"
                              className="object-cover rounded-xl"
                          />
                        </div>
                        <div className="space-y-[6px] lp:space-y-[10px]">
                          <h3 className="h3 font-semibold">{item.title}</h3>
                          <div className="text-normal text-[#3b4a68] text-sm tb:text-base lp:text-lg full:text-xl max-w-fit">
                            {item.description}
                          </div>
                          <div className="inline-flex items-center text-[#0E3599] font-semibold text-base tb:text-lg lp:text-xl hover:underline gap-2">
                            {item.price} <span className="font-normal text-[#3b4a68] text-xs tb:text-base">per night</span>
                          </div>
                        </div>

                      </div>
                  ))}
                </div>
              </section>
              {/* Map */}
              <section>
                <h2 className="h2 font-semibold mb-3 tb:mb-4 lp:mb-5">Location</h2>
                <div
                    className="w-full aspect-[4/3] tb:aspect-[16/9] rounded-lg overflow-hidden shadow bg-white flex items-center justify-center">
                  {(
                      // For Vortex, only show map after geocoding is done
                      (isVortex && dynamicMapPosition) ||
                      // For other properties, always show map
                      (!isVortex && mapPosition)
                  ) ? (
                      <Map
                          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                          initialViewState={{longitude: mapPosition.lng, latitude: mapPosition.lat, zoom: 15}}
                          style={{width: '100%', height: '100%'}}
                          mapStyle="mapbox://styles/mapbox/streets-v11"
                      >
                        <Marker longitude={mapPosition.lng} latitude={mapPosition.lat} anchor="bottom">
                          <div style={{fontSize: 32, color: '#3b82f6'}}>📍</div>
                        </Marker>
                      </Map>
                  ) : (
                      <span className="text-gray-400 text-sm text-center px-2">Location not found on map.</span>
                  )}
                </div>
              </section>
            </div>
            {/* Right: Sticky Booking Widget */}
            <div className="col-span-1 w-full flex-shrink-0">
              <div className="lp:sticky lp:top-24">
                <div
                    className="flex flex-col bg-[#f9fafb] rounded-xl max-w-full p-6 ">
                  <div className="font-semibold text-black text-xl tb:text-2xl mb-4 tb:mb-5">Search apartments</div>
                  <form className="flex flex-col gap-4" onSubmit={handleBookNow}>
                    <div className={["flex items-center bg-white border border-[#DEE3ED] rounded-lg px-3",
                      "h-[var(--action-h-lg)] tb:h-[var(--action-h-3xl)]"].join(' ')}
                    >
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                              variant="ghost"
                              className={cn(
                                  "w-full justify-start p-0 font-normal text-left",
                                  !date?.from && "text-gray-400"
                              )}
                          >
                            {date?.from && date?.to
                                ? `${format(date.from, "MMM d, yyyy")} - ${format(date.to, "MMM d, yyyy")}`
                                : (
                                    <div className="flex gap-3 items-center">
                                      <img src="/icons/calendar.svg" alt="" className="aspect-[1/1] w-4 tb:w-6"/>
                                      <div className="font-normal text-xs tb:text-s text-[#4a4f5b]">Pick dates</div>
                                    </div>
                              )
                            }
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
                              disabled={{before: new Date()}}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className={["flex items-center bg-white border border-[#DEE3ED] rounded-lg px-3",
                      "h-[var(--action-h-lg)] tb:h-[var(--action-h-3xl)]"].join(' ')}
                    >
                      <div className="flex items-center justify-between w-full gap-6">
                        <div className="flex gap-3 items-center">
                          <img src="/icons/adults.svg" alt="" className="aspect-[1/1] w-4 tb:w-6"/>
                          <div className="font-normal text-xs tb:text-s text-[#4a4f5b]">Adults</div>
                        </div>
                        <div className="flex items-center gap-2 tb:gap-4">
                          <Button type="button" size="responsive" variant="outline"
                                  disabled={parseInt(adults) <= 1}
                                  className="text-lg tb:text-2xl size-[var(--action-h-sm)] tb:size-[var(--action-h-lg)]"
                                  onClick={() => setAdults((parseInt(adults) - 1).toString())}>-</Button>
                          <span
                              className="font-semibold text-xs tb:text-base text-[#101828] text-center">{adults}</span>
                          <Button type="button" size="responsive" variant="outline"
                                  className="bg-[#e5eeff] text-lg tb:text-2xl  size-[var(--action-h-sm)] tb:size-[var(--action-h-lg)]"
                                  onClick={() => setAdults((parseInt(adults) + 1).toString())}>+</Button>
                        </div>
                      </div>
                    </div>
                    <div className={["flex items-center bg-white border border-[#DEE3ED] rounded-lg px-3",
                      "h-[var(--action-h-lg)] tb:h-[var(--action-h-3xl)]"].join(' ')}
                    >
                      <div className="flex items-center w-full justify-between">
                        <div className="flex gap-3 items-center">
                          <img src="/icons/children.svg" alt="" className="aspect-[1/1] w-4 tb:w-6"/>
                          <div className="font-normal text-xs tb:text-s text-[#4a4f5b]">Children</div>
                        </div>
                        <div className="flex items-center gap-2 tb:gap-4">
                          <Button type="button" size="responsive" variant="outline"
                                  className="text-lg tb:text-2xl size-[var(--action-h-sm)] tb:size-[var(--action-h-lg)]"
                                  disabled={parseInt(children) <= 0}
                                  onClick={() => setChildren((parseInt(children) - 1).toString())}>-</Button>
                          <span
                              className="font-semibold text-xs tb:text-base text-[#101828] text-center">{children}</span>
                          <Button type="button" size="responsive" variant="outline"
                                  className="bg-[#e5eeff] text-lg tb:text-2xl size-[var(--action-h-sm)] tb:size-[var(--action-h-lg)]"
                                  onClick={() => setChildren((parseInt(children) + 1).toString())}>+</Button>
                        </div>
                      </div>
                    </div>
                    <Button
                        type="submit"
                        className={["flex items-center justify-center bg-[#0E3599] rounded-lg px-2  ",
                          "h-[var(--action-h-lg)] tb:h-[var(--action-h-3xl)]"].join(' ')}
                        onMouseOver={e => (e.currentTarget.style.backgroundColor = '#102e7a')}
                        onMouseOut={e => (e.currentTarget.style.backgroundColor = '#0E3599')}
                        disabled={submitting}
                    >
                      {submitting ? (
                          <Loader2 className="w-5 h-5 animate-spin"/>
                      ) : (<span className="text-white  text-sm font-medium">Book</span>)}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
  );
}
