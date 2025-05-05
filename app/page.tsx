"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { BookingWidget } from "@/components/booking-widget"
import { Toaster } from "sonner"
import { RoomsSection } from "@/components/rooms-section"
import { PropertiesSection } from "@/components/properties-section"
import { CustomerReviews } from "@/components/customer-reviews"

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

interface Amenity {
  icon: string;
  title: string;
  description: string;
}

// Restore amenities array
const amenities = [
  {
    icon: "🏠",
    title: "24/7 Support",
    description: "Round-the-clock assistance for all your needs during your stay",
  },
  {
    icon: "🧺",
    title: "Full Laundry",
    description: "Washing machine, dryer and premium detergent in every apartment",
  },
  {
    icon: "📺",
    title: "Entertainment",
    description: "Smart TVs with Netflix, high-speed WiFi, and streaming devices",
  },
  {
    icon: "🛁",
    title: "Premium Amenities",
    description: "Luxury toiletries, plush towels, and hotel-quality linens",
  },
]

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Toaster />
      <main className="flex-1 pt-0">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white py-24">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-20 -top-20 w-[400px] h-[400px] rounded-full bg-gray-50" />
            <div className="absolute left-20 bottom-20 w-[200px] h-[200px] rounded-full bg-gray-50" />
            <div className="absolute left-1/2 top-1/4 w-[150px] h-[300px] -rotate-45 rounded-3xl bg-gray-50" />
          </div>

          <div className="container relative z-10 flex flex-col items-center justify-center px-4 mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-3xl mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Soulful Stays, Memorable Days
              </h1>
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
                Premium serviced apartments in Kuala Lumpur for families, couples, and business travelers
              </p>
            </motion.div>

            {/* Booking Widget Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-full"
            >
              <BookingWidget />
            </motion.div>

            {/* Floating Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex flex-wrap justify-center gap-4 mt-8"
            >
              {["Premium Locations", "24/7 Support", "Luxury Amenities", "Best Price Guarantee"].map(
                (feature, index) => (
                  <div
                    key={index}
                    className="bg-white px-4 py-2 rounded-full text-sm text-gray-600 border border-gray-200 shadow-sm"
                  >
                    {feature}
                  </div>
                ),
              )}
            </motion.div>
          </div>
        </section>

        {/* Properties Section */}
        <section className="bg-white">
          <div className="container px-4 mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured locations</h2>
            <PropertiesSection />
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="py-24 bg-gray-50">
          <div className="container px-4 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Think Like a Guest,
                  <br />
                  Act Like an Owner
                </h2>
                <p className="text-gray-600 mb-6 text-lg">
                  Our philosophy is centered around anticipating your needs before you even realize them. We&apos;ve designed
                  each space with the care and attention we would give our own homes.
                </p>
                <p className="text-gray-600 mb-8">
                  From the premium furnishings to the thoughtful amenities, every detail is curated to ensure your
                  comfort, convenience, and an exceptional experience that keeps you coming back.
                </p>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
                className="grid grid-cols-6 grid-rows-6 gap-4 h-[500px]"
              >
                <motion.div variants={fadeIn} className="col-span-4 row-span-4 relative rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1470&auto=format&fit=crop"
                    alt="Luxury Apartment Interior"
                    fill
                    className="object-cover"
                  />
                </motion.div>
                <motion.div variants={fadeIn} className="col-span-2 row-span-3 relative rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1560448204-603b3fc33ddc?q=80&w=1470&auto=format&fit=crop"
                    alt="Modern Kitchen"
                    fill
                    className="object-cover"
                  />
                </motion.div>
                <motion.div variants={fadeIn} className="col-span-2 row-span-3 relative rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=1470&auto=format&fit=crop"
                    alt="Elegant Bedroom"
                    fill
                    className="object-cover"
                  />
                </motion.div>
                <motion.div variants={fadeIn} className="col-span-4 row-span-2 relative rounded-2xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1470&auto=format&fit=crop"
                    alt="Luxury Bathroom"
                    fill
                    className="object-cover"
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Rooms Section (moved below Value Proposition) */}
        <section>
          <div className="container px-4 mx-auto py-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured apartments</h2>
            <RoomsSection />
          </div>
        </section>

        {/* Amenities Section */}
        <section className="py-24">
          <div className="container px-4 mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Standard in Every Property</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We&apos;ve thoughtfully curated a collection of amenities to ensure your comfort and convenience, no matter
                which Soulasia property you choose.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {amenities.map((amenity: Amenity, index: number) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="text-4xl mb-4">{amenity.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{amenity.title}</h3>
                  <p className="text-gray-600">{amenity.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Ready for a Soulful Stay?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Whether you&apos;re visiting for business or pleasure, our premium apartments offer the perfect blend of comfort, convenience, and luxury.
            </p>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-24">
          <div className="container px-4 mx-auto">
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
              className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[600px]"
            >
              <motion.div variants={fadeIn} className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1528&auto=format&fit=crop"
                  alt="Petronas Twin Towers"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="text-xl font-bold text-white">Petronas Twin Towers</h3>
                  </div>
                </div>
              </motion.div>
              <motion.div variants={fadeIn} className="col-span-2 row-span-1 relative rounded-2xl overflow-hidden">
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
              <motion.div variants={fadeIn} className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden">
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
              <motion.div variants={fadeIn} className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden">
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

        {/* Customer Reviews Section (moved to bottom) */}
        <section className="bg-white">
          <CustomerReviews />
        </section>
      </main>
    </div>
  )
}
