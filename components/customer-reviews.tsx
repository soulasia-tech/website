import {useEffect, useState} from "react";

export function CustomerReviews() {
    const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);

    useEffect(() => {
        // Inject Elfsight script once
        if (!document.querySelector('script[src="https://static.elfsight.com/platform/platform.js"]')) {
            const script = document.createElement("script");
            script.src = "https://static.elfsight.com/platform/platform.js";
            script.async = true;
            document.body.appendChild(script);
        }

        // Poll until Elfsight renders the internal track
        const interval = setInterval(() => {
            const container = document.querySelector(
                ".elfsight-app-b6e0f7e5-21ef-4db4-a42d-f02a49cc25f3"
            );
            if (container) {
                // Elfsight usually nests its carousel items one level deeper
                const inner = container.querySelector("div");
                if (inner) {
                    (inner as HTMLElement).style.scrollBehavior = "smooth";
                    setScrollEl(inner as HTMLElement);
                    clearInterval(interval);
                }
            }
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const scrollNext = () => {
        if (scrollEl) scrollEl.scrollBy({ left: 300, behavior: "smooth" });
    };

    const scrollPrev = () => {
        if (scrollEl) scrollEl.scrollBy({ left: -300, behavior: "smooth" });
    };


    return (
        <div className="container py-12">
            <div className="mb-12 md:mb-16">
                <div className="flex justify-between items-end ">
                    <div className="max-w-lg text-left mb-4">
                        <h2 className="h2">What Our Guests Say</h2>
                    </div>
                    <div className="flex gap-x-[10px] items-center">
                        <div onClick={scrollPrev}
                             className="mb-2 flex items-center bg-[#e5eeff] rounded-md justify-center w-[40px] h-[40px]">
                            <img src="/icons/arrow.svg" alt="" className="transform rotate-180"/>
                        </div>
                        <div onClick={scrollNext}
                             className="mb-2 flex items-center bg-[#e5eeff] rounded-md justify-center w-[40px] h-[40px]">
                            <img src="/icons/arrow.svg" alt=""/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="elfsight-app-b6e0f7e5-21ef-4db4-a42d-f02a49cc25f3" data-elfsight-app-lazy/>
        </div>
    );
}

export default CustomerReviews; 
