"use client";

import Image from "next/image";

import {motion} from "framer-motion";
import React, {useRef, useState} from "react";

export interface LocationsItem {
  id: string;
  propertyId: string;
  title: string;
  ukey: string;
  metadata: {
    placeHint: string;
    bedroom: string;
    bathroom: string;
  }
}

export interface LocationsProps {
  title?: string;
  description?: string;
  items?: LocationsItem[];
}

const data: LocationsItem[] = [
  {
    id: "location-1",
    propertyId: "270917",
    title: "Scarletz KLCC Apartments",
    ukey: "Scarletz",
    metadata: {
      "bedroom": "Studio & 1 Bedroom",
      "bathroom": "1 Bathroom",
      "placeHint": "700m from Twin Towers"
    }
  },
  {
    id: "location-2",
    propertyId: "19928",
    title: "Vortex KLCC Apartments",
    ukey: "Vortex",
    metadata: {
      "bedroom": "2 Bedroom",
      "bathroom": "2 Bathroom",
      "placeHint": "600m from Twin Towers"
    }
  },
  {
    id: "location-3",
    propertyId: '318151',
    title: "188 Suites KLCC",
    ukey: "188",
    metadata: {
      "bedroom": "Studio & 1-2 Bedroom",
      "bathroom": "2 Bathroom",
      "placeHint": "1.2 km from Twin Towers"
    }
  },
  {
    id: "location-5",
    propertyId: "318256",
    title: "Opus Residences",
    ukey: "Opus",
    metadata: {
      "bedroom": "1-3 Bedroom",
      "bathroom": "2 Bathroom",
      "placeHint": "2.5 km from Pavilion Bukit Bintang"
    }
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
                    onClick={() => window.open(`/properties/${item.propertyId}`, "_self")}
                    className="cursor-pointer flex-shrink-0 basis-1/2 lp:basis-1/3 group overflow-hidden bg-white px-3 space-y-[8px] tb:space-y-[10px] lp:space-y-[20px]"
                >
                  <div className="relative w-full aspect-[4/3]">
                    <Image
                        src={`/properties/${item.ukey}/cover.jpg`}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover rounded-xl"
                    />
                    {/* Distance badge */}
                    <div
                        className="absolute max-w-[90%] top-2 lp:top-3 left-2 lp:left-3 bg-white/90 text-gray-900 text-[10px] inline-block w-fit tb:text-xs lp:text-base leading-tight font-medium px-2 lp:px-3 py-0.5 lp:py-1 rounded-full shadow">
                      {item.metadata.placeHint}
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
                        <span className="text-xs tb:text-sm lp:text-base">{item.metadata.bedroom}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Image
                            src="/icons/shower.svg" alt="" className="w-4 h-4 tb:w-5 tb:h-5"
                            width={24}
                            height={24}
                        />
                        <span className="text-xs tb:text-sm lp:text-base">{item.metadata.bathroom}</span>
                      </div>
                    </div>
                  </div>
                  <a
                      href={`/properties/${item.propertyId}`}
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

export { Locations };
