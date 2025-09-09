import React from "react";

export default function SustainabilityPage() {
  return (
      <>
        <title>Soulasia | Sustainability</title>
        <main>
          {/* Hero Section */}
          <section className="bg-white w-full px-4 md:px-10 lg:px-20 xl:px-[200px] max-w-[1920px] mx-auto py-10 flex items-center justify-center">
            <div className="relative w-full h-[251px] md:h-[425px] lg:h-[500px] xl:h-[500px] rounded-3xl overflow-hidden">
              <img
                  src="/media-assets/asset7.jpg"
                  alt="Sustainable living"
                  className="absolute inset-0 w-full h-full object-cover rounded-[12px] md:rounded-[16px] lg:rounded-[24px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/40"></div>

              <div className="absolute left-[20px] top-[20px] w-[302px] h-[112px] md:left-[32px] md:top-[32px] md:w-[440px] md:h-[146px] lg:left-[63px] lg:top-[60px] lg:w-[679px] lg:h-[126px] xl:left-[63px] xl:top-[60px] xl:w-[679px] xl:h-[142px] flex flex-col gap-2 md:gap-4 lg:gap-5 justify-start">
                <h1 className="font-manrope font-semibold text-2xl leading-8 md:text-3xl md:leading-10 lg:text-4xl lg:leading-14 xl:text-5xl xl:leading-16 text-[#DFDFDF]">
                  Sustainable living in Malaysia
                </h1>
                <p className="font-manrope text-sm leading-5 md:text-lg md:leading-6 lg:text-xl lg:leading-7 text-[#DFDFDF]">
                  At Soulasia, our commitment to sustainability is woven into every aspect of our operations.
                </p>
              </div>
            </div>
          </section>

          {/* Sustainability Content Section */}
          <section className="bg-white max-w-[1920px] mx-auto px-4 md:px-10 lg:px-20 xl:px-[200px] py-10">
            {/* Main Header */}
            <div className="flex flex-col lg:flex-row lg:justify-between items-start gap-6 md:gap-8 lg:gap-10 mb-10 xl:mb-[60px] lg:items-start">
              <h1 className="text-2xl leading-[33px] md:text-[32px] md:leading-[44px] lg:text-[40px] xl:text-[48px] font-semibold lg:leading-[55px] xl:leading-[66px] text-[#101828] max-w-xl">Eco-Friendly Solutions for a Sustainable Stay</h1>
              <p className="text-sm leading-[19px] md:text-lg md:leading-[25px] xl:text-2xl xl:leading-[33px] font-normal text-[#4A4F5B] max-w-lg">We integrate eco-friendly solutions across energy, cleaning, water conservation, plastic reduction, and paperless processes, ensuring every guest experiences a truly sustainable stay.</p>
            </div>

            {/* Content Blocks */}
            <div className="flex flex-col gap-6 md:gap-10 lg:gap-[60px]">
              {/* Item 1 */}
              <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-10 xl:gap-[60px] w-full">
                <div className="lg:w-1/2 flex flex-col gap-4">
                  <div className="border border-primary rounded-lg w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 flex items-center justify-center">
                    <span className="text-xs leading-[16px] md:text-sm md:leading-[19px] lg:text-lg lg:leading-[25px] xl:text-xl xl:leading-[27px] font-medium text-[#4A4F5B]">1</span>
                  </div>
                  <h2 className="text-xl leading-[27px] md:text-2xl md:leading-[33px] lg:text-[32px] lg:leading-[44px] xl:text-[32px] xl:leading-[44px] font-semibold">Sustainable Energy</h2>
                  <p className="text-sm leading-[19px] md:text-base md:leading-[22px] lg:text-lg lg:leading-[25px] xl:text-lg xl:leading-[25px] font-normal text-[#4A4F5B]">We power all our apartments with low-carbon electricity through the TNB Green Electricity Tariff (GET) Programme. This initiative enables us to use energy from solar and hydropower plants, significantly reducing our carbon footprint.</p>
                </div>
                <div className="lg:w-1/2 rounded-[10px] overflow-hidden">
                  <img src="/sustainability/energy.jpg" alt="Sustainable Energy" className="w-full h-auto object-cover rounded-[14px]" />
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-10 xl:gap-[60px] w-full">
                <div className="lg:w-1/2 flex flex-col gap-4">
                  <div className="border border-primary rounded-lg w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 flex items-center justify-center">
                    <span className="text-xs leading-[16px] md:text-sm md:leading-[19px] lg:text-lg lg:leading-[25px] xl:text-xl xl:leading-[27px] font-medium text-[#4A4F5B]">2</span>
                  </div>
                  <h2 className="text-xl leading-[27px] md:text-2xl md:leading-[33px] lg:text-[32px] lg:leading-[44px] xl:text-[32px] xl:leading-[44px] font-semibold">Eco-Friendly Cleaning Practices</h2>
                  <p className="text-sm leading-[19px] md:text-base md:leading-[22px] lg:text-lg lg:leading-[25px] xl:text-lg xl:leading-[25px] font-normal text-[#4A4F5B]">We prioritize green living by using eco-friendly chemicals in all cleaning and laundry processes. Even our air conditioning systems are maintained with sustainable products, ensuring efficiency and environmental responsibility.</p>
                </div>
                <div className="lg:w-1/2 rounded-[10px] overflow-hidden">
                  <img src="/sustainability/cleaning.jpg" alt="Eco-Friendly Cleaning Practices" className="w-full h-auto object-cover rounded-[14px]" />
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-10 xl:gap-[60px] w-full">
                <div className="lg:w-1/2 flex flex-col gap-4">
                  <div className="border border-primary rounded-lg w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 flex items-center justify-center">
                    <span className="text-xs leading-[16px] md:text-sm md:leading-[19px] lg:text-lg lg:leading-[25px] xl:text-xl xl:leading-[27px] font-medium text-[#4A4F5B]">3</span>
                  </div>
                  <h2 className="text-xl leading-[27px] md:text-2xl md:leading-[33px] lg:text-[32px] lg:leading-[44px] xl:text-[32px] xl:leading-[44px] font-semibold">Water Conservation</h2>
                  <p className="text-sm leading-[19px] md:text-base md:leading-[22px] lg:text-lg lg:leading-[25px] xl:text-lg xl:leading-[25px] font-normal text-[#4A4F5B]">Water conservation is at the core of our sustainability efforts:</p>
                  <ul className="list-disc pl-5">
                    <li className="text-sm leading-[19px] md:text-base md:leading-[22px] lg:text-lg lg:leading-[25px] xl:text-lg xl:leading-[25px] font-normal text-[#4A4F5B]">All apartments are fitted with water-saving showerheads that reduce water waste without sacrificing comfort.</li>
                    <li className="text-sm leading-[19px] md:text-base md:leading-[22px] lg:text-lg lg:leading-[25px] xl:text-lg xl:leading-[25px] font-normal text-[#4A4F5B]">Smart-timed water heaters automatically switch off after 20 minutes, cutting down on unnecessary energy use.</li>
                  </ul>
                </div>
                <div className="lg:w-1/2 rounded-[10px] overflow-hidden">
                  <img src="/sustainability/water.jpg" alt="Water Conservation" className="w-full h-auto object-cover rounded-[14px]" />
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-10 xl:gap-[60px] w-full">
                <div className="lg:w-1/2 flex flex-col gap-4">
                  <div className="border border-primary rounded-lg w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 flex items-center justify-center">
                    <span className="text-xs leading-[16px] md:text-sm md:leading-[19px] lg:text-lg lg:leading-[25px] xl:text-xl xl:leading-[27px] font-medium text-[#4A4F5B]">4</span>
                  </div>
                  <h2 className="text-xl leading-[27px] md:text-2xl md:leading-[33px] lg:text-[32px] lg:leading-[44px] xl:text-[32px] xl:leading-[44px] font-semibold">Plastic-Free Commitment</h2>
                  <p className="text-sm leading-[19px] md:text-base md:leading-[22px] lg:text-lg lg:leading-[25px] xl:text-lg xl:leading-[25px] font-normal text-[#4A4F5B]">We are fully committed to a plastic-free stay. Instead of bottled water, we provide Coway or Cuckoo water filters — globally recognized brands offering safe and eco-friendly hydration. This small change makes a big impact in reducing plastic waste.</p>
                </div>
                <div className="lg:w-1/2 rounded-[10px] overflow-hidden">
                  <img src="/sustainability/plastic.jpg" alt="Plastic-Free Commitment" className="w-full h-auto object-cover rounded-[14px]" />
                </div>
              </div>

              {/* Item 5 */}
              <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-10 xl:gap-[60px] w-full">
                <div className="lg:w-1/2 flex flex-col gap-4">
                  <div className="border border-primary rounded-lg w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 flex items-center justify-center">
                    <span className="text-xs leading-[16px] md:text-sm md:leading-[19px] lg:text-lg lg:leading-[25px] xl:text-xl xl:leading-[27px] font-medium text-[#4A4F5B]">5</span>
                  </div>
                  <h2 className="text-xl leading-[27px] md:text-2xl md:leading-[33px] lg:text-[32px] lg:leading-[44px] xl:text-[32px] xl:leading-[44px] font-semibold">Paperless Operations</h2>
                  <p className="text-sm leading-[19px] md:text-base md:leading-[22px] lg:text-lg lg:leading-[25px] xl:text-lg xl:leading-[25px] font-normal text-[#4A4F5B]">To align with our sustainability goals, we have gone paperless in all billing and payment processes. This reduces waste and supports our broader environmental initiatives.</p>
                </div>
                <div className="lg:w-1/2 rounded-[10px] overflow-hidden">
                  <img src="/sustainability/paper.jpg" alt="Paperless Operations" className="w-full h-auto object-cover rounded-[14px]" />
                </div>
              </div>
            </div>
          </section>
        </main>
      </>
  );
}
