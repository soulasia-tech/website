"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Toaster } from "sonner"
import { CustomerReviews } from "@/components/blocks/customer-reviews"
import { Locations } from "@/components/blocks/locations"
import { allLocationsCache, CachedProperties, CachedRooms, CachedRates } from "@/lib/allLocationsCache"
import React, { useEffect } from "react"
import {BookingWidgetNew} from "@/components/booking-widget-new";
import {Experience} from "@/components/blocks/experience";

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

  return (
    <>
      <title>Soulasia | Soulful Stays, Memorable Days.</title>
      <div className="flex flex-col min-h-screen bg-white pt-0 -mt-nav">
        <Toaster />
        {/* Hero Section (without BookingWidget) */}
        <section
            className="relative overflow-hidden bg-white pt-24 tb:pt-50 tb:pb-20 lp:py-32 lp:min-h-[65vh] flex items-center ">
          {/* Decorative Elements */}
          <div className="absolute inset-0 w-full h-full z-0">
            <Image
                src="/media-assets/asset4.png"
                alt="Soulasia Hero Background"
                fill
                priority
                quality={80}
                sizes="100vw"
                className="dark-header object-cover max-h-[350px] tb:max-h-full"
                style={{objectPosition: 'center 10%'}}
            />
            {/* Overlay to darken the image further */}
          </div>
          <div className="absolute inset-0 w-full h-full max-h-[350px] tb:max-h-full z-0 bg-black/20"/>

          <div className="container relative z-10 flex flex-col items-center justify-center text-center">
            <motion.div
                initial={{opacity: 0, y: 30}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.8, delay: 0.2}}
                className="max-w-5xl mb-8"
            >
              <h1 className="h1 mb-4 text-white">
                Soulful Stays, Memorable Days
              </h1>
              <div className="text-white font-normal text-sm tb:text-xl lp:text-2xl full:text-[32px] w-4/5 mx-auto">
                Premium serviced apartments in Kuala Lumpur for families, couples, and business travelers
              </div>
              {/* BookingWidget right under subheader */}
              <div className="search-widget w-full bg-transparent z-30 flex justify-center mt-8"
                   id="booking-widget-hero-anchor">
                <div className="bg-[#f9fafb] rounded-lg lp:rounded-xl mx-auto p-[10px] z-30 duration-300 w-full">
                  <BookingWidgetNew/>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        <main className="flex-1 pt-0">
          {/* Locations Section */}
          <Locations/>

          {/* Value Proposition Section - moved up */}
          {/* Hero Section */}
          <section className="section-margin-y bg-white relative mx-auto">
            <div className="tb:container mx-auto relative w-full min-h-[332px] tb:min-h-[450px] aspect-[4/3] lp:aspect-[19/10] overflow-hidden tb:rounded-[24px] z-0">
              <Image
                  src="/media-assets/asset8.png"
                  alt="Soulasia Guest"
                  fill
                  priority
                  quality={80}
                  sizes="100vw"
                  className="object-cover"
                  style={{ objectPosition: 'center 20%' }} // adjust focus area
              />
              {/* Overlay to darken the image further */}
            </div>
            {/* Overlay (optional) */}
            <div className="tb:container tb:rounded-[24px] mx-auto absolute inset-0 bg-black/30" />

            <motion.div
                initial={{opacity: 0, y: 30}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.8, delay: 0.2}}
                className="absolute container w-full inset-0 flex">
              <div className="py-10 space-y-2 tb:p-10 tb:space-y-4 lp:p-15 lp:space-y-6 text-white flex flex-col justify-start">
                <h2 className="h2 font-semibold text-[#dfdfdf]">
                  Think Like a <span className="text-white">Guest</span>,<br/>
                  Act Like an <span className="text-white">Owner</span>
                </h2>
                <div className="font-normal text-[#dfdfdf] max-w-120 text-sm tb:text-base lg:text-lg full:text-2xl">
                  {'We anticipate your needs before you realize them, designing each space with the same care as our own homes. Premium furnishings and thoughtful amenities ensure your comfort, convenience, and anexperience you\'ll want to return to'}
                </div>
                <a href="/for-owners" className="font-medium text-white text-base full:text-xl underline">
                  Read More
                </a>
              </div>

            </motion.div>
          </section>

          {/* Standard in Every Property (Combined Slider) */}
          <section className="section-padding-y relative overflow-hidden ">
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none bg-[#F9FAFB]" aria-hidden="true"/>
            <div className="container mx-auto relative z-10">
              <div className="flex justify-between header-margin-b" >
                <div className="max-w-lg text-left ">
                  <h2 className="h2 font-semibold mb-2">Standard in every property</h2>
                  <div className="font-normal text-[#3b4a68] text-base tb:text-lg lp:text-xl full:text-2xl mb-4 max-w-fit">
                    With Soulasia, expect the same quality
                    every where — thoughtful amenities, seamless technology, and a welcoming atmosphere in every
                    location</div>
                </div>
              </div>
              <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{once: true, amount: 0.2}}
                  variants={staggerContainer}
                  className=" grid grid-cols-2 lg:grid-cols-3 gap-[10px] tb:gap-[20px] full:gap-y-[30px]"
              >
                {[
                  {
                    iconSrc: "/icons/stayHassle.svg",
                    title: "Stay Hassle-Free",
                    desc: "24/7 keyless entry. No check-ins or outs"
                  },
                  {
                    iconSrc: "/icons/support.svg",
                    title: "Friendly support",
                    desc: "Our team is available 24/7 to make your stay seamless"
                  },
                  {
                    iconSrc: "/icons/nourished.svg",
                    title: "Stay nourished",
                    desc: "Breakfast partners at nearby handpicked venues"
                  },
                  {
                    iconSrc: "/icons/locations.svg",
                    title: "Prime locations",
                    desc: "Stay in the heart of the city, close to top attractions and dining"
                  },
                  {
                    iconSrc: "/icons/rested.svg",
                    title: "Stay Rested",
                    desc: "Premium beds. Luxury pillows and duvets. Black out blinds."
                  },
                  {
                    iconSrc: "/icons/sustainable.svg",
                    title: "Stay Sustainable",
                    desc: "All renewable energy. Smart recycling and minimizing waste"
                  },
                ].map((item, index) => (
                    <motion.div
                        key={index}
                        variants={fadeIn}
                        className="flex flex-col items-start transition-transform duration-300 pr-4 w-full"
                    >
                      <div className="max-w-fit">
                        <div className="mb-2 flex items-center justify-start aspect-[1/1] w-[28px] tb:w-[32px] lp:w-[40px] ">
                          <Image
                              src={item.iconSrc} alt={item.title} className="w-full h-full"
                              width={24}
                              height={24}
                          />
                        </div>
                        <h3 className="font-semibold mb-2 text-lg lp:text-xl full:text-2xl lp:mb-4 leading-tight">
                          {item.title}
                        </h3>
                        <div className="font-normal text-[#606060] text-sm tb:text-base lp:text-xl max-w-fit">{item.desc}</div>
                      </div>
                    </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* Gallery Section */}
          <Experience/>

          {/* Customer Reviews Section (moved to bottom) */}
          <CustomerReviews/>

          {/* OTA Logos Section */}
          <section className="section-padding-y bg-white">
            <h2 className="header-margin-b container h2 font-semibold mb-8">We are listed on</h2>
              <div
                    className="pl-[5%] flex gap-6 overflow-x-auto no-scrollbar
                    lp:flex lp:justify-between lp:items-center lp:gap-8 lp:px-2 lp:container lp:mx-auto
                    [mask-image:linear-gradient(to_left,transparent_1,black_25px,black_calc(100%-25px),transparent_100%)]
                    [mask-repeat:no-repeat] [mask-size:100%_100%] lp:[mask-image:none]
                    "
              >
                {Array.from({length: 8}).map((_, idx) => (
                    <Image
                        key={idx}
                        src={`/OTA/${idx + 1}.png`}
                        alt={`OTA Logo ${idx + 1}`}
                        width={140}
                        height={56}
                        className="h-14 w-auto object-contain transition bg-white rounded-lg"
                        style={{maxWidth: 150, minWidth: 100}}
                        priority={false}
                    />
                ))}
              </div>
            </section>
        </main>
      </div>
    </>
  )
}
