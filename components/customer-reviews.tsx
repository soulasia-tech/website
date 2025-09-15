import React, {useEffect} from "react";
import Image from "next/image"

export function CustomerReviews() {

    useEffect(() => {
        // Only add the script if it hasn't been added yet
        if (!document.querySelector('script[src="https://static.elfsight.com/platform/platform.js"]')) {
            const script = document.createElement("script");
            script.src = "https://static.elfsight.com/platform/platform.js";
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const scrollNext = () => {
        const btn = document.querySelector(
            ".es-carousel-arrow-control-right"
        ) as HTMLElement | null;
        btn?.click();
    };

    const scrollPrev = () => {
        const btn = document.querySelector(
            ".es-carousel-arrow-control-left"
        ) as HTMLElement | null;
        btn?.click();
    };

    return (
        <section className="section-padding-y relative overflow-hidden">
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none bg-[#f9fafb]" aria-hidden="true"/>
            <div className="container py-12 relative z-10">
                <div className="mb-12 md:mb-16 ">
                    <div className="flex flex-col tb:flex-row justify-between items-end ">
                        <div className="max-w-lg text-left mb-4 mr-auto">
                            <h2 className="h2">What Our Guests Say</h2>
                        </div>
                        <div className="flex gap-x-[10px] items-center">
                            <div onClick={scrollPrev}
                                 className="mb-2 flex items-center bg-[#e5eeff] rounded-md justify-center aspect-[1/1] w-[32px] lp:w-[40px]">
                                <Image
                                    src="/icons/arrow.svg"
                                    alt="Arrow"
                                    width={16}
                                    height={16}
                                    className="transform rotate-180"
                                />
                            </div>
                            <div onClick={scrollNext}
                                 className="mb-2 flex items-center bg-[#e5eeff] rounded-md justify-center aspect-[1/1] w-[32px] lp:w-[40px]">
                                <Image
                                    src="/icons/arrow.svg"
                                    alt="Arrow"
                                    width={16}
                                    height={16}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="elfsight-app-f139592a-b1c1-4f98-b760-7db98a1f710b" data-elfsight-app-lazy/>
            </div>
        </section>

    );
}

export default CustomerReviews;
