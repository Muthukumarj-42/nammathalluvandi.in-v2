import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Contact D. Nagaraj Thalluvandi Ondipudur Coimbatore",
  description:
    "D. Nagaraj Thalluvandi Ondipudur Coimbatore. 30+ years of trusted thallu vandi rental. Visit us at Ondipudur or WhatsApp to book.",
  keywords: [
    "d nagaraj thalluvandi ondipudur",
    "thalluvandi ondipudur coimbatore",
    "nagaraj thallu vandi ondipudur",
    "D நாகராஜ் தளவண்டி ஒண்டிப்புதூர்"
  ],
  alternates: {
    canonical: "https://nammathalluvandi.in/contact"
  },
  openGraph: {
    title: "Contact D. Nagaraj Thalluvandi Ondipudur Coimbatore",
    description: "D. Nagaraj Thalluvandi Ondipudur Coimbatore. 30+ years of trusted thallu vandi rental. Visit us at Ondipudur or WhatsApp to book.",
    url: "https://nammathalluvandi.in/contact",
    siteName: "Namma Thalluvandi",
    images: [
      {
        url: "https://nammathalluvandi.in/brand/full-logo-with-background.webp",
        width: 1200,
        height: 630,
        alt: "Namma Thalluvandi logo"
      }
    ],
    locale: "ta_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact D. Nagaraj Thalluvandi Ondipudur Coimbatore",
    description: "D. Nagaraj Thalluvandi Ondipudur Coimbatore. 30+ years of trusted thallu vandi rental. Visit us at Ondipudur or WhatsApp to book.",
    images: ["https://nammathalluvandi.in/brand/full-logo-with-background.webp"]
  }
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
