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

---

## Coding Guidelines

Behavioral guidelines to reduce common LLM coding mistakes.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.
