import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const domain = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://website-six-omega-16.vercel.app';
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: domain,                          lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
        { url: `${domain}/all-locations`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
        { url: `${domain}/sustainability`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${domain}/partnership`,         lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${domain}/for-owners`,          lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${domain}/contact-us`,          lastModified: now, changeFrequency: 'yearly',  priority: 0.6 },
        { url: `${domain}/privacy-policy`,      lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
        { url: `${domain}/refund-policy`,       lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
        { url: `${domain}/terms`,               lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    ];

    const propertyRoutes: MetadataRoute.Sitemap = [
        '270917',
        '19928',
        '318151',
        '318256',
    ].map((propertyId) => ({
        url: `${domain}/properties/${propertyId}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [...staticRoutes, ...propertyRoutes];
}
