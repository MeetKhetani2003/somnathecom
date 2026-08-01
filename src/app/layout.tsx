import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Layout from "@/components/Layout";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const poppins = Poppins({ weight: ["500", "600"], subsets: ["latin"], variable: "--font-display" });

import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://somnathnx.com'),
  title: {
    default: "Somnath NX - Premium Nightwear & Loungewear",
    template: "%s | Somnath NX",
  },
  description: "India's premium destination for nightwear and loungewear. Experience unmatched comfort, modern designs, and breathable fabrics.",
  keywords: ["Nightwear", "Loungewear", "Somnath NX", "Premium Nightwear", "Sleepwear", "Comfort Wear", "India Nightwear", "Pajamas", "Tencel Collection", "Hosiery Collection"],
  authors: [{ name: "Somnath NX" }],
  creator: "Somnath NX",
  publisher: "Somnath NX",
  openGraph: {
    title: "Somnath NX - Premium Nightwear & Loungewear",
    description: "Experience unmatched comfort, modern designs, and breathable fabrics with India's premium destination for nightwear and loungewear.",
    url: 'https://somnathnx.com',
    siteName: 'Somnath NX',
    images: [
      {
        url: '/assets/logo.png', // Fallback for OG image, better if a larger image exists, but this works
        width: 800,
        height: 600,
        alt: 'Somnath NX Logo',
      }
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Somnath NX - Premium Nightwear & Loungewear',
    description: "India's premium destination for nightwear and loungewear.",
    images: ['/assets/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/assets/logo.png',
    shortcut: '/assets/logo.png',
    apple: '/assets/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased bg-bg-base text-dark">
        <Providers>
          <Layout>
            {children}
          </Layout>
        </Providers>
      </body>
    </html>
  );
}
