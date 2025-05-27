"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

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
    id: "location-1",
    propertyId: "270917",
    title: "Scarletz",
    description:
      "Premium serviced apartments at Scarletz, Kuala Lumpur. Modern comfort in the heart of the city.",
    href: "/properties/270917",
    image: "/properties/Scarletz/DSC01330.jpg",
  },
  {
    id: "location-2",
    propertyId: "19928",
    title: "Vortex",
    description:
      "Modern serviced apartments at Vortex, Kuala Lumpur. Experience city living with stunning views.",
    href: "/properties/19928",
    image: "/properties/Vortex/54c2879c_z copy 2.jpg",
  },
  {
    id: "location-3",
    propertyId: "188-id",
    title: "188 Suites",
    description:
      "Luxury serviced apartments at 188 Suites, Kuala Lumpur. Enjoy premium amenities and comfort.",
    href: "/properties/188-id",
    image: "/properties/188/DSC06377.jpg",
  },
  {
    id: "location-4",
    propertyId: "mercu-id",
    title: "Mercu Summer Suites",
    description:
      "Elegant serviced apartments at Mercu Summer Suites, Kuala Lumpur. Perfect for a relaxing stay.",
    href: "/properties/mercu-id",
    image: "/properties/Mercu/DSC02384.jpg",
  },
];

const Locations = ({
  title = "Soulasia locations",
  description = "Explore our premium serviced apartments in Kuala Lumpur's most sought-after neighborhoods.",
  items = data,
}: LocationsProps) => {
  return (
    <section className="py-32">
      <div className="container mx-auto">
        <div className="mb-8 flex flex-col items-center justify-center text-center md:mb-14 lg:mb-16">
          <div className="flex flex-col gap-4 items-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center">
              {title}
            </h2>
            <p className="max-w-lg text-gray-600 text-center">{description}</p>
          </div>
        </div>
      </div>
      <div className="w-full">
        <Carousel
          opts={{
            align: "start",
            containScroll: "trimSnaps",
            breakpoints: {
              "(max-width: 640px)": {
                slidesToScroll: 1,
              },
              "(min-width: 641px) and (max-width: 1023px)": {
                slidesToScroll: 3,
              },
              "(min-width: 1024px)": {
                slidesToScroll: 4,
              },
            },
          }}
        >
          <CarouselContent className="px-4">
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className="basis-full md:basis-1/3 lg:basis-1/4 shadow-lg"
              >
                <a href={item.href} className="group rounded-xl">
                  <div className="group relative h-full min-h-[27rem] max-w-full overflow-hidden rounded-xl md:aspect-[5/4] lg:aspect-[16/9]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="absolute h-full w-full object-cover object-center"
                      sizes="(max-width: 768px) 100vw, 360px"
                      priority={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 group-hover:from-black/90 group-hover:via-black/60 opacity-80" />
                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-6 text-primary-foreground md:p-8 z-10">
                      <div className="mb-2 pt-4 text-xl font-semibold md:mb-3 md:pt-4 lg:pt-4 drop-shadow-lg" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
                        {item.title}
                      </div>
                      <div className="mb-8 line-clamp-2 md:mb-12 lg:mb-9 drop-shadow" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                        {item.description}
                      </div>
                      <div className="flex items-center text-sm font-semibold">
                        Book now{" "}
                        <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export { Locations }; 