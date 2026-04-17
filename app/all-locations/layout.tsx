import type {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Soulasia | All Locations',
    description: 'Browse all Soulasia serviced apartment locations across KLCC and Kuala Lumpur city centre.',
};

export default function Layout({children}: {children: React.ReactNode}) {
    return <>{children}</>;
}
