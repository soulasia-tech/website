import type {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Soulasia | For Partnership',
    description: 'Partner with Soulasia for premium short-term rental management in KLCC, Kuala Lumpur.',
};

export default function Layout({children}: {children: React.ReactNode}) {
    return <>{children}</>;
}
