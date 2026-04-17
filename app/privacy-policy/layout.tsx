import type {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Soulasia | Privacy Policy',
    description: "Soulasia's Privacy Policy — how we collect, use, and protect your personal data.",
};

export default function Layout({children}: {children: React.ReactNode}) {
    return <>{children}</>;
}
