"use client"

import {motion} from "framer-motion"
import Image from "next/image";
import React, {useEffect, useRef} from "react";
import Link from "next/link";
import {cn} from "@/lib/utils";

// Animation variants
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
            staggerChildren: 0.1,
        },
    },
}

const imagesMap = [
    "/partnership/3.jpg",
    "/partnership/4.jpg",
    "/partnership/5.jpg",
    "/partnership/6.jpg",
    "/partnership/9.jpg",
    "/partnership/10.jpg",
    "/partnership/11.jpg",
    "/partnership/12.jpg",
    "/partnership/13.jpg",
    "/partnership/14.jpg",
    "/partnership/15.jpg",
    "/partnership/16.jpg",
    "/partnership/18.jpg",
    "/partnership/19.jpg",
    "/partnership/20.jpg",
    "/partnership/21.jpg",
    "/partnership/23.jpg",
    "/partnership/24.jpg",
]

const partnerLink = "https://www.theblueground.com/sp?placeId=ct-eyJ0eXBlIjoiY2l0eSIsImxhdCI6My4xNDk5MjIyLCJsbmciOjEwMS42OTQ0NjE5fQ";

export default function PartnershipPage() {

    const trackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const AUTO_SPEED = 1; // pixels per frame
        let animationFrame: number;

        const autoScroll = () => {
            if (!trackRef.current) return;

            trackRef.current.scrollLeft += AUTO_SPEED;

            // reset when reached end
            if (
                trackRef.current.scrollLeft >=
                trackRef.current.scrollWidth - trackRef.current.clientWidth
            ) {
                trackRef.current.scrollLeft = 0;
            }

            animationFrame = requestAnimationFrame(autoScroll);
        };

        animationFrame = requestAnimationFrame(autoScroll);

        return () => cancelAnimationFrame(animationFrame);
    }, []);

    return (
        <>
            <title>Soulasia | For Partnership</title>
            <div className="bg-white">
                {/* Hero Section with Gallery */}
                <section
                    className="section-padding-y relative overflow-hidden bg-white flex flex-col justify-between -mt-nav ">
                    {/* Decorative Elements */}
                    <div className="dark-header absolute inset-0 bg-[#101828] w-full h-full z-0"></div>

                    <div
                        className="container relative flex flex-col items-center justify-center text-center z-10 pt-10 mb-8 tb:mb-10 lp:mb-14 full:mb-17">
                        <div className="flex items-center gap-2 lp:gap-3 mb-4 tb:mb-6 full:mb-10">
                            <span
                                className="font-medium text-white text-sm tb:text-base lp:text-base full:text-xl ">OFFICIAL MASTER PARTNER OF</span>
                            <Image
                                src="/icons/logo-blueground.svg" alt="BLUEGROUND"
                                className="w-auto h-4 tb:h-4.5 lp:h-5 full:h-6"
                                width={24}
                                height={24}
                            />
                        </div>
                        <h1 className="leading-tight mx-auto font-bold text-white text-[23px] tb:text-[calc(var(--fs-h1))] lp:w-4/5 mb-2 tb:mb-4 full:mb-8">
                            A Partnership that changed <br/> how we build living experiences
                        </h1>
                        <div
                            className="text-white font-normal text-sm tb:text-lg lp:text-xl full:text-[32px] lp:max-w-3xl lp:w-4/5 mx-auto">
                            How global discipline reshaped the way we design, operate, and manage living spaces in Kuala
                            Lumpur
                        </div>
                    </div>
                    {/* Gallery */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"

                        viewport={{once: true, margin: "-100px"}}
                        variants={fadeIn}
                        className="relative overflow-hidden w-full"
                    >
                        {/* Track */}
                        <div
                            ref={trackRef}
                            className="flex overflow-x-auto scroll-smooth no-scrollbar"
                        >
                            {imagesMap.map((src: string, idx: number) => (
                                <div
                                    key={idx}
                                    className="flex-shrink-0 basis-3/4 tb:basis-2/5 lp:basis-2/7 full:basis-2/10 group overflow-hidden px-1 tb:px-2.5  last:pr-0 ">
                                    <div
                                        className="relative w-full aspect-[5/4] h-[210px] tb:h-[260px] lp:h-[286px] full:h-[380px]">
                                        <Image
                                            src={src}
                                            alt={`Property image ${idx + 1}`}
                                            fill
                                            // sizes="(max-width: 768px) 100vw, 400px"
                                            className="object-cover rounded-xl"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* Feels Like */}
                <section className="section-padding-y overflow-hidden bg-[#F9FAFB]">
                    <div className="container relative">
                        <div
                            className="grid grid-cols-1 lp:grid-cols-2 gap-2.5 lp:gap-5 mb-6 tb:mb-10 items-end justify-items-start">
                            <h2 className="h2 font-semibold text-[#101828]/60 lp:w-4/5">
                                What a Good Stay{" "}
                                <span className="text-[#101828] whitespace-nowrap">
                                    Really Feels Like
                                </span>
                            </h2>
                            <div
                                className="font-normal text-[#3B4A68] text-sm tb:text-base lp:text-xl full:text-2xl max-w-fit">
                                At Soulasia, everything starts with a simple question: <br/>
                                <span className="font-semibold text-[#101828] whitespace-nowrap">
                                    what does a good stay actually feel like?
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lp:grid-cols-2 gap-2.5 lp:gap-5">
                            <div className="relative w-full h-full rounded-[10px] tb:rounded-[14px] bg-[#ECF2FF]">
                                <motion.div
                                    initial={{opacity: 0, y: -30}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.8, delay: 0.2}}
                                    className="w-full h-full flex flex-col justify-between p-6 tb:p-8 space-y-8 tb:space-y-15 lp:space-y-4">
                                    <div
                                        className="w-full flex flex-col gap-2.5">
                                        <h2 className="w-4/5 text-[#101828] text-xl tb:text-2xl font-semibold">
                                            Not on paper.{" "}
                                            <span className="whitespace-nowrap">
                                                Not in presentations.
                                            </span>
                                        </h2>
                                        <span
                                            className="w-full font-normal text-[#3B4A68] text-base tb:text-lg lp:text-xl">
                                            But in real life — when someone opens the door, drops their bags, and instantly
                                            feels that the space works.
                                        </span>
                                    </div>
                                    <div
                                        className="w-full flex flex-col gap-2.5 font-normal text-base tb:text-lg lp:text-xl">
                                        <span className="font-semibold text-[#101828]">
                                            Years of managing short-term stays in Kuala Lumpur taught us speed, flexibility, and how to operate under constant movement. Frequent check-ins. Fast turnovers. High expectations.
                                        </span>
                                        <span className="text-[#3B4A68]">
                                            We learned how to solve problems quickly — and how powerful it is when nothing feels like a problem at all.
                                        </span>
                                    </div>
                                </motion.div>
                            </div>
                            <div
                                className="relative w-full h-full max-h-[251px] tb:max-h-[385px] lp:max-h-[590px] aspect-[9/8] lp:aspect-[4/3] overflow-hidden lp:rounded-[24px] tb:rounded-[16px] rounded-[12px] z-0">
                                <Image
                                    src="/partnership/asset1.png"
                                    alt="Soulasia Guest"
                                    fill
                                    priority
                                    sizes="100vw"
                                    className="object-cover"
                                />
                                {/* Overlay to darken the image further */}
                                <motion.div
                                    initial={{opacity: 0, y: -30}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.8, delay: 0.2}}
                                    className="absolute inset-0 w-full h-full z-10 flex items-end justify-end p-5 full:p-8">
                                    <div className="w-max text-white font-semibold justify-start">
                                        A good stay is not noticed. <br/>
                                        It is felt
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Experience and flexibility */}
                <section className="section-padding-y overflow-hidden bg-white">
                    <div className="container flex flex-col">
                        <div className="flex flex-col lp:w-1/2 text-left gap-2.5 mb-6 tb:mb-8 lp:mb-10 full:mb-15">
                            <div
                                className="font-normal text-[#3b4a68] text-base tb:text-lg lp:text-xl full:text-2xl max-w-fit">
                                As operations grew, one thing became clear:
                            </div>
                            <h2 className="h2 font-semibold">Experience and flexibility alone are not
                                enough</h2>
                        </div>
                        <div className="flex flex-col lp:w-1/2 text-left gap-2.5 mb-6 tb:mb-8 lp:mb-10 full:mb-15">
                            <h3 className="text-[#101828] text-xl tb:text-2xl lp:text-[32px] font-medium">
                                Short-term stays reward adaptability and fast reaction
                            </h3>
                            <div className="font-normal text-black/60 text-sm tb:text-base lp:text-2xl max-w-fit">
                                But scaling living experiences — especially longer ones requires something deeper:
                                structure.
                            </div>
                        </div>
                        <div className="w-full mb-6 tb:mb-8 lp:mb-10 full:mb-11.5">
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{once: true, amount: 0.2}}
                                variants={staggerContainer}
                                className="grid grid-cols-1 lp:grid-cols-3 gap-[10px] tb:gap-[20px]"
                            >
                                {[
                                    {icon: '/icons/growth.svg', label: "Growth demands clarity"},
                                    {icon: '/icons/consistency.svg', label: "Consistency demands systems"},
                                    {icon: '/icons/family-home.svg', label: "Сomfort requires discipline"},
                                ].map((item, index) => (
                                    // Step
                                    <motion.div
                                        key={index + 10}
                                        initial={{opacity: 0, y: 50}}
                                        whileInView={{opacity: 1, y: 0}}
                                        transition={{duration: 0.6, delay: index / 10}}
                                        viewport={{once: true, amount: 0.2}}
                                        className="bg-[#F7F7F7] rounded-[14px] w-full flex tb:justify-center items-center py-[12px] lp:py-[20px] gap-2.5"
                                    >
                                        <Image
                                            src={item?.icon ?? ''}
                                            alt="Soulasia Logo White"
                                            className="aspect-[1/1] w-4 tb:w-6 lp:w-8 full:w-10"
                                            width={40}
                                            height={40}
                                            priority
                                        />
                                        <span
                                            className="font-normal text-[#101828] text-base lp:text-lg lp:text-xl full:text-[28px]">{item.label}</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                        <div className="lp:w-1/2 text-left">
                            <h2 className="h2 font-semibold mb-4">This was the moment we knew the way we operated
                                had to evolve</h2>
                        </div>
                    </div>
                </section>

                {/* Enter Blueground */}
                <section className="section-padding-y overflow-hidden bg-[#101828]">
                    <div className="container px-0 tb:px-4 mx-auto relative z-10">
                        <motion.div
                            key={1}
                            initial={{opacity: 0, y: 50}}
                            whileInView={{opacity: 1, y: 0}}
                            transition={{duration: 0.4, delay: 0.1 / 10}}
                            viewport={{once: true, amount: 0.2}}
                            className="flex flex-col lp:flex-row gap-10 tb:gap-12.5 lp:gap-5 full:gap-15 w-full">
                            <div className="lp:w-1/2 flex flex-col gap-6 tb:gap-10 full:gap-15">
                                <div className="flex flex-col gap-2.5 lp:gap-4">
                                    <h1 className="h1 text-white font-semibold mb-2">
                                        Enter Blueground:<br/>
                                        A Different Way of Thinking
                                    </h1>
                                    <div
                                        className="font-normal text-white/90 text-xl tb:text-2xl lp:text-3xl pr-4">
                                        Blueground operates globally, specialising in stays of 30 days or longer. At
                                        that level, there is no room for improvisation.
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 lp:gap-4">
                                    <div
                                        className="font-normal text-white/70 text-base tb:text-xl lp:text-2xl pr-4">
                                        Every detail — from how an apartment is furnished to how teams communicate — is
                                        clearly defined, tested, and documented in advance.
                                    </div>
                                    <div
                                        className="font-normal text-white/70 text-base tb:text-xl lp:text-2xl pr-4">
                                        Becoming Blueground’s Official Master Partner in Kuala Lumpur was not about
                                        adding another brand to our portfolio
                                    </div>
                                </div>

                                <div className="w-full bg-white/5 rounded-lg lp:rounded-xl p-5 tb:p-6 gap-5 tb:gap-7.5">
                                    <div className="flex max-w-fit items-start gap-2.5 tb:gap-5">
                                        <div className="flex flex-col gap-2 tb:gap-2.5">
                                            <h3 className="text-white font-semibold text-lg lp:text-xl full:text-2xl leading-tight">
                                                It was about adopting a different way of thinking
                                            </h3>
                                            <div
                                                className="font-normal text-white/80 text-sm tb:text-base lp:text-xl max-w-fit">
                                                A way where decisions are intentional, standards are visible, and
                                                quality is repeatable
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="lp:w-1/2 relative rounded-[10px] overflow-hidden">
                                <div className="h-full aspect-[4/3]">
                                    <Image
                                        src="/media-assets/asset11.jpg"
                                        alt="item.title"
                                        fill
                                        className="object-cover rounded-xl"
                                    />
                                    <div
                                        className="absolute inset-0 w-full h-full z-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_87.23%,#101828_111.69%)]"/>
                                </div>
                                {/* Distance badge */}
                                <Link
                                    href={partnerLink} target="_blank"
                                    className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white text-base tb:text-lg lp:text-xl full:text-2xl font-semibold inline-block w-max leading-tight px-5 py-3 tb:py-4 full:py-5 rounded-full"
                                >
                                    Смотреть доступные номера →
                                </Link>

                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* for Guests */}
                <section className="section-padding-y overflow-hidden bg-white">
                    <div className="container relative">
                        <div
                            className="grid grid-cols-1 lp:grid-cols-2 gap-2.5 lp:gap-5 mb-6 tb:mb-10 items-end justify-items-start">
                            <h2 className="h2 font-semibold text-[#101828]/60 lp:w-4/5">
                                What the Blueground{" "}
                                <span className="text-[#101828] whitespace-nowrap">
                                    Partnership Means for Guests
                                </span>
                            </h2>
                            <div
                                className="font-normal text-[#3B4A68] text-sm tb:text-base lp:text-xl full:text-2xl max-w-fit">
                                Blueground is a global operator specialising in stays of 30 days or longer, with every
                                detail — from apartment setup to service processes — clearly defined in advance
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lp:grid-cols-2 gap-2.5 lp:gap-5">
                            {[
                                {
                                    image: '/partnership/for-guest1.png',
                                    title: "Professionally Prepared",
                                    desc: "Apartments prepared according to clear, professional requirements",
                                    bgColor: '#F7F7F7',
                                    titleColor: 'text-black',
                                    descColor: 'text-black/60',
                                },
                                {
                                    image: '/partnership/for-guest2.png',
                                    title: "Consistent Quality",
                                    desc: "A consistent level of comfort, design, and furnishing",
                                    bgColor: '#ECF2FF',
                                    titleColor: 'text-black',
                                    descColor: 'text-black/60',
                                },
                                {
                                    image: '/partnership/for-guest3.png',
                                    title: "Reliable Service",
                                    desc: "A predictable, reliable service experience",
                                    bgColor: '#F7F7F7',
                                    titleColor: 'text-black',
                                    descColor: 'text-black/60',
                                },
                                {
                                    image: '/partnership/for-guest4.png',
                                    title: "Built for Living",
                                    desc: "Spaces designed for living, working, and longer stays",
                                    bgColor: '#101828',
                                    titleColor: 'text-white',
                                    descColor: 'text-white/90',
                                },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex gap-2.5 tb:gap-5",
                                        index % 2 === 0
                                            ? "flex-row-reverse"
                                            : "flex-row",

                                        // 💻 Desktop
                                        index % 4 === 0 || index % 4 === 1
                                            ? "lp:flex-row-reverse"
                                            : "lp:flex-row"
                                    )}
                                >
                                    <div className={cn(
                                        "rounded-[10px] lp:rounded-[14px] w-1/2 aspect-square p-4 tb:p-6 gap-2.5 lp:gap-5 ",
                                        `bg-[${item.bgColor}]`
                                    )}>
                                        <h3 className={`font-semibold lp:text-2xl tb:text-xl md:text-xl text-base  ${item.titleColor}`}>
                                            {item.title}
                                        </h3>
                                        <div
                                            className={`font-normal text-sm tb:text-base lp:text-xl  ${item.descColor}`}>
                                            {item.desc}
                                        </div>
                                    </div>
                                    <div
                                        className="rounded-[10px] lp:rounded-[14px] w-1/2 relative aspect-square bg-blue-500">
                                        <Image
                                            src={item.image}
                                            alt="Soulasia Guest"
                                            fill
                                            priority
                                            sizes="100vw"
                                            className="rounded-[10px] lp:rounded-[14px]  object-cover"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Behind the Scenes */}
                <section className="section-padding-y overflow-hidden bg-white">
                    <div className="container relative">
                        <div
                            className="flex flex-col gap-2.5 full:gap-5 mb-6 tb:mb-10 ">
                            <h2 className="h2 font-semibold text-[#101828] lp:w-4/5">
                                What Changed Behind the Scenes
                            </h2>
                            <div
                                className="font-normal lp:w-4/5 text-[#3B4A68] text-sm tb:text-base lp:text-xl full:text-2xl max-w-fit">
                                What guests experience as calm and comfort is, in reality, the result of structure <br/>
                                <span className="text-[#101828]">
                                    Behind the scenes, everything became sharper:
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 mb-6 tb:mb-10 tb:grid-cols-2 lp:grid-cols-4 gap-5">
                            {[
                                {
                                    icon: '/icons/furnished.svg',
                                    title: "Defined Furnishing Standards",
                                    desc: "Apartments are no longer “well furnished” — they are furnished according to precise requirements",
                                },
                                {
                                    icon: '/icons/file-copy.svg',
                                    title: "Documented Operations",
                                    desc: "Teams don’t rely on personal memory — they rely on shared documentation",
                                },
                                {
                                    icon: '/icons/renew.svg',
                                    title: "Scalable Tools",
                                    desc: "Tools are chosen for clarity and scalability, not convenience",
                                },
                                {
                                    icon: '/icons/pan-zoom.svg',
                                    title: "Systemised Processes",
                                    desc: "Processes are designed to be repeatable, not reactive",
                                },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-[#F7F7F7] flex flex-col w-full h-full full:aspect-square rounded-[14px] p-6
                                     space-y-15 tb:space-y-23 full:space-y-26"
                                >
                                    <Image
                                        src={item?.icon ?? ''}
                                        alt="icons"
                                        className="aspect-[1/1] w-7 tb:w-12 full:w-16"
                                        width={40}
                                        height={40}
                                        priority
                                    />
                                    <div className="rounded-[10px] lp:rounded-[14px] gap-2.5 lp:gap-5">
                                        <h4 className="font-semibold text-[#101828] text-xl tb:text-2xl">
                                            {item.title}
                                        </h4>
                                        <div className="font-normal text-black/60 text-base tb:text-xl">
                                            {item.desc}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div
                            className="flex flex-col text-[#181018]/60 text-[21px] tb:text-[28px] lp:text-[32px] font-normal">
                            <div>Standards became <span className="text-[#181018]">visible.</span><br/></div>
                            <div>Decisions became <span className="text-[#181018]">deliberate.</span></div>
                            <div>Operations became <span className="text-[#181018]">predictable.</span><br/></div>
                            <span className="text-lg tb:text-xl lp:text-2xl lp:ml-75">— without losing warmth</span>
                        </div>
                    </div>
                </section>


                {/* Two Ways to Stay */}
                <section className="section-padding-y overflow-hidden bg-[#F9FAFB]">
                    <div className="container relative">
                        <div className="flex flex-col lp:w-1/2 gap-2.5 lp:gap-5 mb-6 tb:mb-10 ">
                            <h2 className="h2 font-semibold text-[#101828]/60 lp:w-4/5">
                                Two Ways to Stay.<br/>
                                <span className="text-[#101828] whitespace-nowrap">
                                    One Way of Doing Things Right
                                </span>
                            </h2>
                            <div
                                className="font-normal text-[#3B4A68] text-sm tb:text-base lp:text-xl full:text-2xl max-w-fit">
                                Not all stays are the same — and they shouldn’t be treated the same
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lp:grid-cols-2 gap-5 mb-6 tb:mb-10">
                            <div
                                className="relative w-full h-full max-h-[300px] tb:max-h-[430px] lp:max-h-[590px] aspect-[4/3] lp:aspect-[1.5/1] overflow-hidden lp:rounded-[24px] tb:rounded-[16px] rounded-[12px] z-0">
                                <Image
                                    src="/partnership/way-soulasia.png"
                                    alt="soulasia"
                                    fill
                                    priority
                                    sizes="100vw"
                                    className="object-cover"
                                />
                                {/* Overlay to darken the image further */}
                                <motion.div
                                    initial={{opacity: 0, y: -30}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.8, delay: 0.2}}
                                    className="absolute inset-0 w-full h-full z-10 flex items-end justify-start p-5 full:p-8">
                                    <div className="flex flex-col justify-start">
                                        <Image
                                            src="/Brand/logo-fill.svg"
                                            alt="Soulasia"
                                            width={168}
                                            height={36}
                                            priority
                                            className="h-[30px] w-max mb-4"
                                        />
                                        <div
                                            className="text-white font-semibold text-base tb:text-xl lp:text-2xl max-w-fit mb-2 leading-none">
                                            Soulasia to focus on short-term flexible stays
                                        </div>
                                        <div
                                            className="text-white/90 font-normal text-sm tb:text-base lp:text-xl max-w-fit">
                                            Built for movement, change, and dynamic living
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                            <div
                                className="relative w-full h-full max-h-[300px] tb:max-h-[430px] lp:max-h-[590px] aspect-[4/3] lp:aspect-[1.5/1] overflow-hidden lp:rounded-[24px] tb:rounded-[16px] rounded-[12px] z-0">
                                <Image
                                    src="/partnership/way-blueground.png"
                                    alt="blueground"
                                    fill
                                    priority
                                    sizes="100vw"
                                    className="object-cover"
                                />
                                {/* Overlay to darken the image further */}
                                <motion.div
                                    initial={{opacity: 0, y: -30}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{duration: 0.8, delay: 0.2}}
                                    className="absolute inset-0 w-full h-full z-10 flex items-end justify-start p-5 full:p-8">
                                    <div className="flex flex-col justify-start">
                                        <Image
                                            src="/icons/logo-blueground.svg"
                                            alt="Soulasia"
                                            width={168}
                                            height={36}
                                            priority
                                            className="h-[22px] w-max mb-4"
                                        />
                                        <div
                                            className="text-white font-semibold text-base tb:text-xl lp:text-2xl max-w-fit mb-2 leading-none">
                                            Blueground serves mid-term living, 30+ days
                                        </div>
                                        <div
                                            className="text-white/90 font-normal text-sm tb:text-base lp:text-xl max-w-fit">
                                            Built for routine, stability, and the feeling of being truly settled
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                        <div className="flex flex-col text-[#181018]/60 text-[21px] tb:text-[28px] lp:text-[32px] font-normal">
                            <div>Different <span className="text-[#181018]">duration.</span></div>
                            <div>Different <span className="text-[#181018]">needs.</span></div>
                        </div>
                    </div>
                </section>

                {/*Partnership Matters*/}
                <section className="py-10 tb:py-15 lp:py-20 overflow-hidden ">
                    <div className="container mx-auto relative z-10">
                        <div className="flex justify-between mb-5 tb:mb-10 full:mb-15">
                            <div className="max-w-2xl text-left ">
                                <h2 className="h2 font-semibold">Why This Partnership Matters</h2>
                            </div>
                        </div>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{once: true, amount: 0.2}}
                            variants={staggerContainer}
                            className="grid grid-cols-1 lp:grid-cols-3 gap-5 tb:gap-7.5 lp:gap-5"
                        >
                            {[
                                {
                                    iconSrc: "/icons/travel-bags.svg",
                                    title: "Guests",
                                    desc: "Spaces that feel intentional  not accidental"
                                },
                                {
                                    iconSrc: "/icons/location-away.svg",
                                    title: "Owners",
                                    desc: "Properties managed through systems, not assumptions"
                                },
                                {
                                    iconSrc: "/icons/concierge-black.svg",
                                    title: "For us",
                                    desc: "Building something that can grow without losing control"
                                },
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    variants={fadeIn}
                                    className="flex flex-col max-w-fit items-start transition-transform duration-300 pr-4 w-full"
                                >
                                    <div className="flex flex-row lp:flex-col items-center lp:items-start gap-2.5 mb-2.5 lp:mb-5">
                                        <div
                                            className="flex items-center justify-start aspect-[1/1] w-[24px] tb:w-[32px] lp:w-[40px] ">
                                            <Image
                                                src={item.iconSrc}
                                                alt={item.title}
                                                width={24}
                                                height={24}
                                                className="w-full h-full"
                                            />
                                        </div>
                                        <h3 className="font-semibold text-lg lp:text-xl full:text-2xl leading-tight">
                                            {item.title}
                                        </h3>
                                    </div>
                                    <div
                                        className="font-normal text-[#606060] text-sm tb:text-base lp:text-xl max-w-fit">{item.desc}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Local operation */}
                <section className="section-padding-y overflow-hidden bg-[#101828]">
                    <div className="container px-0 tb:px-4 mx-auto relative z-10">
                        <motion.div
                            key={1}
                            initial={{opacity: 0, y: 50}}
                            whileInView={{opacity: 1, y: 0}}
                            transition={{duration: 0.4, delay: 0.1 / 10}}
                            viewport={{once: true, amount: 0.2}}
                            className="flex flex-col gap-6 tb:gap-10 full:gap-15 w-full">
                            <div className=" flex flex-col lp:flex-row gap-2.5 tb:gap-5 w-full justify-between items-start lp:items-end">
                                <h2 className="lp:w-1/2 h2 text-white font-semibold mr-auto">This partnership brought global
                                    discipline into a local operation </h2>
                                <div
                                    className="lp:w-9/24 font-normal/90 text-white text-base tb:text-xl full:text-3xl pr-4">
                                    Raised the standard of what managed living in Kuala Lumpur can be
                                </div>
                            </div>
                            <div className="relative rounded-[10px] overflow-hidden">
                                <div className="h-full aspect-[4/3] lp:aspect-[2/1] full:aspect-[5/2] lp:max-h-[700px]">
                                    <Image
                                        src="/media-assets/asset11.jpg"
                                        alt="item.title"
                                        fill
                                        className="object-cover rounded-xl"
                                    />
                                    <div
                                        className="absolute inset-0 w-full h-full z-0 bg-[#101828]/60"/>
                                </div>

                                {/* Distance badge */}
                                <Link
                                    href={partnerLink} target="_blank"
                                    className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2
                                    flex justify-center text-center text-white font-semibold inline-block leading-tight
                                    tb:w-4/5 text-xl tb:text-[26px] lp:text-[40px] full:text-[44px]  "
                                >
                                    Global standards. Local expertise. Done right.
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
        </>
    )
};
