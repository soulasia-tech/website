This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Section Width & Container Usage Guideline

To ensure a consistent and polished layout across all pages, follow these rules for section widths and content alignment:

## 1. Use the `.container` Class for All Main Sections
- **Wrap all main content sections** in a `<div className="container mx-auto">`.
- The `.container` class is defined in `globals.css` as:
  ```css
  .container {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  }
  ```
- This ensures a maximum width of 1280px and responsive horizontal padding.

## 2. Remove Redundant Padding
- Do **not** add extra `px-4` or other horizontal padding to inner elements if the container already provides it.
- Only use additional padding for special cases (e.g., cards, modals, or narrow text blocks).

## 3. Avoid Inner `max-w-*` for Main Content
- Only use `max-w-*` for specific elements that need to be visually narrower (e.g., a centered heading or a card), not for the main section content.
- For text blocks that should be narrower, use `mx-auto` and `max-w-*` but keep them inside the `.container`.

## 4. Responsiveness
- The `.container` class is already responsive and will maintain mobile-friendliness.
- For full-width backgrounds, apply background color to the `<section>`, not the container.

## 5. Example Pattern
```jsx
<section>
  <div className="container mx-auto">
    {/* Section content here */}
  </div>
</section>
```

## 6. Consistency
- Apply this pattern to **all pages and sections** for visual harmony.
- Review new components/pages for adherence to this guideline during code review.

---

**Maintaining this standard will ensure a visually consistent, professional, and responsive site.**
