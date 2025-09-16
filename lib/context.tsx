// context/UIContext.tsx
"use client";

import {createContext, useContext, useState, ReactNode, useEffect} from "react";

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

type UIContextType = {
    isActive: boolean;
    setIsActive: (value: boolean) => void;

    propertiesSaved: Property[];

    properties: Property[] | null;
    rooms: PropertyRoom[] | null;
    loading: boolean;
};

const propertiesSaved: Property[] = [
    {
        id: "location-1",
        propertyId: "270917",
        propertyName: "Scarletz KLCC Apartments",
        propertyDesc: "Scarletz KLCC Apartments",
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
        propertyName: "Vortex KLCC Apartments",
        propertyDesc: "Vortex KLCC Apartments",
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
        propertyName: "188 Suites KLCC",
        propertyDesc: "188 Suites KLCC",
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
        propertyName: "Opus Residences",
        propertyDesc: "Opus Residences",
        ukey: "Opus",
        metadata: {
            "bedroom": "1-3 Bedroom",
            "bathroom": "2 Bathroom",
            "placeHint": "2.5 km from Pavilion Bukit Bintang"
        }
    },
];

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({children}: { children: ReactNode }) {
    // 🔹 UI state
    const [isActive, setIsActive] = useState(false);

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


    return (
        <UIContext.Provider
            value={{isActive, setIsActive, propertiesSaved, properties, rooms, loading}}
        >
            {children}
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
