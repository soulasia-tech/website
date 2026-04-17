import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const domain = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://website-six-omega-16.vercel.app'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/auth/',
                    '/booking/',
                    '/confirmation/',
                    '/my-bookings/',
                ],
            },
        ],
        sitemap: `${domain}/sitemap.xml`,
    }
}
