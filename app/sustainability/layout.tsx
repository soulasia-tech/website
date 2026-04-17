import type {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Soulasia | Sustainability',
    description: "Discover Soulasia's commitment to sustainable short-term rentals in Kuala Lumpur's KLCC district.",
};

export default function Layout({children}: {children: React.ReactNode}) {
    return <>{children}</>;
}
