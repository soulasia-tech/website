import type {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Soulasia | Terms and Conditions',
    description: "Soulasia's Terms and Conditions for short-term apartment rentals in Kuala Lumpur.",
};

export default function Layout({children}: {children: React.ReactNode}) {
    return <>{children}</>;
}
