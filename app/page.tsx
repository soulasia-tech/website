"use client"

import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { BookingWidget } from "@/components/booking-widget"
import { Toaster } from "sonner"
import { CustomerReviews } from "@/components/customer-reviews"
import { Locations } from "@/components/blocks/locations"
import { allLocationsCache, CachedProperties, CachedRooms, CachedRates } from "@/lib/allLocationsCache"
import { useEffect, useState } from "react"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { RoomCard } from "@/components/room-card"
import { Key, Smile, MapPin, Coffee, Bed, Leaf, ArrowRight } from "lucide-react"
import Link from "next/link"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Add Room type above FeaturedApartmentsCarousel
type Room = {
  roomTypeID: string;
  roomTypeName: string;
  propertyName: string;
  roomTypePhotos: { url: string; caption: string }[];
  rate: number;
};

export default function Home() {
  useEffect(() => {
    // Start background fetch for all locations data
    fetch('/api/cloudbeds-properties')
      .then(res => res.json())
      .then((data: CachedProperties) => {
        allLocationsCache.setProperties(data);
        if (data.success && Array.isArray(data.properties)) {
          // Fetch rooms and rates for all properties in parallel
          const roomTypePromises = data.properties.map((property) =>
            fetch(`/api/cloudbeds/room-types?propertyId=${property.propertyId}`).then(res => res.json() as Promise<CachedRooms>)
          );
          Promise.all(roomTypePromises).then((roomResults: CachedRooms[]) => {
            allLocationsCache.setRooms(roomResults);
          });
          const startDate = new Date().toISOString().slice(0, 10);
          const endDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
          const ratePlanPromises = data.properties.map((property) =>
            fetch(`/api/cloudbeds/rate-plans?propertyId=${property.propertyId}&startDate=${startDate}&endDate=${endDate}`).then(res => res.json() as Promise<CachedRates>)
          );
          Promise.all(ratePlanPromises).then((rateResults: CachedRates[]) => {
            allLocationsCache.setRates(rateResults);
          });
        }
      });
  }, []);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev

  // Auto-advance slider every 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % 2);
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  // Animation variants for sliding
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      transition: { duration: 0.5, ease: "easeInOut" },
    }),
  };

  // Define standards features as arrays of objects
  const standardsSlide1 = [
    { title: "Stay Hassle-Free", desc: "24/7 keyless entry. No check-ins or outs.", icon: <Key className="w-10 h-10 mb-4" style={{ color: '#0E3599' }} /> },
    { title: "Stay Hosted", desc: "Dedicated & local concierge available 24/7.", icon: <Smile className="w-10 h-10 mb-4" style={{ color: '#0E3599' }} /> },
    { title: "Stay Local", desc: "Hand picked apartments in the trendiest districts.", icon: <MapPin className="w-10 h-10 mb-4" style={{ color: '#0E3599' }} /> },
    { title: "Stay Nourished", desc: "Breakfast partners at nearby handpicked venues.", icon: <Coffee className="w-10 h-10 mb-4" style={{ color: '#0E3599' }} /> },
    { title: "Stay Rested", desc: "Premium beds. Luxury pillows and duvets. Black out blinds.", icon: <Bed className="w-10 h-10 mb-4" style={{ color: '#0E3599' }} /> },
    { title: "Stay Sustainable", desc: "All renewable energy. Smart recycling and minimizing waste.", icon: <Leaf className="w-10 h-10 mb-4" style={{ color: '#0E3599' }} /> },
  ];
  const standardsSlide2 = [
    { title: "Prime Locations", desc: "Stay in the heart of the city, close to top attractions and dining.", icon: <MapPin className="w-10 h-10 mb-4" style={{ color: '#0E3599' }} /> },
    { title: "Complimentary Coffee", desc: "Enjoy premium coffee and tea, always on the house.", icon: <Coffee className="w-10 h-10 mb-4" style={{ color: '#0E3599' }} /> },
    { title: "Luxury Sleep", desc: "Sink into plush beds with high-quality linens and blackout curtains.", icon: <Bed className="w-10 h-10 mb-4" style={{ color: '#0E3599' }} /> },
    { title: "Friendly Support", desc: "Our team is available 24/7 to make your stay seamless.", icon: <Smile className="w-10 h-10 mb-4" style={{ color: '#0E3599' }} /> },
    { title: "Smart Access", desc: "Keyless entry for your convenience and security.", icon: <Key className="w-10 h-10 mb-4" style={{ color: '#0E3599' }} /> },
    { title: "Eco-Friendly", desc: "Sustainable practices and amenities in every property.", icon: <Leaf className="w-10 h-10 mb-4" style={{ color: '#0E3599' }} /> },
  ];

  return (
    <>
      <title>Soulasia | Soulful Stays, Memorable Days.</title>
      <div className="flex flex-col min-h-screen bg-white">
        <Toaster />
        {/* Hero Section (without BookingWidget) */}
        <section className="relative overflow-hidden bg-white py-32 min-h-[85vh] flex items-center">
          {/* Decorative Elements */}
          <div className="absolute inset-0 w-full h-full z-0">
            <Image
              src="/media-assets/asset3.jpg"
              alt="Soulasia Hero Background"
              fill
              priority
              quality={80}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: 'center 10%' }}
            />
            {/* Overlay to darken the image further */}
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <div className="container mx-auto relative z-10 flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white drop-shadow-lg">
                Soulful Stays, Memorable Days
              </h1>
              <p className="text-lg md:text-xl font-semibold max-w-2xl mx-auto drop-shadow-md" style={{ color: '#fff' }}>
                Premium serviced apartments in Kuala Lumpur for families, couples, and business travelers
              </p>
              {/* BookingWidget right under subheader */}
              <div className="w-full bg-transparent z-30 flex justify-center mt-8" id="booking-widget-hero-anchor">
                <BookingWidget stickyMode="hero" />
              </div>
            </motion.div>
          </div>
        </section>
        <main className="flex-1 pt-0">
          {/* Value Proposition Section - moved up */}
          <section className="py-24 bg-gray-50 relative overflow-hidden">
            {/* Soft gradient background, contained to this section */}
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none" aria-hidden="true" style={{ background: 'linear-gradient(135deg, #f3f3f3 60%, #eaf0fa 100%)' }} />
            {/* SVG favicon pattern background */}
            <div
              className="absolute left-1/2 top-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"
              aria-hidden="true"
              style={{
                transform: 'rotate(-30deg)',
                backgroundImage: "url('/Brand/badge.svg')",
                opacity: 0.06,
                backgroundRepeat: 'repeat',
                backgroundSize: '120px 40px',
              }}
            />
            <div className="relative z-10">
              <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeIn}
                  >
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                      Think Like a <span className="text-[#0E3599]">Guest</span>,<br />
                      Act Like an <span className="text-[#0E3599]">Owner</span>
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Our philosophy is centered around anticipating your needs before you even realize them. We&apos;ve designed
                      each space with the care and attention we would give our own homes.
                    </p>
                    <p className="text-gray-600 mb-8">
                      From the premium furnishings to the thoughtful amenities, every detail is curated to ensure your
                      comfort, convenience, and an exceptional experience that keeps you coming back.
                    </p>
                    <div className="flex gap-4">
                      <Link href="/for-owners">
                        <button className="inline-flex items-center justify-center px-6 py-3 rounded-full text-base font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200">
                          Learn more
                        </button>
                      </Link>
                    </div>
                  </motion.div>

                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="grid grid-cols-6 grid-rows-6 gap-4 h-[500px]"
                  >
                    {[
                      {
                        src: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1470&auto=format&fit=crop",
                        alt: "Luxury Apartment Interior",
                        className: "col-span-4 row-span-4 relative rounded-2xl overflow-hidden",
                      },
                      {
                        src: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?q=80&w=1470&auto=format&fit=crop",
                        alt: "Modern Kitchen",
                        className: "col-span-2 row-span-3 relative rounded-2xl overflow-hidden",
                      },
                      {
                        src: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=1470&auto=format&fit=crop",
                        alt: "Elegant Bedroom",
                        className: "col-span-2 row-span-3 relative rounded-2xl overflow-hidden",
                      },
                      {
                        src: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1470&auto=format&fit=crop",
                        alt: "Luxury Bathroom",
                        className: "col-span-4 row-span-2 relative rounded-2xl overflow-hidden",
                      },
                    ].map(img => (
                      <motion.div key={img.src} variants={fadeIn} className={img.className}>
                        <Image
                          src={img.src}
                          alt={img.alt}
                          fill
                          className="object-cover"
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>
          </section>

          {/* Locations Section */}
          <Locations />

          {/* Standard in Every Property (Combined Slider) */}
          <section className="py-24 relative overflow-hidden">
            {/* Soft gradient background, contained to this section */}
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none" aria-hidden="true" style={{ background: 'linear-gradient(135deg, #f3f3f3 60%, #eaf0fa 100%)' }} />
            {/* SVG favicon pattern background */}
            <div
              className="absolute left-1/2 top-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"
              aria-hidden="true"
              style={{
                transform: 'rotate(-30deg)',
                backgroundImage: "url('/Brand/badge.svg')",
                opacity: 0.06,
                backgroundRepeat: 'repeat',
                backgroundSize: '120px 40px',
              }}
            />
            <div className="container mx-auto flex flex-col md:flex-row gap-12 items-center relative z-10">
              {/* Text Column */}
              <div className="flex-[0.8] w-full max-w-md mb-8 md:mb-0">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                  <span className="text-[#0E3599]">Standard</span> in every property
                </h2>
                <p className="text-gray-700">
                  You can always count on the same quality when you stay with Soulasia, no matter the location. Some things are customized, but others—like contactless access, fast WiFi, and 24/7 support—are always the same. Enjoy thoughtfully curated amenities, seamless technology, and a welcoming atmosphere—no matter where you stay.
                </p>
              </div>
              {/* Features Slider */}
              <div className="flex-[1.2] w-full max-w-4xl">
                <div className="flex flex-col items-center relative min-h-[420px]">
                  <div className="bg-white rounded-[2rem] p-12 shadow-2xl w-full h-full flex items-center justify-center min-h-[420px] overflow-hidden">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                      <motion.div
                        key={currentSlide}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="w-full"
                      >
                        <div className="grid grid-cols-1 grid-rows-6 md:grid-cols-3 md:grid-rows-2 w-full gap-8">
                          {(currentSlide === 0 ? standardsSlide1 : standardsSlide2).map(feature => (
                            <div key={feature.title} className="flex flex-col items-center text-center">
                              {feature.icon}
                              <div className="font-bold uppercase mb-2 tracking-wide">{feature.title}</div>
                              <div className="text-gray-600 text-sm">{feature.desc}</div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  <div className="flex justify-center gap-4 mt-6 z-10">
                    {[0, 1].map((idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setDirection(idx > currentSlide ? 1 : -1);
                          setCurrentSlide(idx);
                        }}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`w-3 h-3 rounded-full transition-colors duration-200 ${currentSlide === idx ? 'bg-gray-500' : 'bg-gray-300'}`}
                        style={{ outline: 'none', border: 'none' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 bg-white relative overflow-hidden">
            <div className="absolute inset-0 w-full h-full z-0">
              <Image
                src="/media-assets/asset2.JPG"
                alt="SoulAsia CTA Background"
                fill
                priority
                className="object-cover object-center"
                style={{ opacity: 0.5 }}
              />
            </div>
            <div className="absolute inset-0 bg-black/60 z-10" />
            <div className="container mx-auto text-center relative z-20">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready for a Soulful Stay?</h2>
              <p className="max-w-2xl mx-auto mb-8" style={{ color: '#fff' }}>
                Whether you&apos;re visiting for business or pleasure, our premium apartments offer the perfect blend of comfort, convenience, and luxury.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/all-locations" className="inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-medium text-white transition-colors" style={{ backgroundColor: '#0E3599' }} onMouseOver={e => (e.currentTarget.style.backgroundColor = '#102e7a')} onMouseOut={e => (e.currentTarget.style.backgroundColor = '#0E3599')}>
                  View All Locations
                  <ArrowRight className="ml-2 size-5" />
                </Link>
              </div>
            </div>
          </section>

          {/* Gallery Section */}
          <section className="py-24">
            <div className="container mx-auto">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Experience Kuala Lumpur</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Discover the vibrant city from the comfort of our premium apartments
                </p>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="flex flex-col gap-4 md:grid md:grid-cols-4 h-auto md:h-[600px]"
              >
                <motion.div variants={fadeIn} className="relative rounded-2xl overflow-hidden w-full aspect-[16/9] md:col-span-2 md:row-span-2 md:aspect-auto hidden md:block">
                  <Image
                    src="https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1528&auto=format&fit=crop"
                    alt="KL Tower"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 p-6">
                      <h3 className="text-xl font-bold text-white">KL Tower</h3>
                    </div>
                  </div>
                </motion.div>
                <motion.div variants={fadeIn} className="relative rounded-2xl overflow-hidden w-full aspect-[16/9] md:col-span-2 md:row-span-1 md:aspect-auto">
                  <Image
                    src="https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1528&auto=format&fit=crop"
                    alt="Batu Caves"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 p-6">
                      <h3 className="text-xl font-bold text-white">Batu Caves</h3>
                    </div>
                  </div>
                </motion.div>
                <motion.div variants={fadeIn} className="relative rounded-2xl overflow-hidden w-full aspect-[16/9] md:col-span-2 md:row-span-1 md:aspect-auto">
                  <Image
                    src="https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1528&auto=format&fit=crop"
                    alt="KLCC Park"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 p-6">
                      <h3 className="text-xl font-bold text-white">KLCC Park</h3>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>

          {/* Featured Apartments Section */}
          <section className="py-24 bg-gray-50">
            <div className="container mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Featured Apartments</h2>
              <FeaturedApartmentsCarousel />
            </div>
          </section>

          {/* Customer Reviews Section (moved to bottom) */}
          <section className="bg-white">
            <CustomerReviews />
          </section>

          {/* OTA Logos Section */}
          <section className="py-16 bg-white border-t border-gray-100">
            <div className="container mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-8">We are listed on</h2>
              <div className="flex flex-wrap md:flex-nowrap justify-center items-center gap-8 overflow-x-auto scrollbar-hide">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <Image
                    key={idx}
                    src={`/OTA/${idx + 1}.png`}
                    alt={`OTA Logo ${idx + 1}`}
                    width={140}
                    height={56}
                    className="h-14 w-auto object-contain grayscale hover:grayscale-0 transition bg-white rounded-lg p-2"
                    style={{ maxWidth: 140, minWidth: 80 }}
                    priority={false}
                  />
                ))}
              </div>
            </div>
          </section>

        </main>
      </div>
    </>
  )
}

// Featured Apartments Carousel
function FeaturedApartmentsCarousel() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch rooms logic (copy from RoomsSection, but only setRooms)
    const fetchRooms = async () => {
      try {
        const propertiesRes = await fetch('/api/cloudbeds-properties');
        const propertiesData = await propertiesRes.json();
        if (!propertiesData.success) throw new Error('Failed to load properties');
        const roomTypePromises = propertiesData.properties.map((property: unknown) =>
          fetch(`/api/cloudbeds/room-types?propertyId=${(property as { propertyId: string }).propertyId}`).then(res => res.json())
        );
        const roomsDataArr = await Promise.all(roomTypePromises);
        const startDate = new Date().toISOString().slice(0, 10);
        const endDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const ratePlanPromises = propertiesData.properties.map((property: unknown) =>
          fetch(`/api/cloudbeds/rate-plans?propertyId=${(property as { propertyId: string }).propertyId}&startDate=${startDate}&endDate=${endDate}`).then(res => res.json())
        );
        const ratesDataArr = await Promise.all(ratePlanPromises);
        const allRooms: Room[] = [];
        for (let i = 0; i < propertiesData.properties.length; i++) {
          const property = propertiesData.properties[i];
          const roomsData = roomsDataArr[i];
          const ratesData = ratesDataArr[i];
          const rateMap: Record<string, number> = {};
          if (ratesData.success && Array.isArray(ratesData.ratePlans)) {
            ratesData.ratePlans.forEach((rate: { roomTypeID: string; totalRate: number }) => {
              if (!rateMap[rate.roomTypeID] || rate.totalRate < rateMap[rate.roomTypeID]) {
                rateMap[rate.roomTypeID] = Math.round(rate.totalRate);
              }
            });
          }
          if (roomsData.success && roomsData.roomTypes) {
            const transformedRooms: Room[] = roomsData.roomTypes.map((room: unknown) => {
              const r = room as { roomTypeID: string; roomTypeName: string; roomTypePhotos?: string[] };
              return {
                roomTypeID: r.roomTypeID,
                roomTypeName: r.roomTypeName,
                propertyName: (property as { propertyName?: string }).propertyName || "",
                roomTypePhotos: (r.roomTypePhotos || []).map((url: string) => ({ url, caption: "" })),
                rate: rateMap[r.roomTypeID],
              };
            });
            allRooms.push(...transformedRooms);
          }
        }
        setRooms(allRooms);
      } catch {
        setError('Failed to fetch rooms');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  if (loading) {
    return <div className="h-80 flex items-center justify-center">Loading...</div>;
  }
  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  return (
    <Carousel
      opts={{
        align: "start",
        containScroll: "trimSnaps",
        breakpoints: {
          "(max-width: 640px)": {
            slidesToScroll: 1,
          },
          "(min-width: 641px) and (max-width: 1023px)": {
            slidesToScroll: 2,
          },
          "(min-width: 1024px)": {
            slidesToScroll: 4,
          },
        },
      }}
    >
      <CarouselContent className="px-4">
        {rooms.map((room: Room) => (
          <CarouselItem
            key={room.roomTypeID}
            className="basis-full md:basis-1/2 lg:basis-1/4 max-w-full"
          >
            <RoomCard
              roomName={room.roomTypeName}
              propertyName={room.propertyName}
              photos={room.roomTypePhotos}
              rate={room.rate}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
