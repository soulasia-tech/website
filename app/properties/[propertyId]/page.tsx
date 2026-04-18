import type {Metadata} from 'next';
import PropertyPageClient from './PropertyPageClient';

const domain = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://website-six-omega-16.vercel.app';

const propertyMeta: Record<string, { name: string; desc: string; ogImage: string }> = {
    '270917': {
        name: 'Scarletz KLCC Apartments',
        desc: 'Scarletz KLCC Apartments by Soulasia — modern interiors, rooftop pool, gym, and 44th-floor co-working space steps from the KLCC Business District in Kuala Lumpur.',
        ogImage: '/properties/Scarletz/1.jpg',
    },
    '19928': {
        name: 'Vortex KLCC Apartments',
        desc: 'Vortex KLCC by Soulasia — modern family-friendly apartments 600m from Twin Towers with rooftop pool, gym, and stunning KL skyline views.',
        ogImage: '/properties/Vortex/1.jpg',
    },
    '318151': {
        name: '188 Suites KLCC',
        desc: '188 Suites by Soulasia — spacious apartments in a former 5-star building with rooftop pool, gym, and free parking near KL city centre.',
        ogImage: '/properties/188/3.jpg',
    },
    '318256': {
        name: 'Opus Residences',
        desc: 'Opus Residences by Soulasia — modern city apartments with Menara 118 panoramic views, rooftop pool, gym, and easy access to KL City Center.',
        ogImage: '/properties/Opus/1.jpg',
    },
};

export async function generateMetadata(
    {params}: {params: Promise<{propertyId: string}>}
): Promise<Metadata> {
    const {propertyId} = await params;
    const meta = propertyMeta[propertyId];
    if (!meta) return {title: 'Soulasia | Property'};

    return {
        title: `${meta.name} | Soulasia`,
        description: meta.desc,
        alternates: {canonical: `${domain}/properties/${propertyId}`},
        openGraph: {
            title: `${meta.name} | Soulasia`,
            description: meta.desc,
            url: `${domain}/properties/${propertyId}`,
            siteName: 'Soulasia',
            images: [{url: `${domain}${meta.ogImage}`, width: 1200, height: 900}],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${meta.name} | Soulasia`,
            description: meta.desc,
            images: [`${domain}${meta.ogImage}`],
        },
    };
}

export default function PropertyPage() {
    return <PropertyPageClient />;
}
