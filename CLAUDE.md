# Soulasia Website

Next.js 16 / React 19 short-term rental website for KLCC, Kuala Lumpur.

## Stack
- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS
- **Auth:** Supabase
- **Booking:** Cloudbeds API
- **Payment:** BillPlz
- **Deployment:** Vercel

## Key Conventions

### Metadata
- Server component pages export `export const metadata` directly
- Client component pages have a co-located `layout.tsx` that exports `metadata`
- Private/user pages (booking, confirmation, my-bookings, auth) use `robots: { index: false }`
- Property pages use `generateMetadata()` in `app/properties/[propertyId]/page.tsx`

### Property Pages
The property page is split into two files:
- `app/properties/[propertyId]/page.tsx` — server component, handles `generateMetadata()` and BreadcrumbList JSON-LD
- `app/properties/[propertyId]/PropertyPageClient.tsx` — client component, all UI and booking logic

Static property data (names, descriptions, images, coordinates) lives in:
- `propertyMeta` in `page.tsx` — SEO metadata + OG images
- `propertyLocationMap` + `propertyImagesMap` in `PropertyPageClient.tsx` — UI rendering
- `propertiesSaved` in `lib/context.tsx` — full property data (amenities, descriptions, etc.)

### Adding a New Property
See the full SOP — in short, update these 4 files + upload images + request indexing:
1. `app/properties/[propertyId]/page.tsx` — add to `propertyMeta`
2. `app/properties/[propertyId]/PropertyPageClient.tsx` — add to `propertyLocationMap` and `propertyImagesMap`
3. `app/sitemap.ts` — add property ID to the array
4. `lib/context.tsx` — add full property data to `propertiesSaved`

## SEO Setup
- `app/robots.ts` — blocks `/api`, `/auth`, `/booking`, `/confirmation`, `/my-bookings`
- `app/sitemap.ts` — all public routes with priority and changeFrequency
- `app/manifest.ts` — PWA manifest, theme colour `#0E3599`
- JSON-LD schemas: Organization (layout), LodgingBusiness + BreadcrumbList (property pages)
- Apple touch icon: `public/Brand/apple-touch-icon.png` (180x180)
- Search Console: verified, sitemap submitted for `soulasia.com.my`

## Environment Variables
- `NEXT_PUBLIC_BASE_URL` — production domain, falls back to Vercel preview URL
- `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — Supabase
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — property map
