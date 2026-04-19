import type {Metadata} from "next";
import {Manrope} from "next/font/google";   // ⬅️ use Manrope
import "./globals.css";
import {Navbar} from "@/components/navbar";
import {Footer} from "@/components/footer";
import Script from "next/script";
import {UIProvider} from "@/lib/context";
import React, {Suspense} from "react";
import {SpeedInsights} from "@vercel/speed-insights/next";

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
    alternates: {
        canonical: domain,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
        },
    },
    formatDetection: {
        telephone: false,
        date: false,
        address: false,
    },
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
    icons: {
        icon: [
            {url: `/Brand/favicon.svg`, type: "image/svg+xml"},
            {url: `/Brand/apple-touch-icon.png`, type: "image/png"},
        ],
        apple: [{url: `/Brand/apple-touch-icon.png`, sizes: "180x180", type: "image/png"}],
    },
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
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    name: "Soulasia",
                    url: domain,
                    logo: `${domain}/Brand/logo.svg`,
                    description: "Premium short-term rental apartments in KLCC, Kuala Lumpur. Fully furnished stays near Bukit Bintang, TRX, and major city landmarks.",
                    address: {
                        "@type": "PostalAddress",
                        streetAddress: "B1-22-2, The Soho Suites @KLCC",
                        addressLocality: "Kuala Lumpur",
                        postalCode: "50450",
                        addressCountry: "MY",
                    },
                    areaServed: {
                        "@type": "City",
                        name: "Kuala Lumpur",
                    },
                    serviceType: "Short-term Rental",
                    contactPoint: {
                        "@type": "ContactPoint",
                        contactType: "customer service",
                        areaServed: "MY",
                        availableLanguage: "English",
                    },
                    sameAs: [
                        "https://www.instagram.com/soulasia.com.my",
                        "https://www.linkedin.com/company/soulasia-my/",
                    ],
                }),
            }}
        />
        <UIProvider>
            <Suspense fallback={<div></div>}>
                <Navbar/>
            </Suspense>
            <main className="bg-white flex-grow pt-nav">{children}</main>
            <Footer/>
        </UIProvider>
        <SpeedInsights/>
        </body>
        </html>
    );
}
