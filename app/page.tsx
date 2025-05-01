"use client"

import Image from "next/image"
import { Heart, Share, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { BookingWidget } from "@/components/booking-widget"
import { Toaster } from "sonner"

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

interface Review {
  name: string;
  location: string;
  rating: number;
  comment: string;
  image: string;
  date: string;
}

// Restore amenities and reviews arrays
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

const reviews = [
  {
    name: "Rachel",
    location: "United Kingdom",
    rating: 5,
    comment:
      "Exceptional! The apartment exceeded all our expectations. Spotlessly clean with excellent facilities and a stunning view.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1374&auto=format&fit=crop",
    date: "March 2023",
  },
  {
    name: "Thomas",
    location: "Australia",
    rating: 5,
    comment:
      "Perfect apartment for our family. Spacious, well-equipped and in an ideal location. The host was incredibly responsive.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1374&auto=format&fit=crop",
    date: "February 2023",
  },
  {
    name: "Laura",
    location: "United States",
    rating: 5,
    comment:
      "Superb location and beautiful apartment. Everything was thoughtfully prepared and the check-in process was seamless.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1470&auto=format&fit=crop",
    date: "January 2023",
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
                <Button className="rounded-lg">Learn about our approach</Button>
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

        {/* Featured Property */}
        <section className="py-24 bg-gray-50">
          <div className="container px-4 mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Property</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience our most popular apartment, offering stunning views and exceptional amenities
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className="bg-white rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-[400px] lg:h-auto">
                  <Image
                    src="/placeholder.svg"
                    alt="Featured Property"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-8 lg:p-12 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">Featured Property</h3>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Share className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Heart className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center mb-6">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium">5.0 (124 reviews)</span>
                  </div>

                  <p className="text-gray-600 mb-6">
                    This is a placeholder for the featured property. The actual property data should be fetched and displayed here.
                  </p>

                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        $0 <span className="text-sm font-normal text-gray-500">/ night</span>
                      </p>
                    </div>
                    <Button className="rounded-lg">View details</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-24">
          <div className="container px-4 mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Guests Say</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Don&apos;t just take our word for it. Here&apos;s what our guests have to say about their Soulasia experience.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {reviews.map((review: Review, index: number) => (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                      <Image src={review.image || "/placeholder.svg"} alt={review.name} fill className="object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold">{review.name}</h4>
                      <p className="text-sm text-gray-500">{review.location}</p>
                    </div>
                  </div>

                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i: number) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>

                  <p className="text-gray-600 mb-4">&quot;{review.comment}&quot;</p>

                  <p className="text-sm text-gray-500">{review.date}</p>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center mt-12">
              <Button variant="outline" className="rounded-lg">
                View all reviews
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 text-white overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1508964942454-1a56651d54ac?q=80&w=1635&auto=format&fit=crop"
              alt="Kuala Lumpur Skyline"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-blue-600/70" />
          </div>
          <div className="container relative z-10 px-4 mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready for a Soulful Stay?</h2>
              <p className="text-white/80 max-w-2xl mx-auto mb-8">
                Whether you&apos;re visiting for business or pleasure, our premium apartments offer the perfect blend of
                comfort, convenience, and luxury.
              </p>
              <Button className="bg-white text-blue-600 hover:bg-white/90 rounded-lg text-lg px-8 py-6">
                Book Your Stay Now
              </Button>
            </motion.div>
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
      </main>
    </div>
  )
}
