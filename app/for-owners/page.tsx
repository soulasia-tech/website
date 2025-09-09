"use client"

import { motion } from "framer-motion"
import Link from "next/link"

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
        <div className="flex flex-col bg-gray-50">
          <main className="flex-1">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-[60px] pb-[50px] bg-white flex items-center">
              {/* Updated container to match the 1240px width for large screens with 100px padding */}
              <div className="container mx-auto relative z-10">
                <div className="relative w-full overflow-hidden rounded-[24px]">
                  <div
                      // Changed image width to w-full to make it responsive
                      className="w-full h-[500px] bg-cover bg-center mx-auto"
                      style={{
                        backgroundImage: "url('/media-assets/asset6.png')",
                      }}
                  />
                  <div className="absolute inset-0 bg-black/50" />
                </div>
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    // Updated positioning and width to match Figma
                    className="absolute top-[60px] left-[75px] w-[679px] text-left"
                >
                  <h1 className="text-[48px] font-semibold mb-4 text-white drop-shadow-lg leading-tight" >
                    We will help you rent your apartment
                  </h1>
                  <p className="mt-[20px]  text-[24px] font-normal ml-3 max-w-2xl mx-auto md:mx-0 drop-shadow-md" style={{ color: '#fff', fontFamily: 'Manrope, sans-serif' }}>
                    We care for your property as if it were our own.
                  </p>
                </motion.div>
              </div>
            </section>

            {/* Benefits Section */}
            <section className="pt-[50px] pb-[80px] bg-white relative overflow-hidden">
              <div className="container mx-auto">
                <div className="text-left mb-12 lp:mb-16">
                  <h2 className="text-[48px] font-semibold mb-4" >Benefits for Property Owners</h2>
                </div>
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={staggerContainer}
                    className="mt-[60px] grid grid-cols-1 lp:grid-cols-2 lg:grid-cols-3 gap-x-[20px] gap-y-[30px]"
                >
                  {[
                    { iconSrc: "/icons/provenExperience.svg", title: "Proven Experience", desc: "Years of rental properties, we know what guests need." },
                    { iconSrc: "/icons/attentionToDetail.svg", title: "Attention to Detail", desc: "Cleanliness, appliance maintenance, regular servicing." },
                    { iconSrc: "/icons/transparency.svg", title: "Transparency", desc: "Video reports on property condition." },
                    { iconSrc: "/icons/peaceOfMind.svg", title: "Peace of Mind", desc: "Handle property repairs and maintenance." },
                    { iconSrc: "/icons/onTimePayments.svg", title: "On-Time Payments", desc: "Automated on-time payouts." },
                    { iconSrc: "/icons/liabilityInsurance.svg", title: "Liability Insurance", desc: "Additional protection for unforeseen incidents." },
                  ].map((item, index) => (
                      <motion.div
                          key={index}
                          variants={fadeIn}
                          className="bg-white flex flex-col items-start transition-transform duration-300 w-full lg:w-[493px] h-[124px]"
                      >
                        <div className="mb-2 flex items-center justify-start w-[40px] h-[40px]">
                          <img src={item.iconSrc} alt={item.title} className="w-full h-full" />
                        </div>
                        <h3 className="text-[24px] font-semibold mb-[16px]">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm lp:text-base">{item.desc}</p>
                      </motion.div>
                  ))}
                </motion.div>
              </div>
            </section>

            {/* How It Works Section */}
            <section className="pt-[100px] pb-[100px] bg-[#F9FAFB] relative overflow-hidden">
              <div className="container mx-auto">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="lp:w-1/2 text-left mb-8 lp:mb-0">
                    <h2 className="text-[48px] font-semibold mb-4">How It Works</h2>
                    <p className="mt-[24px] text-[24px] font-normal">We will help you at all stages.</p>
                  </div>
                  <div className="lp:w-1/2">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={staggerContainer}
                        className="flex flex-col gap-[30px]"
                    >
                      {/* Step 1 */}
                      <motion.div
                          initial={{ opacity: 0, y: 50 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                          viewport={{ once: true, amount: 0.2 }}
                          className="bg-[#ffffff] text-[#101828] rounded-[14px] w-full h-[180px] shadow-md flex flex-col pt-[24px] pl-[24px]"
                      >
                        <div className="w-[40px] h-[40px] border border-[#DEE3ED] rounded-lg flex items-center justify-center">
                          <div className="text-[20px] font-medium text-[#4A4F5B]" >01</div>
                        </div>
                        <h3 className="mt-[24px] text-[24px] font-semibold" >Easy Onboarding</h3>
                        <p className="mt-[8px] text-[20px] font-normal text-[#606060]" >
                          Years of rental expertise, we know what guests need.
                        </p>
                      </motion.div>
                      {/* Step 2 */}
                      <motion.div
                          initial={{ opacity: 0, y: 50 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.2 }}
                          viewport={{ once: true, amount: 0.2 }}
                          className="bg-[#ffffff] text-[#101828] rounded-[14px] w-full  h-[207px] shadow-md flex flex-col pt-[24px] pl-[24px]"
                      >
                        <div className="w-[40px] h-[40px] border border-[#DEE3ED] rounded-lg flex items-center justify-center">
                          <div className="text-[20px] font-medium text-[#4A4F5B]" >02</div>
                        </div>
                        <h3 className="mt-[24px] text-[24px] font-semibold" >Tenant Management & Maintenance</h3>
                        <p className="mt-[8px] text-[20px] font-normal text-[#606060]" >
                          We handle guest questions, ensure regular technical servicing, and keep everything in perfect condition.
                        </p>
                      </motion.div>
                      {/* Step 3 */}
                      <motion.div
                          initial={{ opacity: 0, y: 50 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.3 }}
                          viewport={{ once: true, amount: 0.2 }}
                          className="bg-[#ffffff] text-[#101828] rounded-[14px] w-full h-[180px] shadow-md flex flex-col pt-[24px] pl-[24px]"
                      >
                        <div className="w-[40px] h-[40px] border border-[#DEE3ED] rounded-lg flex items-center justify-center">
                          <div className="text-[20px] font-medium text-[#4A4F5B]" >03</div>
                        </div>
                        <h3 className="mt-[24px] text-[24px] font-semibold" >Guaranteed Payouts</h3>
                        <p className="mt-[8px] text-[20px] font-normal text-[#606060]" >
                          We ensure on-time and full payments on time, every time.
                        </p>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Form Section */}
            <section className="py-[100px] bg-white text-gray-900">
              <div className="container mx-auto">
                {/* Updated container to match the 1240px width for large screens with 100px padding */}
                <div className="flex flex-col lp:flex-row items-center justify-between bg-[#141826] text-white px-[60px] py-8 rounded-2xl shadow-xl">
                  <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8 }}
                      viewport={{ once: true, amount: 0.2 }}
                      className="flex flex-col justify-start text-left h-[165px]"
                  >
                    <h2 className="text-[48px] font-semibold mb-[20px] drop-shadow-lg leading-tight" >
                      We will help you rent your apartment
                    </h2>
                    <p className="text-[24px] font-normal drop-shadow-md" >
                      We care for your property as if it were our own.
                    </p>
                  </motion.div>
                  <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      viewport={{ once: true, amount: 0.2 }}
                      className="w-[556px] h-[232px] mt-8 md:mt-0"
                  >
                    <form className="space-y-6">
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
          </main>
        </div>
      </>
  );
}
