
## 🔍 Overview
SoulAsia is building a minimalistic booking platform with a clean and modern UI. It connects to the **Cloudbeds API** for hotel availability and reservations, and integrates **Stripe** for secure payments. The tech stack is based on **Next.js**, **TailwindCSS**, **ShadCN/UI**, and **Supabase**.

This PRD is a consolidated source of truth, covering architecture, features, phases, and file structure.

---

## 🛠 Tech Stack
- **Next.js (App Router)** – Routing, layouts, server/client logic
- **TailwindCSS** – Utility-first CSS for styling
- **ShadCN/UI** – Component framework for form inputs, modals, cards
- **Supabase** – Authentication + guest/user data storage
- **Stripe** – Payment Intents API + webhook handling
- **Cloudbeds API (v1.2)** – Hotel search, booking management
- **MDX** – Static content editing via GitHub (About, FAQ, etc.)

 Developer Guidelines

The project must be built with deployment to Vercel in mind. Avoid using features incompatible with Vercel's serverless environment (e.g. persistent local state).

Mock all API logic first. Use /api/search, /api/book, /api/payment to simulate the Cloudbeds + Stripe flow until credentials are confirmed.

Use Client Components for interactive views (booking form, Stripe payment, auth flows). Use Server Components for static content (e.g. /about, /faq).

Create clear API utility functions inside /lib/cloudbeds.ts and /lib/stripe.ts that can be reused by backend + frontend.

Stripe webhooks should be tested locally using Stripe CLI and deployed via Vercel edge functions.

Supabase is used for user sessions and optionally for logging guest bookings. Cloudbeds is the source of truth for reservations.

Use Tailwind utility classes + ShadCN components for all UI. No custom component libraries.

Pages like /about, /faq, and /contact must be powered by MDX. Content lives in /content/pages and is editable by the client on GitHub.

Use .env.local for development and .env.production for deployment. Sensitive keys (Supabase, Stripe, Cloudbeds) should not be hardcoded.

Booking flow should be resilient to API failure and include UI feedback (loading, success, errors).

---

## 🧩 Feature Set by Phase

### ✅ Phase 1: Technical Setup & Mocking
**Goal:** Scaffold the tech stack and simulate API behavior.
- Connect GitHub and Vercel - done 
- Setup Next.js + TailwindCSS + ShadCN - done 
- Supabase DB with `guest_bookings` table - 
- Create mock endpoints in `/api`
- Create local JSON file for fake rooms & availability
- Confirm mock booking flow works end-to-end

**Definition of Done:**
- Project builds locally and deploys on Vercel
- Mock booking flow runs through confirmation page

---

### ✅ Phase 2: Booking Flow (Mocked)
**Goal:** Build complete user flow with mocked backend logic.
- **Landing page** (`/`): Hero, search form
- **Search page** (`/search`): Filtered results from mock API
- **Booking form** (`/booking`): Guest details, fake Stripe call
- **Confirmation** (`/confirmation`): Show mocked confirmation info

**Acceptance Criteria:**
- Users can go from homepage → search → book → confirmation with no errors

**Definition of Done:**
- All pages work offline using mock APIs and render realistic flows

---

### ✅ Phase 3: Authentication (Optional)
**Goal:** Enable user login for future account-based features.
- Signup/Login using Supabase Auth
- Protect `/dashboard` route
- Prompt user post-booking to optionally create account

**Definition of Done:**
- Auth users can log in, logout, and access `/dashboard`

---

### ✅ Phase 4: API Integration
**Goal:** Replace mocks with live Cloudbeds and Stripe APIs.
- **Availability**: Call Cloudbeds `/roomAvailability`
- **Booking**: Submit booking to Cloudbeds post-payment
- **Stripe**: Create PaymentIntent and webhook for confirmation

**Definition of Done:**
- User flow works with real APIs, bookings show up in Cloudbeds

---

### ✅ Phase 5: Final UI Polish
- Fully responsive UI with TailwindCSS
- Use ShadCN for consistency in buttons, inputs, cards
- Add loading states, error handling, transitions

**Definition of Done:**
- Design is clean and mobile-ready across all views

---

### ✅ Phase 6: MDX Content Layer
- Enable client to edit `/about`, `/faq`, `/contact` via GitHub
- Pages stored as `.mdx` in `/content/pages`
- Rendered via a shared `StaticPage` layout

**Definition of Done:**
- Client edits content and sees changes live on next Vercel build

---

### ✅ Phase 7: QA & Deployment
- Manual QA on mobile/desktop
- Use `.env.production` for live API keys
- Launch with custom domain on Vercel

**Definition of Done:**
- App is stable, bug-free, and live in production

---

## 🗂 File Structure (Next.js App Router)
```
/app
├── layout.tsx                # Root layout
├── page.tsx                  # Landing page (/)
├── login
│   └── page.tsx              # Login page (/login)
├── signup
│   └── page.tsx              # Signup page (/signup)
├── dashboard                 # Auth-protected dashboard
│   └── page.tsx              # (/dashboard)
├── search
│   └── page.tsx              # (/search)
├── booking
│   └── page.tsx              # (/booking)
├── confirmation
│   └── page.tsx              # (/confirmation)
├── about
│   └── page.mdx              # Static content (/about)
├── contact
│   └── page.mdx              # Static content (/contact)
├── faq
│   └── page.mdx              # Static content (/faq)
/api
│   ├── search.ts             # Room availability (mock/real)
│   ├── book.ts               # Create booking
│   ├── payment.ts            # Stripe integration
│   └── webhook.ts            # Stripe webhook handler
/components                  # UI components
/context                    # Auth provider, booking state
/hooks                      # useAuth, useBooking, etc.
/lib                        # API utils (cloudbeds.ts, stripe.ts)
/content/pages              # MDX content
/middleware.ts              # Protects auth routes
/styles                     # Tailwind global config
/utils                      # Utility functions
```

---

## 🌐 Routing Overview

| Route             | Public | Protected | Description                        |
|------------------|--------|-----------|------------------------------------|
| `/`              | ✅     |           | Landing page                       |
| `/login`         | ✅     |           | Supabase login                     |
| `/signup`        | ✅     |           | Supabase signup                    |
| `/search`        | ✅     |           | Show search results                |
| `/booking`       | ✅     |           | Guest fills form + payment         |
| `/confirmation`  | ✅     |           | Show booking summary               |
| `/dashboard`     |        | ✅        | User dashboard (if logged in)      |
| `/about`         | ✅     |           | Static content via MDX             |
| `/contact`       | ✅     |           | Static content via MDX             |
| `/faq`           | ✅     |           | Static content via MDX             |

**Middleware:** Guards `/dashboard` + any future private pages.

---

This PRD is now a single reference document for everyone on the SoulAsia project: client, developer, designer, and QA.

