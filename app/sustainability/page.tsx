"use client"

import {motion} from "framer-motion"
import Image from "next/image";
import React from "react";

const fadeIn = {
    hidden: {opacity: 0, y: 20},
    visible: {
        opacity: 1,
        y: 0,
        transition: {duration: 0.6},
    },
}

const staggerContainer = {
    hidden: {opacity: 0},
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3,
        },
    },
}

export default function SustainabilityPage() {
    return (
        <>
            <title>Soulasia | Sustainability</title>
            <main className="bg-white">
                {/* Hero Section */}
                <section className="section-component-p-y">
                    <div className="container relative">
                        <div
                            className="relative w-full max-h-[251px] tb:max-h-[425px] lp:max-h-[500px] aspect-[4/3] lp:aspect-[19/10] overflow-hidden lp:rounded-[24px] tb:rounded-[16px] rounded-[12px] z-0">
                            <Image
                                src="/media-assets/asset7.jpg"
                                alt="Soulasia Guest"
                                fill
                                priority
                                quality={80}
                                sizes="100vw"
                                className="object-cover"
                                style={{objectPosition: 'center 30%'}} // adjust focus area
                            />
                            {/* Overlay to darken the image further */}
                            <div
                                className="lp:rounded-[24px] tb:rounded-[16px] rounded-[12px] absolute inset-0 bg-black/40"/>
                        </div>
                        {/* Overlay (optional) */}

                        <motion.div
                            initial={{opacity: 0, y: -30}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.6, delay: 0.2}}
                            className="absolute inset-0 top-[20px] left-[20px] tb:top-[32px] tb:left-[32px] lp:top-[60px] lp:left-[60px]">
                            <div
                                className="space-y-2 tb:space-y-4 lp:space-y-6 w-full tb:max-w-120 lp:max-w-260  text-white flex flex-col justify-start">
                                <h2 className="h2 font-semibold text-[#dfdfdf]">Sustainable Living in Malaysia</h2>
                                <div
                                    className="font-normal text-[#dfdfdf] text-sm tb:text-base lp:text-lg full:text-2xl">
                                    At Soulasia, our commitment to sustainability is woven into every aspect of our
                                    operations.
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Sustainability Content Section */}
                <section className="bg-white section-component-p-y">
                    {/* Main Header */}
                    <motion.div
                        key={0}
                        variants={fadeIn}
                        className="flex flex-col lp:flex-row lp:justify-between items-start container gap-6 tb:gap-8 lp:gap-10 mb-10 full:mb-15 ">
                        <h1 className="text-2xl leading-[33px] tb:text-[32px] tb:leading-[44px] lp:text-[40px] full:text-[48px] font-semibold lp:leading-[55px] full:leading-[66px] text-[#101828] max-w-xl">Eco-Friendly
                            Solutions for a Sustainable Stay</h1>
                        <p className="text-sm leading-[19px] tb:text-lg tb:leading-[25px] full:text-2xl full:leading-[33px] font-normal text-[#4A4F5B] max-w-lg">We
                            integrate eco-friendly solutions across energy, cleaning, water conservation, plastic
                            reduction, and
                            paperless processes, ensuring every guest experiences a truly sustainable stay.</p>
                    </motion.div>

                    {/* Content Blocks */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{once: true, amount: 0.2}}
                        variants={staggerContainer}
                        className="flex flex-col gap-6 tb:gap-10 lp:gap-15 container">
                        {/* Item 1 */}
                        <motion.div
                            key={1}
                            initial={{opacity: 0, y: 50}}
                            whileInView={{opacity: 1, y: 0}}
                            transition={{duration: 0.4, delay: 0.1 / 10}}
                            viewport={{once: true, amount: 0.2}}
                            className="flex flex-col lp:flex-row items-start gap-6 lp:gap-10 full:gap-[60px] w-full">
                            <div className="lp:w-1/2 flex flex-col gap-4">
                                <div
                                    className="border border-primary rounded-lg w-7 h-7 tb:w-8 tb:h-8 lp:w-10 lp:h-10 flex items-center justify-center">
                                    <span
                                        className="text-xs leading-[16px] tb:text-sm tb:leading-[19px] lp:text-lg lp:leading-[25px] full:text-xl full:leading-[27px] font-medium text-[#4A4F5B]">1</span>
                                </div>
                                <h2 className="text-xl leading-[27px] tb:text-2xl tb:leading-[33px] lp:text-[32px] lp:leading-[44px] full:text-[32px] full:leading-[44px] font-semibold">Sustainable
                                    Energy</h2>
                                <p className="text-sm leading-[19px] tb:text-base tb:leading-[22px] lp:text-lg lp:leading-[25px] full:text-lg full:leading-[25px] font-normal text-[#4A4F5B]">We
                                    power all our apartments with low-carbon electricity through the TNB Green
                                    Electricity Tariff (GET)
                                    Programme. This initiative enables us to use energy from solar and hydropower
                                    plants, significantly
                                    reducing our carbon footprint.</p>
                            </div>
                            <div className="lp:w-1/2 rounded-[10px] overflow-hidden">
                                <img
                                    src="/sustainability/energy.jpg"
                                    alt="Sustainable Energy"
                                     className="w-full h-auto object-cover rounded-[14px]"
                                />
                            </div>
                        </motion.div>

                        {/* Item 2 */}
                        <motion.div
                            key={2}
                            initial={{opacity: 0, y: 50}}
                            whileInView={{opacity: 1, y: 0}}
                            transition={{duration: 0.4, delay: 0.2 / 10}}
                            viewport={{once: true, amount: 0.2}}
                            className="flex flex-col lp:flex-row items-start gap-6 lp:gap-10 full:gap-[60px] w-full">
                            <div className="lp:w-1/2 flex flex-col gap-4">
                                <div
                                    className="border border-primary rounded-lg w-7 h-7 tb:w-8 tb:h-8 lp:w-10 lp:h-10 flex items-center justify-center">
                    <span
                        className="text-xs leading-[16px] tb:text-sm tb:leading-[19px] lp:text-lg lp:leading-[25px] full:text-xl full:leading-[27px] font-medium text-[#4A4F5B]">2</span>
                                </div>
                                <h2 className="text-xl leading-[27px] tb:text-2xl tb:leading-[33px] lp:text-[32px] lp:leading-[44px] full:text-[32px] full:leading-[44px] font-semibold">Eco-Friendly
                                    Cleaning Practices</h2>
                                <p className="text-sm leading-[19px] tb:text-base tb:leading-[22px] lp:text-lg lp:leading-[25px] full:text-lg full:leading-[25px] font-normal text-[#4A4F5B]">We
                                    prioritize green living by using eco-friendly chemicals in all cleaning and laundry
                                    processes. Even
                                    our air conditioning systems are maintained with sustainable products, ensuring
                                    efficiency and
                                    environmental responsibility.</p>
                            </div>
                            <div className="lp:w-1/2 rounded-[10px] overflow-hidden">
                                <img src="/sustainability/cleaning.jpg" alt="Eco-Friendly Cleaning Practices"
                                     className="w-full h-auto object-cover rounded-[14px]"/>
                            </div>
                        </motion.div>

                        {/* Item 3 */}
                        <motion.div
                            key={3}
                            initial={{opacity: 0, y: 50}}
                            whileInView={{opacity: 1, y: 0}}
                            transition={{duration: 0.4, delay: 0.3/ 10}}
                            viewport={{once: true, amount: 0.2}}
                            className="flex flex-col lp:flex-row items-start gap-6 lp:gap-10 full:gap-[60px] w-full">
                            <div className="lp:w-1/2 flex flex-col gap-4">
                                <div
                                    className="border border-primary rounded-lg w-7 h-7 tb:w-8 tb:h-8 lp:w-10 lp:h-10 flex items-center justify-center">
                    <span
                        className="text-xs leading-[16px] tb:text-sm tb:leading-[19px] lp:text-lg lp:leading-[25px] full:text-xl full:leading-[27px] font-medium text-[#4A4F5B]">3</span>
                                </div>
                                <h2 className="text-xl leading-[27px] tb:text-2xl tb:leading-[33px] lp:text-[32px] lp:leading-[44px] full:text-[32px] full:leading-[44px] font-semibold">Water
                                    Conservation</h2>
                                <p className="text-sm leading-[19px] tb:text-base tb:leading-[22px] lp:text-lg lp:leading-[25px] full:text-lg full:leading-[25px] font-normal text-[#4A4F5B]">Water
                                    conservation is at the core of our sustainability efforts:</p>
                                <ul className="list-disc pl-5">
                                    <li className="text-sm leading-[19px] tb:text-base tb:leading-[22px] lp:text-lg lp:leading-[25px] full:text-lg full:leading-[25px] font-normal text-[#4A4F5B]">All
                                        apartments are fitted with water-saving showerheads that reduce water waste
                                        without sacrificing
                                        comfort.
                                    </li>
                                    <li className="text-sm leading-[19px] tb:text-base tb:leading-[22px] lp:text-lg lp:leading-[25px] full:text-lg full:leading-[25px] font-normal text-[#4A4F5B]">Smart-timed
                                        water heaters automatically switch off after 20 minutes, cutting down on
                                        unnecessary energy use.
                                    </li>
                                </ul>
                            </div>
                            <div className="lp:w-1/2 rounded-[10px] overflow-hidden">
                                <img src="/sustainability/water.jpg" alt="Water Conservation"
                                     className="w-full h-auto object-cover rounded-[14px]"/>
                            </div>
                        </motion.div>

                        {/* Item 4 */}
                        <motion.div
                            key={4}
                            initial={{opacity: 0, y: 50}}
                            whileInView={{opacity: 1, y: 0}}
                            transition={{duration: 0.4, delay: 0.4/ 10}}
                            viewport={{once: true, amount: 0.2}}
                            className="flex flex-col lp:flex-row items-start gap-6 lp:gap-10 full:gap-[60px] w-full">
                            <div className="lp:w-1/2 flex flex-col gap-4">
                                <div
                                    className="border border-primary rounded-lg w-7 h-7 tb:w-8 tb:h-8 lp:w-10 lp:h-10 flex items-center justify-center">
                    <span
                        className="text-xs leading-[16px] tb:text-sm tb:leading-[19px] lp:text-lg lp:leading-[25px] full:text-xl full:leading-[27px] font-medium text-[#4A4F5B]">4</span>
                                </div>
                                <h2 className="text-xl leading-[27px] tb:text-2xl tb:leading-[33px] lp:text-[32px] lp:leading-[44px] full:text-[32px] full:leading-[44px] font-semibold">Plastic-Free
                                    Commitment</h2>
                                <p className="text-sm leading-[19px] tb:text-base tb:leading-[22px] lp:text-lg lp:leading-[25px] full:text-lg full:leading-[25px] font-normal text-[#4A4F5B]">We
                                    are fully committed to a plastic-free stay. Instead of bottled water, we provide
                                    Coway or Cuckoo
                                    water filters — globally recognized brands offering safe and eco-friendly hydration.
                                    This small
                                    change makes a big impact in reducing plastic waste.</p>
                            </div>
                            <div className="lp:w-1/2 rounded-[10px] overflow-hidden">
                                <img src="/sustainability/plastic.jpg" alt="Plastic-Free Commitment"
                                     className="w-full h-auto object-cover rounded-[14px]"/>
                            </div>
                        </motion.div>

                        {/* Item 5 */}
                        <motion.div
                            key={5}
                            initial={{opacity: 0, y: 50}}
                            whileInView={{opacity: 1, y: 0}}
                            transition={{duration: 0.4, delay: 0.5/ 10}}
                            viewport={{once: true, amount: 0.2}}
                            className="flex flex-col lp:flex-row items-start gap-6 lp:gap-10 full:gap-[60px] w-full">
                            <div className="lp:w-1/2 flex flex-col gap-4">
                                <div
                                    className="border border-primary rounded-lg w-7 h-7 tb:w-8 tb:h-8 lp:w-10 lp:h-10 flex items-center justify-center">
                    <span
                        className="text-xs leading-[16px] tb:text-sm tb:leading-[19px] lp:text-lg lp:leading-[25px] full:text-xl full:leading-[27px] font-medium text-[#4A4F5B]">5</span>
                                </div>
                                <h2 className="text-xl leading-[27px] tb:text-2xl tb:leading-[33px] lp:text-[32px] lp:leading-[44px] full:text-[32px] full:leading-[44px] font-semibold">Paperless
                                    Operations</h2>
                                <p className="text-sm leading-[19px] tb:text-base tb:leading-[22px] lp:text-lg lp:leading-[25px] full:text-lg full:leading-[25px] font-normal text-[#4A4F5B]">To
                                    align with our sustainability goals, we have gone paperless in all billing and
                                    payment processes.
                                    This reduces waste and supports our broader environmental initiatives.</p>
                            </div>
                            <div className="lp:w-1/2 rounded-[10px] overflow-hidden">
                                <img src="/sustainability/paper.jpg" alt="Paperless Operations"
                                     className="w-full h-auto object-cover rounded-[14px]"/>
                            </div>
                        </motion.div>
                    </motion.div>
                </section>
            </main>
        </>
    );
}
