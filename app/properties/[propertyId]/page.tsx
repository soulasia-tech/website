"use client";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Map, { Marker } from 'react-map-gl';
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

// Store static lat/lng for each propertyId
const propertyLocationMap: Record<string, { lat: number; lng: number }> = {
  '270917': { lat: 3.163265, lng: 101.710802 }, // Scarletz Suites, KL
};

// Use real Scarletz image as placeholder 5 times
const propertyImages = [
  "/properties/Scarletz/DSC01330.jpg",
  "/properties/Scarletz/DSC01330.jpg",
  "/properties/Scarletz/DSC01330.jpg",
  "/properties/Scarletz/DSC01330.jpg",
  "/properties/Scarletz/DSC01330.jpg",
];

export default function PropertiesPage() {
  const params = useParams();
  const propertyId = params.propertyId || "270917";
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev
  const total = propertyImages.length;
  const router = useRouter();

  // Get static map position
  const mapPosition = propertyLocationMap[propertyId as string];

  // Carousel logic
  const handlePrev = () => {
    setDirection(-1);
    setCarouselIndex((prev) => (prev - 1 + total) % total);
  };
  const handleNext = () => {
    setDirection(1);
    setCarouselIndex((prev) => (prev + 1) % total);
  };

  const getVisibleImages = () => {
    if (total < 2) return propertyImages;
    const first = carouselIndex % total;
    const second = (carouselIndex + 1) % total;
    return [propertyImages[first], propertyImages[second]];
  };
  const visibleImages = getVisibleImages();

  // Booking widget state
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const handleBookNow = () => {
    if (!checkIn || !checkOut) return;
    const params = new URLSearchParams({
      propertyId: propertyId.toString(),
      startDate: checkIn.toISOString().slice(0, 10),
      endDate: checkOut.toISOString().slice(0, 10),
      adults: adults.toString(),
      children: children.toString(),
    });
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1">
        {/* Hero Section: Carousel with two images */}
        <section className="relative w-full bg-gray-100 px-2 md:px-4">
          <div className="w-full">
            <div className="relative w-full aspect-[16/7] rounded-b-2xl overflow-hidden flex items-center">
              {/* Carousel with two images and smooth animation */}
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
                    {visibleImages.map((src, idx) => (
                      <div
                        key={idx}
                        className="relative h-full w-1/2 min-w-0 rounded-2xl overflow-hidden"
                      >
                        <Image
                          src={src}
                          alt={`Property image ${carouselIndex + idx + 1}`}
                          fill
                          className="object-cover object-center"
                          sizes="50vw"
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
                Scarletz KLCC Apartments by Soulasia
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
              <div className="text-gray-700 text-lg leading-relaxed space-y-6">
                <p>Welcome to Scarletz KLCC Apartments by Soulasia, your stylish home away from home. Enjoy modern decor, a fully equipped kitchen, and a dining area with stunning views. Located near Kuala Lumpur City Center Business District, you&apos;re close to top attractions and amenities. Our building offers a rooftop pool and gym with breathtaking views, perfect for relaxation. Plus, our co-working space on the 44th floor provides fast internet and panoramic views, ideal for productivity.</p>
                <p><strong>Co-working Space</strong><br />
                Head up to the 44th floor and discover our modern co-working space, designed to inspire creativity and productivity. This bright, stylish area offers a comfortable environment for focused work or collaborative projects, perfect for freelancers, remote workers, or those seeking a change of scenery. What&apos;s more, access to this space is included in your rent, providing flexibility and convenience to work on your schedule. Enjoy panoramic views and fast internet, making it an ideal spot to boost your productivity and connect with like-minded professionals.</p>
                <p><strong>Water Filter</strong><br />
                In Scarletz KLCC by Soulasia convenience and comfort are top priorities. That&apos;s why each apartment is equipped with Cuckoo water filters, providing you with clean and refreshing water right from your tap. Not only does this save you time and energy, but it also eliminates the need to carry heavy water bottles. Enjoy the ease and sustainability of having filtered water on hand whenever you need it.</p>
                <p><strong>Wi-Fi</strong><br />
                Take a dip in the breathtaking rooftop swimming pool and enjoy panoramic city views. It&apos;s the perfect place to unwind and relax. Stay active at the state-of-the-art gym, featuring a wide variety of equipment to help you reach your fitness goals. On the ground floor, you&apos;ll find a handy convenience store for all your everyday essentials, making life just a little bit easier. Stop by the cozy coffee booth for your morning brew or a relaxing chat with friends. At Scarletz KLCC, you&apos;ll find everything you need for a comfortable and enjoyable stay.</p>
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
                {mapPosition ? (
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
          <div className="w-full md:w-[340px] flex-shrink-0 md:pl-4">
            <div className="md:sticky md:top-24">
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-6 py-6 shadow-sm flex flex-col gap-4">
                <div className="text-lg font-semibold text-gray-800 mb-2">Book your stay</div>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                    <DatePicker value={checkIn} onChange={setCheckIn} placeholder="Select date" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                    <DatePicker value={checkOut} onChange={setCheckOut} placeholder="Select date" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adults</label>
                    <Input
                      type="number"
                      min={1}
                      value={adults}
                      onChange={e => setAdults(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Children</label>
                    <Input
                      type="number"
                      min={0}
                      value={children}
                      onChange={e => setChildren(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <Button className="mt-2 w-full" onClick={handleBookNow}>Book Now</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
