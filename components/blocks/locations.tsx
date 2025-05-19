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
    propertyId: "vortex-id",
    title: "Vortex",
    description:
      "Modern serviced apartments at Vortex, Kuala Lumpur. Experience city living with stunning views.",
    href: "/properties/vortex-id",
    image: "/properties/Vortex/54c2879c_z copy 2.jpg",
  },
  {
    id: "location-3",
    propertyId: "bangsar-id",
    title: "Bangsar",
    description:
      "Trendy neighborhood known for its cafes, nightlife, and local culture. Great for long stays.",
    href: "/properties/bangsar-id",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "location-4",
    propertyId: "montkiara-id",
    title: "Mont Kiara",
    description:
      "Upscale area popular with expats, featuring international schools and luxury amenities.",
    href: "/properties/montkiara-id",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
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
            breakpoints: {
              "(max-width: 768px)": {
                dragFree: true,
              },
            },
          }}
        >
          <CarouselContent className="ml-0 2xl:ml-[max(8rem,calc(50vw-700px))] 2xl:mr-[max(0rem,calc(50vw-700px))]">
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className="max-w-[320px] pl-[20px] lg:max-w-[360px]"
              >
                <a href={item.href} className="group rounded-xl">
                  <div className="group relative h-full min-h-[27rem] max-w-full overflow-hidden rounded-xl md:aspect-[5/4] lg:aspect-[16/9]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="absolute h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 360px"
                      priority={false}
                    />
                    <div className="absolute inset-0 h-full bg-[linear-gradient(hsl(var(--primary)/0),hsl(var(--primary)/0.4),hsl(var(--primary)/0.8)_100%)] mix-blend-multiply" />
                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-6 text-primary-foreground md:p-8">
                      <div className="mb-2 pt-4 text-xl font-semibold md:mb-3 md:pt-4 lg:pt-4">
                        {item.title}
                      </div>
                      <div className="mb-8 line-clamp-2 md:mb-12 lg:mb-9">
                        {item.description}
                      </div>
                      <div className="flex items-center text-sm">
                        Read more{" "}
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