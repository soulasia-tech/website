import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import Head from "next/head";

// Initialize Inter font with all weights we'll need
const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
  // Include weights we'll use throughout the app
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: "SoulAsia",
  description: "SoulAsia - Your Gateway to Authentic Asian Experiences",
  // Add more metadata for SEO
  openGraph: {
    title: 'SoulAsia',
    description: 'Your Gateway to Authentic Asian Experiences',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-Z11PKVB3LK"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-Z11PKVB3LK');
        `}} />
      </head>
      <body className={`min-h-full flex flex-col bg-gray-50 text-gray-900 antialiased`}>
        <Navbar />
        <main className="flex-grow pt-[72px]">
        {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
