import type {Metadata} from 'next';
import SignInForm from '@/components/auth/SignInForm';
import {Suspense} from 'react';

export const metadata: Metadata = {
    title: 'Soulasia | Sign In',
    robots: {index: false, follow: false},
};

export default function SignInPage() {
    return (
        <>
            <div className="min-h-screen flex items-center justify-center p-4">
                <Suspense fallback={<div>Loading...</div>}>
                    <SignInForm/>
                </Suspense>
            </div>
        </>
    );
} 
