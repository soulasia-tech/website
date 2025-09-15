"use client"

import { motion } from "framer-motion"
import Image from "next/image";
import React from "react";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}
export default function ForOwnersPage() {
  return (
    <>
      <title>Soulasia | For Property Owners</title>
      <div className="bg-white">
        <section className="section-padding-y bg-white">
          <div className="container relative">
            <div
                className="relative w-full max-h-[251px] tb:max-h-[425px] lp:max-h-[500px] aspect-[4/3] lp:aspect-[19/10] overflow-hidden lp:rounded-[24px] tb:rounded-[16px] rounded-[12px] z-0">
              <Image
                  src="/media-assets/asset6.png"
                  alt="Soulasia Guest"
                  fill
                  priority
                  quality={80}
                  sizes="100vw"
                  className="object-cover"
                  style={{objectPosition: 'center 30%'}} // adjust focus area
              />
              {/* Overlay to darken the image further */}
            </div>
            {/* Overlay (optional) */}
            <div className="lp:rounded-[24px] tb:rounded-[16px] rounded-[12px] absolute inset-0 bg-black/40"/>

            <motion.div
                initial={{opacity: 0, y: -30}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.8, delay: 0.2}}
                className="absolute inset-0 top-[20px] left-[20px] tb:top-[32px] tb:left-[32px] lp:top-[60px] lp:left-[60px]">
              <div className="space-y-2 tb:space-y-4 lp:space-y-6 w-full tb:max-w-120 lp:max-w-260  text-white flex flex-col justify-start">
                <h2 className="h2 font-semibold text-[#dfdfdf]">We will help you rent your apartment</h2>
                <div className="font-normal text-[#dfdfdf] text-sm tb:text-base lg:text-lg full:text-2xl">
                  {'We care for your property as if it were our own.'}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="section-padding-y relative overflow-hidden ">
          <div className="container mx-auto relative z-10">
            <div className="flex justify-between mb-[30px]">
              <div className="max-w-lg text-left ">
                <h2 className="h2 font-semibold mb-2">Benefits for Property Owners</h2>
              </div>
            </div>
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{once: true, amount: 0.2}}
                variants={staggerContainer}
                className="grid grid-cols-2 lg:grid-cols-3 gap-[10px] tb:gap-[20px] full:gap-y-[30px]"
            >
              {[
                {
                  iconSrc: "/icons/provenExperience.svg",
                  title: "Proven Experience",
                  desc: "Years of rental properties, we know what guests need."
                },
                {
                  iconSrc: "/icons/attentionToDetail.svg",
                  title: "Attention to Detail",
                  desc: "Cleanliness, appliance maintenance, regular servicing."
                },
                {
                  iconSrc: "/icons/transparency.svg",
                  title: "Transparency",
                  desc: "Video reports on property condition."
                },
                {
                  iconSrc: "/icons/peaceOfMind.svg",
                  title: "Peace of Mind",
                  desc: "Handle property repairs and maintenance."
                },
                {
                  iconSrc: "/icons/onTimePayments.svg",
                  title: "On-Time Payments",
                  desc: "Automated on-time payouts."
                },
                {
                  iconSrc: "/icons/liabilityInsurance.svg",
                  title: "Liability Insurance",
                  desc: "Additional protection for unforeseen incidents."
                },
              ].map((item, index) => (
                  <motion.div
                      key={index}
                      variants={fadeIn}
                      className="flex flex-col items-start transition-transform duration-300 pr-4 w-full"
                  >
                    <div className="max-w-fit">
                      <div
                          className="mb-2 flex items-center justify-start aspect-[1/1] w-[28px] tb:w-[32px] lp:w-[40px] ">
                        <Image
                            src={item.iconSrc}
                            alt={item.title}
                            width={24}
                            height={24}
                            className="w-full h-full"
                        />
                      </div>
                      <h3 className="font-semibold mb-2 text-lg lp:text-xl full:text-2xl lp:mb-4 leading-tight">
                        {item.title}
                      </h3>
                      <div
                          className="font-normal text-[#606060] text-sm tb:text-base lp:text-xl max-w-fit">{item.desc}</div>
                    </div>
                  </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="section-padding-y bg-[#F9FAFB] relative overflow-hidden">
          <div className="container">
            <div className="flex flex-col lp:flex-row gap-5 tb:gap-8">
              <div className="lp:w-1/2 text-left">
                <h2 className="h2 font-semibold mb-4">How It Works</h2>
                <div
                    className="font-normal text-[#3b4a68] text-base tb:text-lg lp:text-xl full:text-2xl mb-4 max-w-fit">
                  We will help you at all stages.
                </div>
              </div>
              <div className="lp:w-1/2">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{once: true, amount: 0.2}}
                    variants={staggerContainer}
                    className="flex flex-col gap-[10px] tb:gap-[20px] lp:gap-[30px]"
                >
                  {[
                    {
                      step: "01",
                      title: "Easy Onboarding",
                      desc: "Years of rental expertise, we know what guests need."
                    },
                    {
                      step: "02",
                      title: "Tenant Management & Maintenance",
                      desc: "We handle guest questions, ensure regular technical servicing, and keep everything in perfect condition."
                    },
                    {
                      step: "03",
                      title: "Guaranteed Payouts",
                      desc: "We ensure on-time and full payments on time, every time."
                    },
                  ].map((item, index) => (
                      // Step
                      <motion.div
                          key={index + 10}
                          initial={{opacity: 0, y: 50}}
                          whileInView={{opacity: 1, y: 0}}
                          transition={{duration: 0.6, delay: index / 10}}
                          viewport={{once: true, amount: 0.2}}
                          className="bg-[#ffffff] rounded-[14px] w-full shadow-md flex flex-col lp:p-[24px] tb:p-[20px] p-[15px]"
                      >
                        <div
                            className="aspect-[1/1] w-[28px] tb:w-[32px] lp:w-[40px] border border-[#DEE3ED] rounded-lg flex items-center justify-center">
                          <div
                              className="text-xs tb:text-sm lp:text-[20px] font-medium text-[#4A4F5B]">{item.step}</div>
                        </div>
                        <h3 className="h3 text-[#101828] mt-[24px] font-semibold">{item.title}</h3>
                        <div
                            className="font-normal text-[#606060] text-sm tb:text-base lp:text-xl max-w-fit">{item.desc}</div>
                      </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="section-padding-y bg-white">
          <div className="container">
            <div className="grid grid-cols-1 lp:grid-cols-2 gap-5 bg-[#141826] text-white shadow-xl
                p-[20px] tb:p-[40px] lp:p-[50px] full:p-[60px]
                rounded-xl tb:rounded-2xl lp:rounded-3xl ">
              <motion.div
                  initial={{opacity: 0, x: -30}}
                  whileInView={{opacity: 1, x: 0}}
                  transition={{duration: 0.8}}
                  viewport={{once: true, amount: 0.2}}
                  className="flex flex-col justify-start text-left gap-2 lp:gap-4 max-w-fit"
              >
                <h2 className="h2 font-semibold drop-shadow-lg leading-tight">
                  We will help you rent your apartment
                </h2>
                <div className="text-[#dfdfdf] drop-shadow-md font-normal text-base tb:text-lg lp:text-xl full:text-2xl mb-4 max-w-70 tb:max-w-120">
                  We care for your property as if it were our own.
                </div>
              </motion.div>
              <motion.div
                  initial={{opacity: 0, y: 30}}
                  whileInView={{opacity: 1, y: 0}}
                  transition={{duration: 0.8}}
                  viewport={{once: true, amount: 0.2}}
                  className="flex lp:justify-end w-full"
              >
                <form className="mx-auto lp:mx-0 space-y-6 w-full lp:max-w-[550px]">
                  <div>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Name"
                        className="w-full bg-transparent text-white placeholder-gray-400 border-b border-gray-600 py-2 px-0 focus:border-[#0E3599] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="Phone Number"
                        className="w-full bg-transparent text-white placeholder-gray-400 border-b border-gray-600 py-2 px-0 focus:border-[#0E3599] focus:outline-none transition-colors"
                    />
                  </div>
                  <button
                      type="submit"
                      className="w-full bg-[#0E3599] text-white font-semibold py-3 rounded-lg hover:bg-[#102e7a] transition-colors focus:ring-2 focus:ring-[#0E3599] focus:ring-offset-2 focus:ring-offset-gray-900"
                  >
                    Search
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
