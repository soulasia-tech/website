"use client";
import React, {useEffect, useState, useRef} from "react";
import Map, {MapRef, Marker, Popup} from "react-map-gl";
import Image from "next/image";
import {useUI} from "@/lib/context";

interface PropertyMarker {
    lat: number;
    lng: number;
    name: string;
    address?: string;
}

export function PropertiesMap({propertyMarkers, fullScreenMode = false, zoom = 15}: {
    propertyMarkers: PropertyMarker[],
    fullScreenMode?: boolean,
    zoom?: number
}) {
    const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        if (propertyMarkers.length > 0) {
            const avgLat = propertyMarkers.reduce((sum, m) => sum + m.lat, 0) / propertyMarkers.length;
            const avgLng = propertyMarkers.reduce((sum, m) => sum + m.lng, 0) / propertyMarkers.length;
            setCenter({lat: avgLat, lng: avgLng});
        } else {
            setCenter(null);
        }
    }, [propertyMarkers]);

    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    const mapRef = useRef<MapRef>(null)

    const {openMap, closeMap} = useUI();

    const handleOpenMap = () => {
        openMap({propertyMarkers, zoom: 12}); // pass props to MapComponent
    };

    return (
        <>
            {center &&
                <div
                    className="relative z-1 flex justify-center items-center w-full h-full rounded-xl shadow bg-white">
                    <Map
                        ref={mapRef}
                        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                        initialViewState={{longitude: center.lng, latitude: center.lat, zoom: zoom}}
                        style={{width: "100%", height: "100%", borderRadius: "14px"}}
                        mapStyle="mapbox://styles/mapbox/streets-v11"
                    >
                        {propertyMarkers.map((marker, idx) => (
                            <Marker
                                key={idx}
                                longitude={marker.lng}
                                latitude={marker.lat}
                                anchor="bottom"
                                onClick={() => setSelectedIdx(idx)}
                            >
                                <Image
                                    src="/icons/marker.svg"
                                    alt="x"
                                    width={40}
                                    height={44}
                                    className="w-10 h-11 cursor-pointer"
                                />
                            </Marker>
                        ))}
                        {selectedIdx !== null && propertyMarkers[selectedIdx] && (
                            <Popup
                                longitude={propertyMarkers[selectedIdx].lng}
                                latitude={propertyMarkers[selectedIdx].lat}
                                anchor="top"
                                onClose={() => setSelectedIdx(null)}
                                closeOnClick={false}
                                focusAfterOpen={false}
                            >
                                <div>
                                    <strong>{propertyMarkers[selectedIdx].name}</strong>
                                    <br/>
                                    {propertyMarkers[selectedIdx].address}
                                </div>
                            </Popup>
                        )}
                    </Map>

                    {/* Controls (top-right corner) */}
                    <div className="absolute top-5 right-5 flex flex-col gap-2.5 z-10">
                        <div className="flex flex-col bg-white shadow-layered rounded-lg border-1 border-[#dee3ed]">
                            {
                                fullScreenMode ?
                                    <button
                                        onClick={() => closeMap()}
                                        className="aspect-[1/1] w-[32px] lp:w-[40px] flex items-center justify-center bg-white rounded-lg hover:bg-gray-100"

                                    >
                                        <Image
                                            src="/icons/cross.svg"
                                            alt="x"
                                            width={16}
                                            height={16}
                                            className="w-4 h-4"
                                        />
                                    </button> :
                                    <button
                                        onClick={() => handleOpenMap()}
                                        className="aspect-[1/1] w-[32px] lp:w-[40px] flex items-center justify-center bg-white rounded-lg hover:bg-gray-100"
                                    >
                                        <Image
                                            src="/icons/expand.svg"
                                            alt="x"
                                            width={16}
                                            height={16}
                                            className="w-4 h-4"
                                        />
                                    </button>
                            }
                        </div>
                        <div className="flex flex-col bg-white shadow-layered rounded-lg border-1 border-[#dee3ed]">
                            <button
                                onClick={() => mapRef.current?.zoomIn()}
                                className="aspect-[1/1] w-[32px] lp:w-[40px] flex items-center justify-center bg-white rounded-t-lg hover:bg-gray-100"
                            >
                                <Image
                                    src="/icons/plus.svg"
                                    alt="+"
                                    width={16}
                                    height={16}
                                />
                            </button>
                            <div className="border-t-[1px] border-[#dee3ed]"></div>
                            <button
                                onClick={() => mapRef.current?.zoomOut()}
                                className="aspect-[1/1] w-[32px] lp:w-[40px] flex items-center justify-center bg-white rounded-b-lg hover:bg-gray-100"
                            >
                                <Image
                                    src="/icons/minus.svg"
                                    alt="-"
                                    width={16}
                                    height={16}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            }
        </>
    );
} 
