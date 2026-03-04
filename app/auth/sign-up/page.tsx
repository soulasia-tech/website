import SignUpForm from '@/components/auth/SignUpForm';
import {Suspense} from 'react';

export default function SignUpPage() {
    return (
        <>
            <title>Soulasia | Sign Up</title>
            <div className="min-h-screen flex items-center justify-center p-4">
                <Suspense fallback={<div>Loading...</div>}>
                    <SignUpForm/>
                </Suspense>
            </div>
        </>
    );
} 
