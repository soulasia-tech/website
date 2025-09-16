'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import React from 'react';
import Image from 'next/image';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Check for success message in URL
    const params = searchParams;
    if (!params) return;
    
    const message = params.get('message');
    if (message) {
      setSuccess(message);
    }
  }, [searchParams]);

  React.useEffect(() => {
    document.title = 'Soulasia | Sign In';
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        router.push('/'); // Redirect to home page after successful login
        router.refresh(); // Refresh the page to update auth state
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 flex flex-col items-center justify-center">
      <Image src="/Brand/logo.svg" alt="Soulasia Logo" width={120} height={32} className="mx-auto mb-8" />
      <div className="container mx-auto px-4">
        <Card className="max-w-md w-full mx-auto p-8 rounded-2xl shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
          <form onSubmit={handleSignIn} className="space-y-4">
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <Button 
              type="submit"
              className="w-full h-12 text-white"
              style={{ backgroundColor: '#0E3599', border: 'none' }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = '#102e7a')}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = '#0E3599')}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-sm text-gray-500 text-center mt-4">
              Don&apos;t have an account?{' '}
              <a href="/auth/sign-up" className="text-blue-700 underline font-medium hover:text-blue-900 transition">Create one</a>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
} 
