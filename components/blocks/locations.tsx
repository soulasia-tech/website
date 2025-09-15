"use client";

import Image from "next/image";

import {motion} from "framer-motion";
import React, {useRef, useState} from "react";

export interface LocationsItem {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  href: string;
  image: string;
  distance: string;
  bedrooms: string;
  bathrooms: string;
}

export interface LocationsProps {
  title?: string;
  description?: string;
  items?: LocationsItem[];
}

const data: LocationsItem[] = [
  {
    id: "location-1",
    distance: '600m from Twin Towers',
    bedrooms: 'Studio & 1 Bedroom',
    bathrooms: '2 Bathrooms',
    propertyId: "270917",
    title: "Scarletz",
    description:
      "Premium serviced apartments at Scarletz, Kuala Lumpur. Modern comfort in the heart of the city.",
    href: "/properties/270917",
    image: "/properties/Scarletz/card.jpg",
  },
  {
    id: "location-2",
    distance: '600m from Twin Towers',
    bedrooms: 'Studio & 1 Bedroom',
    bathrooms: '2 Bathrooms',
    propertyId: "19928",
    title: "Vortex",
    description:
      "Modern serviced apartments at Vortex, Kuala Lumpur. Experience city living with stunning views.",
    href: "/properties/19928",
    image: "/properties/Vortex/card.jpg",
  },
  {
    id: "location-3",
    distance: '600m from Twin Towers',
    bedrooms: 'Studio & 1 Bedroom',
    bathrooms: '2 Bathrooms',
    title: "188 Suites KLCC",
    description:
      "Luxury serviced apartments at 188 Suites, Kuala Lumpur. Enjoy premium amenities and comfort.",
    href: "/properties/318151",
    image: "/properties/188/card.jpg",
  },
  {
    id: "location-4",
    distance: '600m from Twin Towers',
    bedrooms: 'Studio & 1 Bedroom',
    bathrooms: '2 Bathrooms',
    propertyId: "mercu-id",
    title: "Mercu Summer Suites",
    description:
      "Elegant serviced apartments at Mercu Summer Suites, Kuala Lumpur. Perfect for a relaxing stay.",
    href: "/properties/mercu-id",
    image: "/properties/Mercu/card.jpg",
  },
  // ✅ NEW: Opus by Soulasia
  {
    id: "location-5",
    propertyId: "318256",
    distance: '600m from Twin Towers',
    bedrooms: 'Studio & 1 Bedroom',
    bathrooms: '2 Bathrooms',
    title: "Opus by Soulasia",
    description:
      "Contemporary serviced apartments at Opus Residences, Kuala Lumpur. Comfort, convenience, and city access.",
    href: "/properties/318256",
    image: "/properties/Opus/opus-by-soulasia-17.jpg", 
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

const Locations = ({
  title = "Soulasia Locations",
  items = data,
}: LocationsProps) => {

  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  // clamp so we don't scroll past the last visible card
  const next = () => {
    if (trackRef.current) {
      const card = trackRef.current.querySelector("div");
      if (card) {
        const cardWidth = (card as HTMLElement).offsetWidth;
        const maxScroll =
            trackRef.current.scrollWidth - trackRef.current.clientWidth;

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
  return (
    <section className="section-padding-y">
      <div className="container mx-auto">
        <div className="header-margin-b">
          <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{once: true, margin: "-100px"}}
              variants={fadeIn}
              className="flex justify-between items-end "
          >
            <div className="max-w-[50%] lp:max-w-lg text-left">
              <h2 className="h2">{title}</h2>
            </div>
            <div className="flex gap-x-[10px] items-center">
              <a href="/all-locations" className="whitespace-nowrap text-sm tb:text-base lp:text-lg">See all</a>
              <div onClick={prev}
                   className="cursor-pointer mb-2 flex items-center bg-[#e5eeff] rounded-md justify-center aspect-[1/1] w-[32px] lp:w-[40px]">
                <Image
                    src="/icons/arrow.svg"
                    alt=""
                    className="transform rotate-180"
                    width={16}
                    height={16}
                />
              </div>
              <div onClick={next}
                   className="cursor-pointer mb-2 flex items-center bg-[#e5eeff] rounded-md justify-center aspect-[1/1] w-[32px] lp:w-[40px]">
                <Image
                    src="/icons/arrow.svg"
                    alt=""
                    width={16}
                    height={16}
                />
              </div>
            </div>
          </motion.div>
        </div>
        {/* Carousel */}
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
              className="flex transition-transform duration-500 [--step:50%] lp:[--step:33.33%]"
              style={{transform: `translateX(-${offset}px)`}}
          >
            {items.map((item) => (
                <div
                    key={item.id}
                    onClick={() => window.open(item.href, "_self")}
                    className="cursor-pointer flex-shrink-0 basis-1/2 lp:basis-1/3 group overflow-hidden bg-white px-3 space-y-[8px] tb:space-y-[10px] lp:space-y-[20px]"
                >
                  <div className="relative w-full aspect-[4/3]">
                    <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover rounded-xl"
                    />
                    {/* Distance badge */}
                    <div
                        className="absolute max-w-[90%] top-3 left-2 lp:left-3 bg-white/90 text-gray-900 text-[10px] inline-block w-fit tb:text-xs lp:text-base leading-tight font-medium px-3 py-1 rounded-full shadow">
                      {item.distance}
                    </div>
                  </div>
                  <div className="">
                    <h3 className="h3 font-semibold text-gray-900 mb-1 tb:mb-2">{item.title}</h3>
                    <div
                        className="flex flex-col tb:flex-row space-y-1 tb:space-y-0 tb:items-center gap-1 lp:gap-3 text-sm text-[#4A4F5B]">
                      <div className="flex items-center gap-1">
                        <Image
                            src="/icons/bed.svg" alt="" className="w-4 h-4 tb:w-5 tb:h-5"
                            width={24}
                            height={24}
                        />
                        <span className="text-xs tb:text-sm lp:text-base">{item.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Image
                            src="/icons/shower.svg" alt="" className="w-4 h-4 tb:w-5 tb:h-5"
                            width={24}
                            height={24}
                        />
                        <span className="text-xs tb:text-sm lp:text-base">{item.bathrooms}</span>
                      </div>
                    </div>
                  </div>
                  <a
                      href={item.href}
                      className="inline-flex items-center text-[#0E3599] font-semibold text-base tb:text-lg lp:text-xl hover:underline"
                  >
                    Book now →
                  </a>
                </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
//                         className="absolute h-full w-full object-cover object-center"
//                         sizes="(max-width: 768px) 100vw, 360px"
//                         priority={false}
//                       />
//                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 group-hover:from-black/90 group-hover:via-black/60 opacity-80" />
//                       <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-6 text-primary-foreground md:p-8 z-10">
//                         <div
//                           className="mb-2 pt-4 text-xl font-semibold md:mb-3 md:pt-4 lg:pt-4 drop-shadow-lg"
//                           style={{ textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}
//                         >
//                           {item.title}
//                         </div>
//                         <div
//                           className="mb-8 line-clamp-2 md:mb-12 lg:mb-9 drop-shadow"
//                           style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
//                         >
//                           {item.description}
//                         </div>
//                         <div className="flex items-center justify-between w-full">
//                           <div className="flex items-center text-sm font-semibold">
//                             Book now{" "}
//                             <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
//                           </div>
//                           <div className="flex gap-3 ml-4">
//                             {/* Scarletz: both icons */}
//                             {item.id === "location-1" && (
//                               <>
//                                 <Dumbbell className="w-7 h-7 text-white drop-shadow-lg bg-black/40 rounded-full p-1" />
//                                 <Waves className="w-7 h-7 text-white drop-shadow-lg bg-black/40 rounded-full p-1" />
//                               </>
//                             )}
//                             {/* Vortex: only gym */}
//                             {item.id === "location-2" && (
//                               <Dumbbell className="w-7 h-7 text-white drop-shadow-lg bg-black/40 rounded-full p-1" />
//                             )}
//                             {/* 188: only pool */}
//                             {item.id === "location-3" && (
//                               <Waves className="w-7 h-7 text-white drop-shadow-lg bg-black/40 rounded-full p-1" />
//                             )}
//                             {/* Mercu: restaurant and pool */}
//                             {item.id === "location-4" && (
//                               <>
//                                 <Utensils className="w-7 h-7 text-white drop-shadow-lg bg-black/40 rounded-full p-1" />
//                                 <Waves className="w-7 h-7 text-white drop-shadow-lg bg-black/40 rounded-full p-1" />
//                               </>
//                             )}
//                             {/* Opus: gym + pool (adjust if needed) */}
//                             {item.id === "location-5" && (
//                               <>
//                                 <Dumbbell className="w-7 h-7 text-white drop-shadow-lg bg-black/40 rounded-full p-1" />
//                                 <Waves className="w-7 h-7 text-white drop-shadow-lg bg-black/40 rounded-full p-1" />
//                               </>
//                             )}
//                           </div>
//                         </div>
//                         {/* Distance label */}
//                         <div
//                           className="mt-2 text-xs font-medium text-white/90 drop-shadow"
//                           style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
//                         >
//                           {item.id === "location-1" && "800m away from the Twin Towers"}
//                           {item.id === "location-2" && "600m away from the Twin Towers"}
//                           {item.id === "location-3" && "400m away from the Pavilion"}
//                           {item.id === "location-4" && "1km away from the Twin Towers"}
//                           {item.id === "location-5" && "Central KL location near city highlights"}
//                         </div>

export { Locations };
