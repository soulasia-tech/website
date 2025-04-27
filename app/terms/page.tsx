'use client';

import { Card } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing and using the Soulasia website and services, you accept and agree to be bound by the terms
                and conditions outlined here. These terms apply to all visitors, users, and others who access or use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Booking and Reservations</h2>
              <p className="text-gray-600">
                All bookings are subject to availability and confirmation. A booking is only confirmed after receiving
                a confirmation email from Soulasia. The guest making the booking must be at least 18 years of age.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Check-in and Check-out</h2>
              <p className="text-gray-600">
                Standard check-in time is from 3:00 PM, and check-out time is by 12:00 PM. Early check-in and late
                check-out may be available upon request but cannot be guaranteed.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Payment Terms</h2>
              <p className="text-gray-600">
                Full payment is required at the time of booking. We accept major credit cards and other payment methods
                as specified during the booking process. All rates are in Malaysian Ringgit (MYR).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Guest Responsibilities</h2>
              <p className="text-gray-600">
                Guests are responsible for maintaining the property in good condition and reporting any damages.
                Smoking is strictly prohibited in all apartments. Guests must comply with building regulations and
                respect other residents.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Liability</h2>
              <p className="text-gray-600">
                Soulasia Management Sdn. Bhd. is not liable for any loss, damage, or injury to guests or their
                belongings during their stay. Guests are advised to have appropriate travel insurance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Privacy Policy</h2>
              <p className="text-gray-600">
                We collect and process personal information in accordance with our Privacy Policy. By using our
                services, you consent to such processing and warrant that all data provided is accurate.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Modifications</h2>
              <p className="text-gray-600">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon
                posting on the website. Continued use of our services constitutes acceptance of modified terms.
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
  );
} 