import type {Metadata} from 'next';
import SignUpForm from '@/components/auth/SignUpForm';
import {Suspense} from 'react';

export const metadata: Metadata = {
    title: 'Soulasia | Sign Up',
    robots: {index: false, follow: false},
};

export default function SignUpPage() {
    return (
        <>
            <div className="min-h-screen flex items-center justify-center p-4">
                <Suspense fallback={<div>Loading...</div>}>
                    <SignUpForm/>
                </Suspense>
            </div>
        </>
    );
} 
