'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto bg-white rounded-xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold mb-4">Check Your Email</h1>
          
          <p className="text-gray-600 mb-6">
            We&apos;ve sent you an email with a link to verify your account. Please check your inbox and click the link to complete your registration.
          </p>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Didn&apos;t receive the email? Check your spam folder or try signing in again to resend the verification email.
            </p>

            <div className="flex justify-between">
              <Link href="/auth/sign-in">
                <Button variant="outline">Sign In</Button>
              </Link>
              
              <Link href="/">
                <Button variant="outline">Return Home</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 