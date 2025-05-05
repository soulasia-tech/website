import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { LucideIcon, icons } from "lucide-react";

interface PropertyInformationProps {
  propertyId: string;
}

// Map amenity names to Lucide icons (add more as needed)
const amenityIconMap: Record<string, LucideIcon> = {
  "ATM on site": icons.PiggyBank,
  "Baggage storage": icons.Briefcase,
  "Concierge": icons.UserCheck,
  "Elevator": icons.ArrowUpDown,
  "Fitness center": icons.Dumbbell,
  "Laundry service": icons.Shirt,
  "Lounge": icons.Lamp,
  "Meeting rooms": icons.Users,
  "Printer": icons.Printer,
  "Room service": icons.Bell,
  "Swimming pool": icons.Waves,
  "24-hour front desk": icons.Clock,
  "24-hour security": icons.ShieldCheck,
  "Air conditioning": icons.Wind,
  "24-hour check-in": icons.Clock,
  "All rooms disinfected daily": icons.Sparkles,
};

export function PropertyInformation({ propertyId }: PropertyInformationProps) {
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  // Modal state for image preview
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // Ref for carousel scroll
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/test-cloudbeds-property?propertyId=${propertyId}`);
        const data = await res.json();
        if (data.success && data.hotel) {
          setProperty(data.hotel);
        } else {
          setError("Failed to load property information");
        }
      } catch {
        setError("Failed to load property information");
      }
      setLoading(false);
    };
    fetchProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="py-12">
        <div className="h-64 bg-gray-200 animate-pulse rounded-xl mb-8" />
        <div className="h-6 w-1/3 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded mb-2" />
        <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded mb-2" />
        <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded mb-2" />
      </div>
    );
  }
  if (error || !property) {
    return <div className="text-red-500 py-12">{error || "No property information available."}</div>;
  }

  // Photos
  const photos = [
    ...(property.propertyImage?.map((img: any) => ({ url: img.image, caption: "Main" })) || []),
    ...(property.propertyAdditionalPhotos?.map((img: any) => ({ url: img.image, caption: "" })) || [])
  ];

  // Amenities
  const amenities = property.propertyAmenities || [];
  const shownAmenities = showAllAmenities ? amenities : amenities.slice(0, 12);

  // Address & Contact
  const address = property.propertyAddress;
  const contact = property.propertyContact;

  // Policies
  const checkIn = property.checkInTime;
  const checkOut = property.checkOutTime;
  const policies = property.propertyPolicies || [];
  const terms = property.termsAndConditions || null;

  return (
    <section className="py-12">
      <div className="container px-4 mx-auto">
        <h2 className="text-2xl font-bold mb-6">Property Information</h2>
        {/* Photos as horizontally scrollable cards with arrows */}
        {photos.length > 0 && (
          <div className="mb-8 relative">
            {/* Carousel Arrows */}
            {photos.length > 1 && (
              <>
                <button
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full shadow p-2 transition disabled:opacity-30"
                  style={{ left: '-18px' }}
                  onClick={() => {
                    if (carouselRef.current) {
                      carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                    }
                  }}
                  aria-label="Scroll left"
                >
                  <icons.ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full shadow p-2 transition disabled:opacity-30"
                  style={{ right: '-18px' }}
                  onClick={() => {
                    if (carouselRef.current) {
                      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                    }
                  }}
                  aria-label="Scroll right"
                >
                  <icons.ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            <div
              className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
              ref={carouselRef}
              style={{ scrollBehavior: 'smooth' }}
            >
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="min-w-[260px] h-56 rounded-xl shadow bg-white overflow-hidden flex-shrink-0 cursor-pointer group"
                  onClick={() => setSelectedImage(photo.url)}
                  tabIndex={0}
                  aria-label="View image"
                >
                  <div className="relative w-full h-full">
                    <Image src={photo.url} alt={photo.caption || "Property photo"} fill className="object-cover rounded-xl group-hover:opacity-80 transition" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Modal for image preview */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
            aria-modal="true"
            role="dialog"
          >
            <div
              className="relative max-w-3xl w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full shadow p-2"
                onClick={() => setSelectedImage(null)}
                aria-label="Close image preview"
              >
                <icons.X className="w-6 h-6" />
              </button>
              <div className="relative w-full h-[60vw] max-h-[80vh] bg-black rounded-xl flex items-center justify-center">
                <Image
                  src={selectedImage}
                  alt="Enlarged property photo"
                  fill
                  className="object-contain rounded-xl"
                  priority
                />
              </div>
            </div>
          </div>
        )}
        {/* Amenities as grid with icons */}
        {amenities.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Property Amenities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-4 mb-4">
              {shownAmenities.map((a: any, i: number) => {
                const name = a.amenityName || a;
                const Icon = amenityIconMap[name] || icons.BadgeCheck;
                return (
                  <div key={i} className="flex items-center gap-3 text-gray-700">
                    <Icon className="w-6 h-6 text-gray-500" />
                    <span className="text-base">{name}</span>
                  </div>
                );
              })}
            </div>
            {amenities.length > 12 && !showAllAmenities && (
              <button
                className="mt-2 px-5 py-2 border border-green-500 text-green-600 rounded-full font-medium hover:bg-green-50 transition"
                onClick={() => setShowAllAmenities(true)}
              >
                View All ({amenities.length}) →
              </button>
            )}
          </div>
        )}
        {/* Address & Contact */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-2">Address & Contact</h3>
          <div className="text-gray-700 mb-1">
            {address && (
              <div>
                {address.propertyAddress1}<br />
                {address.propertyCity}, {address.propertyState} {address.propertyPostalCode}<br />
                {address.propertyCountry}
              </div>
            )}
          </div>
          {contact && (
            <div className="text-gray-700">
              {contact.phone && <div>Phone: {contact.phone}</div>}
              {contact.email && <div>Email: {contact.email}</div>}
            </div>
          )}
        </div>
        {/* Check-In/Check-Out Policies */}
        {(checkIn || checkOut) && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2">Check-In & Check-Out</h3>
            <div className="text-gray-700">
              {checkIn && <div>Check-In: {checkIn}</div>}
              {checkOut && <div>Check-Out: {checkOut}</div>}
            </div>
          </div>
        )}
        {/* Property & Cancellation Policies */}
        {policies.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2">Property & Cancellation Policies</h3>
            <ul className="list-disc pl-6 text-gray-700">
              {policies.map((p: any, i: number) => (
                <li key={i}>{p.policyName || p.policy || p}</li>
              ))}
            </ul>
          </div>
        )}
        {/* Terms & Conditions */}
        {terms && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-2">Terms & Conditions</h3>
            <div className="text-gray-700 whitespace-pre-line">{terms}</div>
          </div>
        )}
      </div>
    </section>
  );
} 