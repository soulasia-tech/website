"use client";
import React, {useEffect, useState, useRef} from "react";
import Image from "next/image";
import Link from "next/link";
import {cn} from "@/lib/utils";

const LINKS = [
    {selected: true, href: 'r', label: 'Living room'},
    {selected: false, href: 't', label: 'Kitchen'},
    {selected: false, href: 'mb', label: 'Master bedroom'},
];

type GalleryImage = {
    src: string;
    alt?: string;
};

interface GalleryProps {
    images: GalleryImage[];
    selectedIndex?: number;
    onClose?: () => void;
}

export function Gallery({images, onClose, selectedIndex}: GalleryProps) {
    const [selectedIdx, setSelectedIdx] = useState<number>(selectedIndex ?? 0);

    const thumbsRef = useRef<HTMLDivElement>(null);
    const selectedThumbRef = useRef<HTMLDivElement>(null);

    const hasPrev = selectedIdx > 0;
    const hasNext = selectedIdx < images.length - 1;
    const selectedImage = images[selectedIdx];

    useEffect(() => {
        if (images.length > 0) {
            setSelectedIdx(0);
        }
    }, [images]);

    const handleNext = () => {
        setSelectedIdx((prev) =>
            prev < images.length - 1 ? prev + 1 : prev
        );
    };

    const handlePrev = () => {
        setSelectedIdx((prev) =>
            prev > 0 ? prev - 1 : prev
        );
    };

    useEffect(() => {
        if (selectedThumbRef.current) {
            selectedThumbRef.current.scrollIntoView({
                behavior: "smooth",
                inline: "center", // center thumbnail
                block: "nearest",
            });
        }
    }, [selectedIdx]);

    return (
        <>
            <div
                className="w-full h-full flex flex-col justify-between gap-4 lp:gap-6 bg-dark"
                // onClick={e => e.stopPropagation()}
            >
                {/*Header titles*/}
                <div className="flex justify-between items-center ">
                    <div>
                        <nav
                            className="hidden tb:ml-[100px] full:ml-[200px] items-center text-base tracking-[-0.01em] gap-5"
                        >
                            {LINKS.map((l) => (
                                <Link key={l.href} href=""
                                      className={l.selected ? 'font-semibold text-white' : 'font-normal text-white/80'}>
                                    {l.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    {/* Cross Button */}
                    <button
                        className="cursor-pointer flex items-center bg-white rounded-md justify-center aspect-[1/1] w-[32px] lp:w-[40px]"
                        onClick={onClose}
                    >
                        <Image
                            src="/icons/cross.svg"
                            alt="Prev"
                            className="transform rotate-180"
                            width={16}
                            height={16}
                        />
                    </button>
                </div>
                {/*Large Image*/}
                <div className="flex flex-col gap-3 lp:gap-5">
                    <div className="relative flex justify-center items-center">
                        {/* arrows */}
                        <button
                            onClick={() => {
                                handlePrev()
                            }}
                            className={cn("absolute left-2 top-1/2 -translate-y-1/2 z-10 cursor-pointer mb-2 flex items-center rounded-md justify-center aspect-[1/1] w-[32px] lp:w-[40px]",
                                !hasPrev ? "bg-white/20" : "bg-white")}>
                            <Image
                                src={`/icons/arrow-${!hasPrev ? 'light' : 'dark'}.svg`}
                                alt="Prev"
                                className="transform rotate-180"
                                width={16}
                                height={16}
                            />
                        </button>

                        {/*Image View*/}
                        <div
                            className="flex justify-center relative aspect-[4/3] lp:aspect-[13/8] full:aspect-[16/9] h-[320px] tb:h-[460px] lp:h-[500px] full:h-[700px] rounded-xl overflow-hidden">
                            {selectedImage &&
                                (<Image
                                    src={selectedImage.src}
                                    alt={selectedImage?.alt ?? ""}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                                />)
                            }
                        </div>

                        {/* arrows */}
                        <button
                            onClick={() => {
                                handleNext()
                            }}
                            className={cn("cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 z-10 mb-2 flex items-center rounded-md justify-center aspect-[1/1] w-[32px] lp:w-[40px] custom-next",
                                !hasNext ? "bg-white/20" : "bg-white")}>
                            <Image
                                src={`/icons/arrow-${!hasNext ? 'light' : 'dark'}.svg`}
                                alt="Next"
                                width={16}
                                height={16}
                            />
                        </button>
                    </div>
                    <div
                        className="flex w-full justify-center items-center text-lg lp:text-xl full:text-2xl font-semibold text-white">{selectedIdx + 1} of {images.length}</div>

                </div>
                {/*Images*/}
                <div
                    ref={thumbsRef}
                    className="flex overflow-x-auto overflow-y-hidden no-scrollbar gap-3 lp:gap-5 scroll-smooth"
                >
                    {images.map((image, idx) => (
                        <div
                            key={idx}
                            onClick={() => {
                                setSelectedIdx(idx)
                            }}
                            className="flex-shrink-0 snap-start"
                            ref={idx === selectedIdx ? selectedThumbRef : null}
                        >
                            <div
                                className="relative w-full aspect-[1/1] h-[100px] tb:h-[120px] lp:h-[140px] full:h-[160px]">
                                <Image
                                    src={image.src}
                                    alt={`Property image ${idx + 1}`}
                                    fill
                                    className="object-cover rounded-xl"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
