import type {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Soulasia | Search Results',
    robots: {index: false, follow: false},
};

export default function Layout({children}: {children: React.ReactNode}) {
    return <>{children}</>;
}
