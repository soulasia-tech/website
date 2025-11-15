"use client";

import { Card } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <>
      <title>Soulasia | Privacy Policy</title>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
            <div className="space-y-6">
              <section>
                <p className="text-gray-600">This Privacy Policy explains how Soulasia Management Sdn. Bhd. (“Soulasia”, “we”, “us”, or “our”) collects, uses, discloses, and protects your personal data when you visit our websites, make a booking, stay at one of our properties, or otherwise interact with us. We are committed to handling your personal data in accordance with the Personal Data Protection Act 2010 (PDPA) of Malaysia and other applicable laws. By using our services or providing your personal data to us, you acknowledge that you have read and understood this Privacy Policy.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
                <p className="text-gray-600">When you visit our website, we may collect certain information about your device, your interaction with the site, and information necessary to process your requests. We do not share your personal information with third parties except as necessary to provide our services or as required by law.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold mb-3">3. Changes to This Policy</h2>
                <p className="text-gray-600">This privacy policy is subject to change. Please review it periodically for updates.</p>
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
