import type {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Soulasia | For Property Owners',
    description: 'Earn more from your KLCC apartment. List with Soulasia for professional short-term rental management in Kuala Lumpur.',
};

export default function Layout({children}: {children: React.ReactNode}) {
    return <>{children}</>;
}
