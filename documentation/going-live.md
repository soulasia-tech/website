# Going Live: Launch Checklist

Congratulations! You're ready to launch your website. Follow these steps to make sure your site is live on your production domain.

---

## 1. Update the Production Domain in Environment Variables

1. Go to your [Vercel dashboard](https://vercel.com/).
2. Select your project.
3. Click on **Settings** > **Environment Variables**.
4. Find the variable named `NEXT_PUBLIC_BASE_URL`.
5. Change its value to your production domain, for example:
   ```
   NEXT_PUBLIC_BASE_URL=https://new.soulasia.com.my/
   ```
6. Click **Save**.
7. Redeploy your project to apply the change.

---

## 2. Change the Domain in Vercel

1. In your Vercel project, go to **Settings** > **Domains**.
2. Click **Add** and enter your production domain (e.g., `new.soulasia.com.my`).
3. Follow the instructions to verify your domain (you may need to update DNS records with your domain provider).
4. Once verified, set this domain as the **primary** domain.
5. Remove any old or test domains if you no longer need them.

---

## 3. Final Checks
- Visit your production domain in a browser to make sure everything works.
- Double-check links, images, and forms.
- If you see any issues, check the Vercel dashboard for deployment errors.

---

**You're live! If you need to update your site in the future, just follow the same GitHub and deployment steps as before.** 