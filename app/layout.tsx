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

export const metadata: Metadata = {
  description: "Soulasia - Your Gateway to Authentic Asian Experiences",
  openGraph: {
    title: "Soulasia",
    description: "Your Gateway to Authentic Asian Experiences",
    type: "website",
  },
  icons: { icon: [{ url: "/Brand/favicon.svg", type: "image/svg+xml" }] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
      <html lang="en" className={`${manrope.variable} h-full`}>
      <head />
      <body className="min-h-full flex flex-col text-gray-900 antialiased font-sans">
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-Z11PKVB3LK" strategy="afterInteractive"/>
      <Script id="gtag-init" strategy="afterInteractive">
          {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-Z11PKVB3LK');
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
