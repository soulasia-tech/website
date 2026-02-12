"use client";
import Image from "next/image";
import {useParams, useRouter} from "next/navigation";
import React, {useState, useRef} from "react";
import {motion} from "framer-motion";
import {PropertyRoom, useUI} from "@/lib/context";
import {RoomCard} from "@/components/room-card";
import {PropertiesMap} from "@/components/PropertiesMap";

// Store static lat/lng for each propertyId
const propertyLocationMap: Record<string, { lat: number; lng: number, name: string, address?: string }> = {
  '270917': {
    lat: 3.163265,
    lng: 101.710802,
    name: 'Scarletz Suites KL',
  }, // Scarletz Suites, KL
  '19928': {
    lat: 3.1579,
    lng: 101.7075,
    name: 'Vortex KLCC'
  }, // Vortex KLCC (example coordinates)
  '318151': {
    lat: 3.1595,
    lng: 101.7051,
    name: '188 Suites KLCC'
  }, // 188 Suites KLCC By Soulasia
  '318256': {
    lat: 3.1376,
    lng: 101.6998,
    name: 'Opus Residences'
  }, // Opus Residences
};

// Images for each property
const propertyImagesMap: Record<string, string[]> = {
  'default': [
    "DSC01327.jpg",
    "DSC01330.jpg",
    "DSC01351.jpg",
    "DSC01369.jpg",
    "DSC01531.jpg",
  ],
  'Scarletz': [
    "1.jpg",
    "2.jpg",
    "3.jpg",
    "4.jpg",
    "5.jpg",
    "6.jpg",
    "7.jpg",
    "8.jpg",
    "9.jpg",
    "10.jpg",
    "11.jpg",
    "facilities2.jpg",
    "facilities4.jpg",
    "facilities5.jpg",
    "facilities7.jpg",
    "facilities8.jpg",
    "facilities9.jpg",
    "facilities11.jpg",
    "facilities12.jpg",
    "facilities13.jpg",
    "facilities14.jpg",
    "facilities15.jpg",
    "facilities16.jpg",
    "facilities17.jpg",
    "facilities18.jpg",
  ],
  'Vortex': [
    "1.jpg",
    "2.jpg",
    "3.jpg",
    "4.jpg",
    "5.jpg",
    "6.jpg",
    "7.jpg",
    "9.jpg",
    "10.jpg",
    "11.jpg",
    "12.jpg",
    "13.jpg",
    "14.jpg",
    "15.jpg",
    "16.jpg",
    "17.jpg",
    "18.jpg",
    "19.jpg",
  ],
  '188': [
    "3.jpg",
    "4.jpg",
    "5.jpg",
    "6.jpg",
    "9.jpg",
    "10.jpg",
    "11.jpg",
    "12.jpg",
    "13.jpg",
    "14.jpg",
    "15.jpg",
    "16.jpg",
    "18.jpg",
    "19.jpg",
    "20.jpg",
    "21.jpg",
    "23.jpg",
    "24.jpg",
  ],
  'Opus': [
    "1.jpg",
    "2.jpg",
    "3.jpg",
    "4.jpg",
    "5.jpg",
    "6.jpg",
    "7.jpg",
    "8.jpg",
    "facilities1.jpg",
    "facilities2.jpg",
    "facilities3.jpg",
    "facilities4.jpg",
    "facilities5.jpg",
    "facilities6.jpg",
    "facilities9.jpg",
    "facilities10.jpg",
  ],
};

const roomsLocal: PropertyRoom[] = [
  {
    roomTypeID: "room-1",
    roomTypeName: "One Bedroom Apartment",
    propertyId: '',
    propertyName: '',
    roomTypePhotos: [],
    currency: 'MYR',
    rate: 161.00,
  },
  {
    roomTypeID: "room-2",
    roomTypeName: "Two Bedroom Apartment",
    propertyId: '',
    propertyName: '',
    roomTypePhotos: [],
    currency: 'MYR',
    rate: 161.00,
  }
];

const fadeIn = {
  hidden: {opacity: 0, y: 20},
  visible: {
    opacity: 1,
    y: 0,
    transition: {duration: 0.3},
  },
}


export default function PropertiesPage() {
  const router = useRouter();

  const {propertiesSaved, rooms, loading} = useUI();

  const p = useParams() as { propertyId?: string | string[] };
  const propertyId = typeof p.propertyId === 'string' ? p.propertyId :
      (Array.isArray(p.propertyId) ? p.propertyId[0] : '270917');

  let pageTitle = 'Soulasia | Property';

  const property = propertiesSaved.find(item => item.propertyId == propertyId)

  if (property) {
    pageTitle = `Soulasia | ${property.propertyName}`;
    rooms?.forEach(room => {
      room.propertyName = property.propertyName ?? ''
    })
  }

  const mapPosition = propertyLocationMap[String(propertyId)]; /*isVortex && dynamicMapPosition ? dynamicMapPosition : */

  const propertyImages = propertyImagesMap[String(property?.ukey)] || propertyImagesMap['default'];
  const total = propertyImages.length;

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

  const getVisibleImages = (): string[] => {
    if (!Array.isArray(propertyImages) || total < 1) return [];
    return propertyImages.map(src => `/properties/${property?.ukey ?? 'default'}/${src}`);
  };

  const visibleImages: string[] = getVisibleImages();

  // Booking widget state
  // const [date, setDate] = useState<DateRange | undefined>(undefined);
  // const [adults, setAdults] = useState('2');
  // const [children, setChildren] = useState('0');
  // const [apartment, setApartment] = useState('1');
  // const [submitting, setSubmitting] = useState(false);

  // const handleBookNow = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!date?.from || !date?.to) return;
  //   setSubmitting(true);
  //   const totalGuests = calculateTotalGuests(Number(adults), Number(children));
  //   const params = new URLSearchParams({
  //     propertyId: propertyId.toString(),
  //     startDate: format(date.from, 'yyyy-MM-dd'),
  //     endDate: format(date.to, 'yyyy-MM-dd'),
  //     adults,
  //     children,
  //     apartment,
  //     guests: totalGuests.toString(),
  //   });
  //   router.push(`/search?${params.toString()}`);
  // };

  return (
      <>
        <title>{pageTitle}</title>

        <main className={["py-8 bg-white relative"].join(' ')}>
          <div className="container">
            {/* Back button */}
            <button
                onClick={() => router.back()}
                className="cursor-pointer flex items-center gap-1 font-medium text-[#4a4f5b] border border-[#dee3ed] hover:bg-[#F9FAFB]
                  mb-4 lp:mb-5 rounded-lg tb:rounded-[10px] px-2 py-1 tb:px-3 tb:py-2 lp:px-4 lp:py-3
                  text-xs tb:text-sm lp:text-base">
              <svg className="w-3 h-3 lp:w-4 lp:h-4" width="16" height="16" viewBox="0 0 16 16" fill="none"
                   xmlns="http://www.w3.org/2000/svg">
                <path d="M12.666 8H3.33268" stroke="#4A4F5B" stroke-width="1.33333" stroke-linejoin="round"/>
                <path d="M8 12.667L3.33333 8.00033L8 3.33366" stroke="#4A4F5B" stroke-width="1.33333"
                      stroke-linejoin="round"/>
              </svg>
              Back
            </button>

            {/* Title & meta */}
            <div className="mb-6 gap-2 space-y-3 lp:space-y-5">
              <h1 className="h1 font-semibold text-[#101828] ">
                {property?.propertyName}
              </h1>
              <div className="flex flex-col lp:flex-row lp:justify-between gap-2">
                <div className="flex tb:space-y-0 items-center gap-1 lp:gap-3 text-sm text-[#4A4F5B]">
                  <Image
                      src="/icons/location-grey.svg" alt="" className="w-4 h-4 tb:w-5 tb:h-5"
                      width={24}
                      height={24}
                  />
                  <span className="text-xs tb:text-sm lp:text-base">{property?.metadata?.placeHint}</span>
                </div>
                <div className="flex tb:space-y-0 items-center gap-1 lp:gap-3 text-sm text-[#4A4F5B]">
                  <div className="flex items-center gap-1">
                    <Image
                        src="/icons/bed.svg" alt="" className="w-4 h-4 tb:w-5 tb:h-5"
                        width={24}
                        height={24}
                    />
                    <span className="text-xs tb:text-sm lp:text-base">{property?.metadata?.bedroom}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Image
                        src="/icons/shower.svg" alt="" className="w-4 h-4 tb:w-5 tb:h-5"
                        width={24}
                        height={24}
                    />
                    <span className="text-xs tb:text-sm lp:text-base">{property?.metadata?.bathroom}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Gallery */}
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
                className="flex transition-transform duration-700 "
                style={{transform: `translateX(-${offset}px)`}}
            >
              {visibleImages.map((src: string, idx: number) => (
                  <div
                      key={idx}
                      className="flex-shrink-0 basis-3/4 tb:basis-2/5 lp:basis-2/7 full:basis-5/15 group overflow-hidden px-1 tb:px-2.5  last:pr-0 ">
                    <div
                        className="relative w-full aspect-[5/4] h-[210px] tb:h-[260px] lp:h-[286px] full:h-[380px]">
                      <Image
                          src={src}
                          alt={`Property image ${idx + 1}`}
                          fill
                          // sizes="(max-width: 768px) 100vw, 400px"
                          className="object-cover rounded-xl"
                      />
                    </div>
                  </div>
              ))}
            </div>
            <div onClick={prev}
                 className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white flex items-center rounded-md justify-center aspect-[1/1] w-[32px] lp:w-[40px]">
              <Image
                  src="/icons/arrow-dark.svg"
                  alt="Arrow"
                  width={16}
                  height={16}
                  className="transform rotate-180"
              />
            </div>
            <div onClick={next}
                 className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white mb-2 flex items-center rounded-md justify-center aspect-[1/1] w-[32px] lp:w-[40px]">
              <Image
                  src="/icons/arrow-dark.svg"
                  alt="Arrow"
                  width={16}
                  height={16}
              />
            </div>
          </motion.div>

          <div
              className="mt-15 container grid grid-cols-1 lp:grid-cols-3 mb-12 gap-8 space-y-4 tb:space-y-5 lp:space-y-6">
            <div className="col-span-1 lg:col-span-3 space-y-6">
              {/* About */}
              <section>
                <h2 className="h2 font-semibold mb-3 tb:mb-4 lp:mb-5">About this property</h2>
                <div
                    className="font-normal text-[#3b4a68] text-base tb:text-lg lp:text-xl full:text-2xl mb-4 max-w-fit">
                  {property?.propertyDesc}
                </div>
              </section>
              <div className="border border-[#dee3ed]"></div>
              <section>
                <h2 className="h2 font-semibold mb-3 tb:mb-4 lp:mb-5">Amenities</h2>
                <ul className="grid grid-cols-2 gap-4 text-[#101828]">
                  {property?.amenities?.map((amenity, idx) => (
                      <li key={idx} className="flex items-center gap-2 tb:gap-3 lp:gap-5">
                        <Image src={amenity?.icon ?? ''} alt="Soulasia Logo White"
                               className="aspect-[1/1] w-4 tb:w-6 lp:w-8 full:w-10" width={40} height={40} priority/>
                        <span className="font-normal text-sm tb:text-xl full:text-2xl">{amenity.label}</span>
                      </li>
                  ))}
                </ul>
              </section>
              <div className="border border-[#dee3ed] my-4 tb:my-5 lp:my-6"></div>
              {/* Rooms */}
              <section>
                <h2 className="h2 font-semibold mb-3 tb:mb-4 lp:mb-5">Rooms</h2>
                {!loading ? (
                    <Rooms propertyId={propertyId} rooms={rooms}/>) :
                    (<div className="grid grid-cols-2 lp:grid-cols-3 gap-6">
                      {roomsLocal.map((room) => (
                          <RoomCard
                              key={room.roomTypeID}
                              roomName={room.roomTypeName}
                              propertyName={room.propertyName}
                              photos={room.roomTypePhotos}
                              rate={room.rate}
                          />
                      ))}
                    </div>)
                }
              </section>
              {/* Map */}
              <section>
                <h2 className="h2 font-semibold mb-3 tb:mb-4 lp:mb-5">Location</h2>
                <div
                    className="w-full aspect-[4/3] tb:aspect-[16/9] rounded-lg overflow-hidden shadow bg-white flex items-center justify-center">
                  {mapPosition ? (
                      <PropertiesMap propertyMarkers={[mapPosition]}></PropertiesMap>
                  ) : (
                      <span className="text-gray-400 text-sm text-center px-2">Location not found on map.</span>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </>
  );
}

function Rooms({propertyId, rooms}: { propertyId: string, rooms: PropertyRoom[] | null }) {
  const filtered = rooms?.filter((room) => room.propertyId === propertyId);
  return (
      <div className="grid grid-cols-2 lp:grid-cols-3 gap-6">
        {
          (filtered?.length ? filtered : roomsLocal).map((room) => (
              <RoomCard
                  key={room.roomTypeID}
                  roomName={room.roomTypeName}
                  propertyName={room.propertyName}
                  photos={room.roomTypePhotos}
                  rate={room.rate}
              />
          ))
        }
      </div>
  );
}

// <div ref={mapContainerRef}
//      className={`relative flex justify-center items-center w-full h-full rounded-xl shadow bg-white ${isFullscreen ? 'p-10' : 'p-0'}`}
// >
//   <Map
//       ref={mapRef}
//       mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
//       initialViewState={{longitude: mapPosition.lng, latitude: mapPosition.lat, zoom: 15}}
//
//       mapStyle="mapbox://styles/mapbox/streets-v11"
//   >
//     <Marker longitude={mapPosition.lng} latitude={mapPosition.lat} anchor="bottom">
//       <div style={{fontSize: 32, color: '#3b82f6'}}>📍</div>
//     </Marker>
//   </Map>
//
//
//   <div className={`absolute flex flex-col gap-2 z-50 ${isFullscreen ? 'top-14 right-14' : 'top-4 right-4'}`}>
//     <button
//         onClick={toggleFullscreen}
//         className="bg-white rounded shadow p-2 hover:bg-gray-100"
//     >
//       {isFullscreen ? "✕" : "⛶"}
//     </button>
//     <button
//         onClick={() => mapRef.current?.zoomIn()}
//         className="bg-white rounded shadow p-2 hover:bg-gray-100"
//     >
//       ➕
//     </button>
//     <button
//         onClick={() => mapRef.current?.zoomOut()}
//         className="bg-white rounded shadow p-2 hover:bg-gray-100"
//     >
//       ➖
//     </button>
//   </div>
// </div>
