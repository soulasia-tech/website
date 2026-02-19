import type { MetadataRoute } from 'next'



export default function sitemap(): MetadataRoute.Sitemap {
    const domain = process.env.NEXT_PUBLIC_BASE_URL;
    if (!domain) {
        return [];
    }

    return [
        { url: domain },
        { url: `${domain}/sustainability`},
        { url: `${domain}/partnership`},
        { url: `${domain}/for-owners`},
        { url: `${domain}/properties/270917`},
        { url: `${domain}/properties/19928`},
        { url: `${domain}/properties/318151`},
        { url: `${domain}/properties/318256`},
    ]
}
