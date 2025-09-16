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
                <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                <p className="text-gray-600">This is a sample privacy policy. Your privacy is important to us. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.</p>
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
