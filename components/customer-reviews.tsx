import {useEffect} from "react";

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
        <div className="container py-12">
            <div className="mb-12 md:mb-16">
                <div className="flex justify-between items-end ">
                    <div className="max-w-lg text-left mb-4">
                        <h2 className="h2">What Our Guests Say</h2>
                    </div>
                    <div className="flex gap-x-[10px] items-center">
                        <div onClick={scrollPrev}
                             className="mb-2 flex items-center bg-[#e5eeff] rounded-md justify-center aspect-[1/1] w-[32px] lp:w-[40px]">
                            <img src="/icons/arrow.svg" alt="" className="transform rotate-180"/>
                        </div>
                        <div onClick={scrollNext}
                             className="mb-2 flex items-center bg-[#e5eeff] rounded-md justify-center aspect-[1/1] w-[32px] lp:w-[40px]">
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
