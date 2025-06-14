# Moderator/Admin Guide (For Non-Technical Users)

Welcome! This guide will help you make changes to your website—even if you've only used WordPress before. Follow these steps and you'll be able to update content, add properties, and deploy changes with confidence.

---

## 1. Introduction
This document is for website moderators and admins who want to update text, images, or properties, and publish changes online. No coding experience required!

---

## 2. Editing Existing Pages (Text & Images)
1. **Go to your GitHub repository** in your web browser.
2. **Find the file you want to edit:**
   - Most pages are in the `/app` folder (e.g., `/app/page.tsx` for the homepage).
   - Images are in the `/public` folder.
3. **Click the file name** to view it, then click the pencil ✏️ icon to edit.
4. **Edit text directly** in the file. For images, upload a new image to `/public` and update the image path in the page/component file.
5. **Scroll down and write a short description** of your change.
6. **Click "Commit changes"** to save.

**Tips:**
- Next.js is case-sensitive! File and folder names must match exactly.
- Always double-check your changes before saving.

---

## 3. Creating New Pages
1. **Copy an existing page file** (e.g., `/app/about.tsx`).
2. **Rename the new file** (use lowercase, no spaces, e.g., `newpage.tsx`).
3. **Edit the content** as needed.
4. **Commit your changes** as above.

---

## 4. Adding and Editing Property Pages (Step-by-Step for Beginners)

Your website uses a single, smart property page that changes based on the property ID in the web address (URL). You do NOT create a new folder or file for each property. Instead, you update a list in one file and upload your images. You can also edit all the text, descriptions, and amenities for each property in the same file.

---

### What does this mean?
- When someone visits `/properties/19928`, the website looks up the info for property ID `19928` in a list inside one file.
- If you want to add a new property (for example, with ID `12345`), you add its info to that list and upload your images.

---

### Step-by-Step: Add a New Property

#### 1. Open the Property Page File
- In GitHub, go to: `/app/properties/[propertyId]/page.tsx`

#### 2. Add Your Property's Info to the Lists
- At the top of this file, you'll see two lists:
  - `propertyLocationMap` — tells the website where the property is on the map.
  - `propertyImagesMap` — tells the website which images to show for each property.

**Example:**
```js
const propertyLocationMap = {
  '270917': { lat: 3.163265, lng: 101.710802 }, // Scarletz
  '19928': { lat: 3.1579, lng: 101.7075 }, // Vortex
  // Add your new property below:
  '12345': { lat: 3.1234, lng: 101.5678 }, // My New Property
};

const propertyImagesMap = {
  '270917': [
    '/properties/Scarletz/DSC01327.jpg',
    // ...
  ],
  '19928': [
    '/properties/Vortex/54c2879c_z copy 2.jpg',
    // ...
  ],
  // Add your new property below:
  '12345': [
    '/properties/MyNewProperty/image1.jpg',
    '/properties/MyNewProperty/image2.jpg',
    // ...
  ],
};
```
- Replace `'12345'` with your actual property ID (from Supabase/Cloudbeds).
- Replace the latitude/longitude and image paths with your property's info.

#### 3. Upload Your Images
- In GitHub, go to `/public/properties/`
- Create a new folder named exactly as you used in your image paths (e.g., `MyNewProperty`)
- Upload your property's images into this folder.

#### 4. Make Sure the Property Exists in Supabase/Cloudbeds
- The property ID you use must match the one in your database and Cloudbeds.

#### 5. Add or Edit Text, Descriptions, and Amenities
- In the same file (`/app/properties/[propertyId]/page.tsx`), look for sections that set the text for each property. These might look like this:
```js
let pageTitle = 'Soulasia | Property';
if (propertyId === '270917') pageTitle = 'Soulasia | Scarletz KLCC Apartments by Soulasia';
else if (propertyId === '19928') pageTitle = 'Soulasia | Vortex KLCC Apartments by Soulasia';
else if (propertyId === '12345') pageTitle = 'Soulasia | My New Property by Soulasia';

const propertyDescriptions = {
  '270917': 'Scarletz is a luxury apartment in KLCC...',
  '19928': 'Vortex is a modern apartment in the city center...',
  // Add your new property here:
  '12345': 'My New Property is a cozy place in Kuala Lumpur...',
};
```
- To **change text** for an existing property, just edit the value for that property ID.
- To **add text** for a new property, add a new entry with your property ID and the text you want.
- There may be similar objects for amenities, highlights, etc. (e.g., `propertyAmenities`).

#### 6. Save and Commit
- After editing, scroll down in GitHub, write a short description of your change (e.g., "Add new property 12345"), and click **Commit changes**.

#### 7. Deploy and Check Your Changes
- After you commit, Vercel will automatically deploy your changes.
- Visit `/properties/[YourPropertyId]` (replace with your actual ID) to see your new or updated property page.
- Double-check that all images, text, and map location are correct.

---

### How to Edit Existing Property Pages
- To change images, update the image paths in `propertyImagesMap` and upload new images to the correct folder in `/public/properties/`.
- To change text, description, or amenities, edit the relevant objects or variables in `/app/properties/[propertyId]/page.tsx`.
- To change the map location, update the latitude/longitude in `propertyLocationMap`.

---

### Summary Table

| What you want to change      | Where to look/edit in `/app/properties/[propertyId]/page.tsx` |
|-----------------------------|---------------------------------------------------------------|
| Page title                  | `pageTitle` variable or similar                              |
| Description                 | `propertyDescriptions` object or similar                     |
| Amenities/highlights        | `propertyAmenities` or similar object                        |
| Images                      | `propertyImagesMap` object                                   |
| Map location                | `propertyLocationMap` object                                 |

---

### If You Get Stuck
- If you don't see the text you want to change, search for it in the file and edit it directly.
- If you're unsure, ask ChatGPT or your developer for help—just mention the property ID and what you want to change.
- Always double-check your changes after deployment.

---

**You do NOT need to create new folders or files for each property page. Everything is managed in one file and the images folder.**

---

## 5. Editing Components (e.g., Footer, Header)
1. **Go to the `/components` folder** in GitHub.
2. **Find the component** you want to edit (e.g., `Footer.tsx`).
3. **Edit text, links, or images** as needed.
4. **Commit your changes.**

---

## 6. Adding or Editing Properties in Supabase
1. **Log in to the Supabase dashboard** ([https://app.supabase.com/](https://app.supabase.com/)).
2. **Select your project.**
3. **Go to the "Table Editor"** and find the `cloudbeds_properties` table.
4. **Add a new row** for a new property, or edit an existing row.
5. **Save your changes.**

---

## 7. Deploying Changes via GitHub
1. **After committing changes in GitHub,** Vercel will automatically start a deployment.
2. **Check the deployment status** in the Vercel dashboard ([https://vercel.com/](https://vercel.com/)).
3. **If deployment succeeds:** Your changes are live!
4. **If deployment fails:**
   - Read the error message in Vercel.
   - Common issues: typos in file names, missing images, or code errors.
   - Fix the issue in GitHub and commit again.

**Tips:**
- Only edit one thing at a time if you're new—makes it easier to fix mistakes.
- Always preview your site after deployment.

---

## 8. Best Practices & Common Pitfalls
- Don't rename or delete files unless you're sure.
- Double-check image paths and file extensions.
- Keep a backup of important text/images before big changes.
- If you're unsure, ask for help before committing.

---

## 9. How to Use ChatGPT for Help
If you want to make a change but aren't sure how, you can use ChatGPT to get step-by-step help!

**How to use:**
1. Go to [https://chat.openai.com/](https://chat.openai.com/) or your preferred ChatGPT tool.
2. Describe what you want to do. Example prompts:
   - "How do I change the homepage headline in a Next.js project?"
   - "How do I add a new image to my site?"
   - "How do I update the footer links?"
3. Copy any code or instructions ChatGPT gives you.
4. Paste them into your GitHub file as needed.
5. If you're unsure, ask ChatGPT to review your change before you commit.

**Tips:**
- Be specific in your question (mention file names or what you want to change).
- If you get stuck, you can paste error messages into ChatGPT for help.

---

**You've got this! With this guide, you can confidently manage your website—even if you're new to GitHub and Next.js.** 