import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About Namma Thalluvandi | Coimbatore Food Cart Rental | நம்ம தளவண்டி பற்றி",
  description:
    "Namma Thalluvandi is a family-run thallu vandi rental business in Ondipudur, Coimbatore. Trusted by street food vendors across Coimbatore.",
  alternates: {
    canonical: "https://nammathalluvandi.in/about"
  },
  openGraph: {
    title: "About Namma Thalluvandi | Coimbatore Food Cart Rental | நம்ம தளவண்டி பற்றி",
    description: "Namma Thalluvandi is a family-run thallu vandi rental business in Ondipudur, Coimbatore. Trusted by street food vendors across Coimbatore.",
    url: "https://nammathalluvandi.in/about",
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
    title: "About Namma Thalluvandi | Coimbatore Food Cart Rental | நம்ம தளவண்டி பற்றி",
    description: "Namma Thalluvandi is a family-run thallu vandi rental business in Ondipudur, Coimbatore. Trusted by street food vendors across Coimbatore.",
    images: ["https://nammathalluvandi.in/brand/full-logo-with-background.webp"]
  }
};

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
