import SignInForm from '@/components/auth/SignInForm';
import {Suspense} from 'react';

export default function SignInPage() {
    return (
        <>
            <title>Soulasia | Sign In</title>
            <div className="min-h-screen flex items-center justify-center p-4">
                <Suspense fallback={<div>Loading...</div>}>
                    <SignInForm/>
                </Suspense>
            </div>
        </>
    );
} 
