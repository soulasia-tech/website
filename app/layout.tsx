import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Script from "next/script";

// Initialize Inter font with all weights we'll need
const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
  // Include weights we'll use throughout the app
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: "Soulasia | Soulful Stays, Memorable Days.",
  description: "Soulasia - Your Gateway to Authentic Asian Experiences",
  openGraph: {
    title: 'Soulasia',
    description: 'Your Gateway to Authentic Asian Experiences',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/Brand/favicon.svg', type: 'image/svg+xml' }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head />
      <body className={`min-h-full flex flex-col bg-gray-50 text-gray-900 antialiased`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Z11PKVB3LK"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Z11PKVB3LK');
          `}
        </Script>
        <Navbar />
        <main className="flex-grow pt-[72px]">
        {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
