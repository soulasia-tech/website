import type {MetadataRoute} from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Soulasia — Short Term Apartments in KLCC',
        short_name: 'Soulasia',
        description: 'Stay in fully furnished short term rental apartments in KLCC, Kuala Lumpur.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0E3599',
        icons: [
            {
                src: '/Brand/apple-touch-icon.png',
                sizes: '180x180',
                type: 'image/png',
            },
            {
                src: '/Brand/favicon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
        ],
    };
}
