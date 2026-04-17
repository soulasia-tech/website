import type {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Soulasia | Refund Policy',
    description: "Soulasia's Refund Policy — learn about cancellations and refunds for short-term apartment stays.",
};

export default function Layout({children}: {children: React.ReactNode}) {
    return <>{children}</>;
}
