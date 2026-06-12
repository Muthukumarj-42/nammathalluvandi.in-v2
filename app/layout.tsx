// Updated: D. Nagaraj SEO keywords added
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/sections/footer";
import { MobileBottomNav } from "@/components/sections/mobile-bottom-nav";
import { Navbar } from "@/components/sections/navbar";
import { WhatsAppFloat } from "@/components/sections/whatsapp-float";
import { Bebas_Neue, DM_Sans, Noto_Sans_Tamil } from "next/font/google";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const notoTamil = Noto_Sans_Tamil({
  weight: ["400", "500", "700"],
  subsets: ["tamil"],
  variable: "--font-noto-tamil",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nammathalluvandi.in"),
  title: "Namma Thalluvandi | D. Nagaraj Thallu Vandi Coimbatore",
  description:
    "D. Nagaraj thallu vandi rental Coimbatore. 30+ years of trust. 70+ carts from ₹100/day. Ondipudur. WhatsApp booking, same day response. தளவண்டி வாடகை கோவை.",
  keywords: [
    "namma thalluvandi",
    "நம்ம தளவண்டி",
    "nammathalluvandi.in",
    "D Nagaraj thalluvandi",
    "D Nagaraj thallu vandi coimbatore",
    "D Nagaraj thalluvandi ondipudur",
    "D நாகராஜ் தளவண்டி கோவை",
    "D நாகராஜ் தளவண்டி ஒண்டிப்புதூர்",
    "nagaraj thalluvandi ondipudur coimbatore",
    "nagaraj cart rental coimbatore",
    "d nagaraj food cart coimbatore",
    "நாகராஜ் வண்டி வாடகை கோவை",
    "thallu vandi rental coimbatore",
    "thallu vandi vadagai coimbatore",
    "food cart rental coimbatore",
    "thalluvandi rent coimbatore",
    "push cart rental coimbatore",
    "street food cart coimbatore",
    "ondipudur thallu vandi rental",
    "ondipudur food cart rental",
    "thallu vandi ondipudur coimbatore",
    "ஒண்டிப்புதூர் தளவண்டி வாடகை",
    "உணவு வண்டி வாடகை கோயம்புத்தூர்",
    "தளவண்டி வாடகை கோவை",
    "தள்ளு வண்டி வாடகை கோவை",
    "நம்ம தளவண்டி கோவை",
    "food cart rental near me coimbatore",
    "push cart vadagai coimbatore"
  ],
  alternates: {
    canonical: "https://nammathalluvandi.in"
  },
  openGraph: {
    title: "Namma Thalluvandi | D. Nagaraj Thallu Vandi Coimbatore",
    description: "D. Nagaraj thallu vandi rental Coimbatore. 30+ years of trust. 70+ carts from ₹100/day. Ondipudur. WhatsApp booking, same day response. தளவண்டி வாடகை கோவை.",
    url: "https://nammathalluvandi.in",
    siteName: "Namma Thalluvandi",
    images: [
      {
        url: "https://nammathalluvandi.in/brand/full-logo-with-background.webp",
        width: 1200,
        height: 630,
        alt: "Namma Thalluvandi food cart rental logo"
      }
    ],
    locale: "ta_IN",
    alternateLocale: ["en_IN"],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Namma Thalluvandi | D. Nagaraj Thallu Vandi Coimbatore",
    description: "D. Nagaraj thallu vandi rental Coimbatore. 30+ years of trust. 70+ carts from ₹100/day. Ondipudur. WhatsApp booking, same day response. தளவண்டி வாடகை கோவை.",
    images: ["https://nammathalluvandi.in/brand/full-logo-with-background.webp"]
  },
  icons: {
    icon: "/brand/text-logo.webp",
    apple: "/brand/text-logo.webp"
  },
  verification: {
    google: "01461042ed3c0564",
  }
};
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-lang="en" className={`${bebasNeue.variable} ${dmSans.variable} ${notoTamil.variable}`}>
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <body className="font-sans antialiased">
        {/* Google Analytics 4 Setup - REPLACE_THIS_WITH_YOUR_GA4_MEASUREMENT_ID */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ZKJMPC7793"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-ZKJMPC7793');
          `}
        </Script>
        <Navbar />
        {children}
        <Analytics />
        <Footer />
        <WhatsAppFloat />
        <MobileBottomNav />
      </body>
    </html>
  );
}
