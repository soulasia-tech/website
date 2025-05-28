import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function SustainabilityPage() {
  return (
    <>
      <title>Soulasia | Sustainability</title>
      <main className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6">Sustainable living in Malaysia</h1>
        <p className="mb-8 text-gray-700">
          At Soulasia, our commitment to sustainability is woven into every aspect of our operations.
        </p>
        <section className="space-y-6 mb-10">
          <p>
            We power most of our locations with sustainable energy, supporting our goal of sustainable living in Malaysia. Our cleaning and laundry processes use eco-friendly chemicals, minimizing our environmental impact. Every unit is equipped with water-saving showerheads and smart-timed water heaters, helping reduce water and energy waste. We&apos;ve removed plastic entirely, offering Coway water filters instead of bottled water to ensure a plastic-free, eco-friendly stay. This holistic approach demonstrates our commitment to a more sustainable future for all guests.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Sustainable Energy.</h2>
          <p>
            We power all our apartments with low-carbon electricity through TNB&apos;s Green Electricity Tariff (GET) Programme. This initiative allows us to utilize energy from solar power plants and hydropower stations, significantly reducing our carbon footprint.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Eco-Friendly Cleaning Practices.</h2>
          <p>
            We prioritize green living by using sustainable chemicals in our laundry and cleaning routines. Even our air conditioning systems are maintained with eco friendly products, ensuring both efficiency and environmental responsibility.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Water Conservation.</h2>
          <p>
            Water conservation is crucial to us. All our apartments are equipped with water-saving showerheads, which reduce water wastage while maintaining comfort. Additionally, our water heaters feature smart timers that automatically switch off after 20 minutes, significantly cutting down on energy consumption.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Plastic-Free Commitment.</h2>
          <p>
            We are committed to eliminating plastic waste in our apartments. Instead of bottled water, we provide Coway or Cuckoo water filters. These globally recognized brands offer high-quality, eco-friendly water solutions. This simple switch makes a big difference in reducing plastic waste and promoting <strong>sustainable living in Malaysia</strong>.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Paperless Operations.</h2>
          <p>
            In line with our sustainability goals, we have minimized our paper usage by going paperless with all our billing processes. This not only reduces waste but also supports our broader environmental initiatives.
          </p>
        </section>
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">FAQ</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How does Soulasia reduce energy consumption?</AccordionTrigger>
              <AccordionContent>
                Soulasia powers most of its apartments through sustainable energy sources under the TNB&apos;s Green Electricity Tariff (GET) Program. We also use energy-efficient appliances like smart-timed water heaters and LED lighting to reduce unnecessary energy consumption.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What waste management practices are in place?</AccordionTrigger>
              <AccordionContent>
                We are committed to minimizing waste by eliminating single-use plastics and offering guests alternatives like Coway or Cuckoo water filters instead of plastic bottles. Additionally, all billing is paperless to reduce paper waste.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Does Soulasia have a plastic-free commitment?</AccordionTrigger>
              <AccordionContent>
                Yes, we&apos;ve eliminated plastic usage in our apartments, replacing bottled water with Coway water filters. This ensures we contribute to the reduction of plastic waste, aligning with global efforts to combat pollution.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Does Soulasia use eco-friendly cleaning products?</AccordionTrigger>
              <AccordionContent>
                Yes, we use sustainable, eco-friendly chemicals for cleaning, laundry, and air conditioning maintenance, ensuring a minimal environmental impact.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>How does Soulasia conserve water?</AccordionTrigger>
              <AccordionContent>
                Our water-saving showerheads and smart-timed water heaters drastically reduce water wastage. We also encourage linen and towel reuse during guest stays to further minimize water usage.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger>What sustainable sourcing practices do you have?</AccordionTrigger>
              <AccordionContent>
                Soulasia prioritizes the use of sustainable products, including eco-friendly detergents, cleaning chemicals, and materials that minimize environmental harm.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>
    </>
  );
} 