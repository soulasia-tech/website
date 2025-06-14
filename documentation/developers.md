# Developer Handover Guide

## Project Overview
This project is a modern accommodation booking platform built with Next.js, Supabase, and Vercel. It integrates with Cloudbeds for property and reservation management.

## Tech Stack
- **Frontend:** Next.js (React)
- **Backend:** Next.js API routes
- **Database:** Supabase (Postgres)
- **Hosting/CI:** Vercel
- **Other:** Cloudbeds API, Zod (validation), Jest + React Testing Library (testing)

## Local Setup
1. **Prerequisites:**
   - Node.js (v18+ recommended)
   - npm or yarn
   - Git
2. **Clone the repository:**
   ```sh
   git clone <REPO_URL>
   cd <PROJECT_DIR>
   ```
3. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```
4. **Environment variables:**
   - Copy `.env.example` to `.env.local` and fill in all required values (Supabase keys, Cloudbeds credentials, etc.).
   - Never commit secrets to git!
5. **Run locally:**
   ```sh
   npm run dev
   # or
   yarn dev
   ```
   The app will be available at `http://localhost:3000`.

## Project Structure
- `/app` — Next.js app directory (pages, API routes)
- `/components` — Reusable React components
- `/lib` — Utility functions and API wrappers
- `/public` — Static assets (images, etc.)
- `/styles` — CSS/SCSS files
- `/documentation` — Project handover docs

**Naming:**
- Next.js is case-sensitive! Always match file/folder names exactly.

## Deployment
- **Production:** Deployed via Vercel (auto-deploys on push to `main` branch)
- **Preview:** Every PR creates a preview deployment
- **Manual Deploy:** Trigger via Vercel dashboard if needed

## Environment Variables
- All secrets and config are in `.env.local` (never commit this file)
- Common variables:
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `CLOUDBEDS_CLIENT_ID`, `CLOUDBEDS_CLIENT_SECRET`, etc.

## Working with Supabase
- Use the Supabase dashboard for DB management
- RLS (Row Level Security) is enabled — policies are documented in `/documentation/rls-policies.sql`
- Use the service role key for backend operations
- Use the anon key for frontend reads

## Working with Vercel
- Deployments are automatic on push
- Check build logs in Vercel dashboard for errors
- Rollback to previous deployments if needed

## Best Practices
- Use feature branches and PRs for all changes
- Run `npm run lint` and `npm run test` before pushing
- Use Zod for runtime validation
- Log errors with full context (never use `console.log` in production)
- Keep dependencies up to date

## Testing
- Run tests with `npm run test`
- Use Jest and React Testing Library
- Snapshot only pure presentational components

## Troubleshooting
- Check `.env.local` for missing/incorrect values
- Check Vercel build logs for deployment issues
- Use Supabase dashboard for DB errors

## Further Reading
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs) 