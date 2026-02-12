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
}

export interface LocationsProps {
  title?: string;
  description?: string;
  items?: LocationsItem[];
}

const data = [
  {
    id: "experience-1",
    propertyId: "123",
    title: "Dinner at Michelin-Starred Dewakan",
    description: "Modern Malaysian cuisine with a creative twist and local ingredients.",
    href: "/#experience",
    image: "/media-assets/experience1.png",
  },
  {
    id: "experience-2",
    propertyId: "123",
    title: "Panoramic Evening at Marini’s on 57",
    description:
      "Modern serviced apartments at Vortex, Kuala Lumpur. Experience city living with stunning views.",
    href: "/#experience",
    image: "/media-assets/experience2.png",
  },
  {
    id: "experience-3",
    propertyId: "123",
    title: "Classical Music at Petronas Philharmonic Hall",
    description: "Performances by world-class orchestras in a hall with exceptional acoustics.",
    href: "/#experience",
    image: "/media-assets/experience3.png",
  }
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const Experience = ({
  title = "Experience Kuala Lumpur",
  description = "Discover the vibrant city from the comfort of our premium apartments",
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
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{once: true, margin: "-100px"}}
            variants={fadeIn}
            className="flex flex-col tb:flex-row justify-between items-end header-margin-b"
        >
          <div className="max-w-md lp:max-w-xl text-left mb-2 mr-auto">
            <h2 className="h2 ">{title}</h2>
            <div className="font-normal text-[#3b4a68] text-lg lp:text-xl full:text-2xl mt-2">{description}</div>
          </div>
          <div className="flex gap-x-[10px] items-center">
            <div onClick={prev}
                 className="cursor-pointer mb-2 flex items-center bg-[#e5eeff] rounded-md justify-center aspect-[1/1] w-[32px] lp:w-[40px]">
              <Image
                  src="/icons/arrow-dark.svg" alt="" className="transform rotate-180"
                  width={16}
                  height={16}
              />
            </div>
            <div onClick={next}
                 className="cursor-pointer mb-2 flex items-center bg-[#e5eeff] rounded-md justify-center aspect-[1/1] w-[32px] lp:w-[40px]">
              <Image
                  src="/icons/arrow-dark.svg" alt=""
                  width={16}
                  height={16}
              />
            </div>
          </div>
        </motion.div>
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
              className="flex transition-transform duration-500 [--step:50%]"
              style={{transform: `translateX(-${offset}px)`}}
          >
            {items.map((item) => (
                <div
                    key={item.id}
                    className="flex-shrink-0 basis-3/4 tb:basis-1/2 group overflow-hidden bg-white pr-4 last:pr-0 lp:space-y-[20px]"
                >
                  <div className="relative w-full aspect-[4/3] lp:aspect-[3/2] h-[200px] tb:h-[250px] full:h-[364px]">
                    <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover rounded-xl"
                    />
                  </div>
                  <div className="">
                    <h3 className="h3 font-semibold text-gray-900 mb-1 tb:mb-2">{item.title}</h3>
                    <div className="font-normal tb:items-center gap:1 lp:gap-3 text-sm text-gray-600">
                      {item.description}
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export {
  Experience
};
