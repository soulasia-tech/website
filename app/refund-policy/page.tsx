'use client';

import { Card } from "@/components/ui/card";

export default function RefundPolicyPage() {
  return (
    <>
      <title>Soulasia | Refund Policy</title>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Refund Policy</h1>
            
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Cancellation Timeframes</h2>
                <div className="space-y-3 text-gray-600">
                  <p>Our refund policy is based on the following cancellation timeframes:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>More than 7 days before check-in: Full refund minus processing fees</li>
                    <li>3-7 days before check-in: 50% refund</li>
                    <li>Less than 3 days before check-in: No refund</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Processing Time</h2>
                <p className="text-gray-600">
                  Refunds will be processed within 5-10 business days after approval. The time taken for the refund
                  to reflect in your account may vary depending on your payment method and financial institution.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Processing Fees</h2>
                <p className="text-gray-600">
                  A processing fee of 3% of the total booking amount applies to all refunds to cover transaction
                  costs. This fee is non-refundable regardless of the cancellation timeframe.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Special Circumstances</h2>
                <p className="text-gray-600">
                  In cases of unexpected events such as natural disasters, medical emergencies (with proper
                  documentation), or other extraordinary circumstances, we may consider full refunds on a
                  case-by-case basis.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. No-Show Policy</h2>
                <p className="text-gray-600">
                  If you fail to check in on your scheduled arrival date without prior notice, this will be
                  treated as a no-show and no refund will be provided.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Early Departure</h2>
                <p className="text-gray-600">
                  No refunds will be provided for early departure or unused nights once you have checked in.
                  We recommend ensuring your travel plans are finalized before making a booking.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Refund Method</h2>
                <p className="text-gray-600">
                  Refunds will be issued to the original payment method used for the booking. We cannot
                  process refunds to a different payment method or account.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Contact Information</h2>
                <p className="text-gray-600">
                  For any questions about our refund policy or to request a refund, please contact our
                  customer service team at info@soulasia.com.my or call +603 2181175.
                </p>
              </section>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
} 
