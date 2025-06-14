# Designer Handover Guide

## Project Overview
This project uses a modern, component-based design system built with React (Next.js). All UI is modular and reusable.

## Design System
- **Components:** All UI elements (buttons, cards, forms, etc.) are React components in `/components`.
- **Styles:**
  - Main styles are in `/styles` (CSS/SCSS files)
  - Some components use Tailwind CSS utility classes inline
- **Colors, fonts, and spacing:**
  - Defined in global styles or Tailwind config
  - Consistent use across all pages

## Editing Styles
- To change global styles, edit files in `/styles` or Tailwind config
- To update a component's look, edit its file in `/components`
- For font or color changes, update the relevant CSS or Tailwind config

## Images & Assets
- All images are in `/public` (organized by type or page)
- To update an image, replace the file in `/public` with the same name (or update the import path in the component)
- Use optimized images (WebP, JPEG, PNG)

## Working with Components
- Each UI section (header, footer, room card, etc.) is a separate file in `/components`
- To update a section, find its component and edit the JSX/props/styles
- Components are reused across pages for consistency

## Responsive Design
- The site is fully responsive (mobile, tablet, desktop)
- Use Tailwind or CSS media queries for layout tweaks

## Collaboration Tips
- Use Figma or design files as the source of truth
- Communicate with developers about component changes
- Always check the site in Vercel preview before finalizing design changes

## Useful Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Figma](https://www.figma.com/) 