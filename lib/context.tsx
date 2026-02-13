// context/UIContext.tsx
"use client";

import {createContext, useContext, useState, ReactNode, useEffect} from "react";
import {PropertiesMap} from "@/components/PropertiesMap";
import {usePathname} from "next/navigation";

export interface Property {
    id?: string;
    propertyId: string;
    propertyName?: string;
    propertyDesc?: string;
    ukey?: string;
    metadata?: {
        bathroom?: string;
        bedroom?: string;
        placeHint?: string;
    };
    amenities?: {
        icon?: string;
        label?: string;
    }[];
    price_per_day?: number
}

export interface PropertyRoom {
    roomTypeID: string;
    roomTypeName: string;
    propertyId: string;
    propertyName: string;
    roomTypePhotos: { url: string; caption?: string }[];
    currency?: string;
    rate?: number;
}

interface PropertyMarker {
    lat: number;
    lng: number;
    name: string;
    address?: string;
}

interface MapProperties {
    propertyMarkers: PropertyMarker[],
    zoom?: number;
}

type UIContextType = {
    isActive: boolean;
    setIsActive: (value: boolean) => void;

    isDark: boolean;
    setIsDark: (value: boolean) => void;

    propertiesSaved: Property[];

    properties: Property[] | null;
    rooms: PropertyRoom[] | null;
    loading: boolean;

    openMap: (props: MapProperties) => void;
    closeMap: () => void;
};

const propertiesSaved: Property[] = [
    {
        id: "location-1",
        propertyId: "270917",
        propertyName: "Scarletz KLCC Apartments",
        propertyDesc: "Scarletz KLCC Apartments by Soulasia offers a comfortable stay with modern interiors, a fully equipped kitchen, and dining space overlooking the city. Just steps from the KLCC Business District, you’ll be close to top attractions, shops, and restaurants. Guests can relax at the rooftop pool and gym with amazing skyline views, or get work done at the 44th-floor co-working space with fast internet and plenty of light. Scarletz is a great choice for couples, business travelers, and digital nomads looking for both convenience and style in the center of Kuala Lumpur.",
        ukey: "Scarletz",
        metadata: {
            "bedroom": "Studio & 1 Bedroom",
            "bathroom": "1 Bathroom",
            "placeHint": "700m from Twin Towers"
        },
        amenities: [
            {icon: '/icons/wifi.svg', label: "100 mb/s Wi-Fi Connection"},
            {icon: '/icons/coffee.svg', label: "Coffee Shop"},
            {icon: '/icons/store.svg', label: "Convenience Store"},
            {icon: '/icons/coworking.svg', label: "Co-working Space (Free)"},
            {icon: '/icons/water.svg', label: "Cuckoo Water Filter"},
            {icon: '/icons/gym.svg', label: "Fitness & Gym (Free)"},
            {icon: '/icons/parking.svg', label: "Parking (Paid)"},
            {icon: '/icons/pool.svg', label: "Rooftop Pool (Free)"},
            {icon: '/icons/sauna.svg', label: "Sauna (Free)"},
        ]
    },
    {
        id: "location-2",
        propertyId: "19928",
        propertyName: "Vortex KLCC Apartments",
        propertyDesc: "Vortex KLCC by Soulasia offers modern, family-friendly apartments in the heart of Kuala Lumpur, just 600m from the iconic Twin Towers and 15 minutes’ walk to Pavilion. Guests enjoy excellent facilities including a swimming pool and fully equipped gym on the 6th floor, while many units feature stunning views of KL Tower and the KL city skyline. The ground floor is home to a cozy café serving great breakfasts and a 7-Eleven convenience store, with countless restaurants, bars, and public transport options right outside the building, making Vortex KLCC the perfect choice for both business and leisure travelers.",
        ukey: "Vortex",
        metadata: {
            "bedroom": "2 Bedroom",
            "bathroom": "2 Bathroom",
            "placeHint": "600m from Twin Towers"
        },
        amenities: [
            {icon: '/icons/wifi.svg', label: "100 mb/s Wi-Fi Connection"},
            {icon: '/icons/coffee.svg', label: "Coffee Shop"},
            {icon: '/icons/store.svg', label: "Convenience Store"},
            {icon: '/icons/water.svg', label: "Coway Water Filter"},
            {icon: '/icons/gym.svg', label: "Fitness & Gym (Paid)"},
            {icon: '/icons/parking.svg', label: "Parking (Paid)"},
            {icon: '/icons/pool.svg', label: "Pool (Paid)"},
            {icon: '/icons/sauna.svg', label: "Sauna (Paid)"},
        ]
    },
    {
        id: "location-3",
        propertyId: '318151',
        propertyName: "188 Suites KLCC",
        propertyDesc: "88 Suites by Soulasia is set in a former 5-star hotel building, offering spacious apartments designed for comfort and convenience. Guests can enjoy the swimming pool, rooftop gym, and free parking, making it a great choice for both short and long stays. The building is well connected to public transport, with a KK convenience store and a pastry shop right downstairs. Located close to Kuala Lumpur’s city highlights, 188 Suites combines space, facilities, and a central location for a relaxed and practical stay in the city.",
        ukey: "188",
        metadata: {
            "bedroom": "Studio & 1-2 Bedroom",
            "bathroom": "2 Bathroom",
            "placeHint": "1.2 km from Twin Towers"
        },
        amenities: [
            {icon: '/icons/wifi.svg', label: "100 mb/s Wi-Fi Connection"},
            {icon: '/icons/coffee.svg', label: "Coffee Shop"},
            {icon: '/icons/store.svg', label: "Convenience Store"},
            {icon: '/icons/water.svg', label: "Coway Water Filter"},
            {icon: '/icons/gym.svg', label: "Fitness & Gym (Free)"},
            {icon: '/icons/parking.svg', label: "Parking (Free)"},
            {icon: '/icons/pool.svg', label: "Pool (Free)"},
            {icon: '/icons/sauna.svg', label: "Sauna (Free)"},
        ]
    },
    {
        id: "location-5",
        propertyId: "318256",
        propertyName: "Opus Residences",
        propertyDesc: "Opus Residence by Soulasia offers modern city apartments with sweeping views of Menara 118 and the Kuala Lumpur skyline. Guests can unwind at the rooftop pool, stay active in the gym, and enjoy the comfort of spacious units designed for both short and long stays. The property is well connected to public transport and close to major attractions in KL City Center, making it easy to explore the city while having a quiet place to return to. With its facilities and panoramic views, Opus Residence is a great choice for families, business travelers, and holidaymakers.",
        ukey: "Opus",
        metadata: {
            "bedroom": "1-3 Bedroom",
            "bathroom": "2 Bathroom",
            "placeHint": "2.5 km from Pavilion Bukit Bintang"
        },
        amenities: [
            {icon: '/icons/wifi.svg', label: "100 mb/s Wi-Fi Connection"},
            {icon: '/icons/coffee.svg', label: "Coffee Shop"},
            {icon: '/icons/store.svg', label: "Convenience Store"},
            {icon: '/icons/gym.svg', label: "Fitness & Gym (Free)"},
            {icon: '/icons/parking.svg', label: "Parking (Free)"},
            {icon: '/icons/pool.svg', label: "Pool (Free)"},
            {icon: '/icons/sauna.svg', label: "Sauna (Free)"},
        ]
    },
];

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({children}: { children: ReactNode }) {
    // 🔹 UI state
    const [isActive, setIsActive] = useState(false);
    const [isDark, setIsDark] = useState(false);

    const pathname = usePathname();
    const [removePadding, setRemovePadding] = useState(false);
    useEffect(() => {
        if(window.innerWidth >= 768) {
            setIsActive(false);
        }

        if (pathname === '/') {
            setRemovePadding(true);
        }

        if (pathname.startsWith('/auth')) {
            setRemovePadding(true);
            setIsActive(false);
        }
    }, [pathname]);

    // 🔹 Cache state
    const [properties, setProperties] = useState<Property[] | null>(null);
    const [rooms, setRooms] = useState<PropertyRoom[] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch rooms
        const fetchRooms = async () => {
            try {
                const propertiesRes = await fetch('/api/cloudbeds-properties');
                const propertiesData = await propertiesRes.json();
                if (!propertiesData.success) throw new Error('Failed to load properties');

                setProperties(propertiesData.properties);

                const roomTypePromises = propertiesData.properties.map((property: Property) =>
                    fetch(`/api/cloudbeds/room-types?propertyId=${property.propertyId}`).then(res => res.json())
                );
                const roomsDataArr = await Promise.all(roomTypePromises);
                const startDate = new Date().toISOString().slice(0, 10);
                const endDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
                const ratePlanPromises = propertiesData.properties.map((property: Property) =>
                    fetch(`/api/cloudbeds/rate-plans?propertyId=${property.propertyId}&startDate=${startDate}&endDate=${endDate}`).then(res => res.json())
                );
                const ratesDataArr = await Promise.all(ratePlanPromises);
                const allRooms: PropertyRoom[] = [];
                for (let i = 0; i < propertiesData.properties.length; i++) {
                    const property = propertiesData.properties[i];
                    const roomsData = roomsDataArr[i];
                    const ratesData = ratesDataArr[i];
                    const rateMap: Record<string, number> = {};
                    if (ratesData.success && Array.isArray(ratesData.ratePlans)) {
                        ratesData.ratePlans.forEach((rate: { roomTypeID: string; totalRate: number }) => {
                            if (!rateMap[rate.roomTypeID] || rate.totalRate < rateMap[rate.roomTypeID]) {
                                rateMap[rate.roomTypeID] = Math.round(rate.totalRate);
                            }
                        });
                    }
                    if (roomsData.success && roomsData.roomTypes) {
                        const transformedRooms: PropertyRoom[] = roomsData.roomTypes.map((room: {
                            roomTypeID: string;
                            roomTypeName: string;
                            roomTypePhotos?: string[];
                        }) => ({
                            roomTypeID: room.roomTypeID,
                            roomTypeName: room.roomTypeName,
                            propertyId: property.propertyId,
                            propertyName: property.propertyName,
                            roomTypePhotos: (room.roomTypePhotos || ['/rooms/room.svg']).map((url: string) => ({
                                url,
                                caption: ''
                            })),
                            currency: 'MYR',
                            rate: rateMap[room.roomTypeID]
                        }));
                        allRooms.push(...transformedRooms);
                    }
                }
                setRooms(allRooms);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    const openMap = (props: MapProperties) => {
        setModalContent(<PropertiesMap propertyMarkers={props.propertyMarkers} fullScreenMode={true} zoom={props.zoom}/>);
    };

    const closeMap = () => setModalContent(null);

    return (
        <UIContext.Provider
            value={{
                isActive, setIsActive, isDark, setIsDark,
                propertiesSaved, properties, rooms, loading,
                openMap, closeMap
            }}
        >
            <div className={!removePadding && !isDark && isActive ? 'mt-50 tb:mt-[calc(var(--action-h-1xl)+24px)]' : '' }>
                {children}
            </div>
            {modalContent && (
                <div className="fixed inset-0 z-60 bg-white flex justify-center items-center p-5 lp:p-10">
                    {modalContent}
                </div>
            )}
        </UIContext.Provider>
    );
}

export function useUI() {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error("useUI must be used within UIProvider");
    }
    return context;
}
