'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from 'next/link';
import Image from 'next/image';

function SignUpFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: searchParams.get('email') || '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    document.title = 'Soulasia | Sign Up';
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Validate password length
      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Create new user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      // Log the error object for debugging
      if (signUpError) {
        console.error('signUpError object:', signUpError, JSON.stringify(signUpError));
        // Only throw if error is not an empty object or has a message
        if (signUpError.message || Object.keys(signUpError).length > 0) {
          throw signUpError;
        }
      }

      // Do NOT throw if authData.user is null; this is expected with email verification enabled
      if (!authData.user) {
        // Optionally log a warning for debugging
        console.warn('Signup succeeded, but user is null (likely due to email verification).');
      }

      // Create user profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .upsert([{
            id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email
          }]);

        // Log the error object for debugging
        if (profileError) {
          console.error('profileError object:', profileError, JSON.stringify(profileError));
          if (profileError.message || Object.keys(profileError).length > 0) {
            throw profileError;
          }
        }
      }

      // Check for guest booking to link
      if (typeof window !== 'undefined') {
        const lastBookingId = sessionStorage.getItem('lastBookingId');
        if (lastBookingId) {
          // Link the booking to the new user
          if (authData.user) {
            const { error: linkError } = await supabase
              .from('bookings')
              .update({ user_id: authData.user.id })
              .eq('id', lastBookingId)
              .eq('guest_email', formData.email); // Extra safety check

            // Log the error object for debugging
            if (linkError) {
              console.error('Failed to link booking:', linkError, JSON.stringify(linkError));
              // Don't throw here - we still want to complete signup
            } else {
              // Clear the session storage only on successful linking
              sessionStorage.removeItem('lastBookingId');
            }
          }
        }
      }

      // Redirect to verification page or the page they came from
      const redirectTo = searchParams.get('redirect');
      router.push(redirectTo || '/auth/verify-email');

    } catch (error) {
      // Log the error object for debugging
      console.error('Signup error (catch):', error, typeof error, JSON.stringify(error));
      // Check for duplicate user errors from Supabase Auth or Postgres
      let errorMessage = 'Failed to create account';
      if (error && typeof error === 'object') {
        const errStr = JSON.stringify(error);
        // Type guard for 'message' property
        const hasMessage = Object.prototype.hasOwnProperty.call(error, 'message');
        const message = hasMessage ? (error as { message: string }).message : '';
        if (message === 'Passwords do not match' || message === 'Password must be at least 6 characters long') {
          errorMessage = message;
        } else if (
          (message &&
            (message.toLowerCase().includes('user already registered') ||
             message.toLowerCase().includes('user already exists') ||
             message.toLowerCase().includes('email already registered') ||
             message.toLowerCase().includes('duplicate')))
          || (errStr.includes('duplicate key value') || errStr.includes('23505'))
        ) {
          errorMessage = 'This user already exists – log in';
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 flex flex-col items-center justify-center">
      <Image src="/Brand/logo.svg" alt="Soulasia Logo" width={120} height={32} className="mx-auto mb-8" />
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto p-8 rounded-2xl shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <Input
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <Input
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <Input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                minLength={6}
              />
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full text-white"
              style={{ backgroundColor: '#0E3599', border: 'none' }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = '#102e7a')}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = '#0E3599')}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>

            <p className="text-sm text-gray-500 text-center mt-4">
              Already have an account?{' '}
              <Link 
                href={`/auth/sign-in${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`}
                className="text-blue-700 underline font-medium hover:text-blue-900 transition"
              >
                Sign in
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}

// Export a wrapped version of the form
export default function SignUpForm() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-12">
          <div className="container mx-auto px-4">
            <Card className="max-w-md mx-auto p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          </div>
        </div>
      }
    >
      <SignUpFormContent />
    </Suspense>
  );
} 
