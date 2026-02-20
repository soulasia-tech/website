import type { Metadata } from "next";
import { Manrope } from "next/font/google";   // ⬅️ use Manrope
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Script from "next/script";
import {UIProvider} from "@/lib/context";
import React, {Suspense} from "react";

// Manrope variable font; includes Cyrillic
const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",   // ⬅️ creates CSS var
  display: "swap",
  // optionally restrict weights to shrink bundle:
  // weight: ["400","500","600","700"]
});

const domain = process.env.NEXT_PUBLIC_BASE_URL ?? "https://website-six-omega-16.vercel.app";

export const metadata: Metadata = {
    title: "Short Term Apartments in KLCC Kuala Lumpur | Soulasia",
    description: "Stay in fully furnished short term rental apartments in KLCC. Near Bukit Bintang, TRX and major city landmarks with flexible stays and easy check-in.",
    metadataBase: new URL(domain),
    openGraph: {
        title: "Short Term Apartments in KLCC Kuala Lumpur | Soulasia",
        description: "Stay in fully furnished short term rental apartments in KLCC. Near Bukit Bintang, TRX and major city landmarks with flexible stays and easy check-in.",
        url: domain,
        siteName: "Soulasia",
        images: [
            {
                url: `${domain}/og-image.jpg`,
                width: 1440,
                height: 825,
            },
        ],
        locale: "en_US",
        type: "website",
    },

    twitter: {
        card: "summary_large_image",
        title: "Short Term Apartments in KLCC Kuala Lumpur | Soulasia",
        description: "Stay in fully furnished short term rental apartments in KLCC. Near Bukit Bintang, TRX and major city landmarks with flexible stays and easy check-in.",
        images: [`${domain}/og-image.jpg`],
    },

    icons: {icon: [{url: `${domain}/favicon.svg`, type: "image/svg+xml"}]},
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${manrope.variable} h-full`}>
        <body className="min-h-full flex flex-col text-gray-900 antialiased font-sans">
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-MX5NERGM62" strategy="afterInteractive"/>
        <Script id="gtag-init" strategy="afterInteractive">
            {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-MX5NERGM62');
              `}
        </Script>
        <UIProvider>
            <Suspense fallback={<div></div>}>
                <Navbar/>
            </Suspense>
            <main className="bg-white flex-grow pt-nav">{children}</main>
            <Footer/>
        </UIProvider>
        </body>
        </html>
    );
}
