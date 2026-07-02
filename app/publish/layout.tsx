import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "List Your Thallu Vandi | All Tamil Nadu Districts | Namma Thalluvandi",
  description:
    "Own a food cart anywhere in Tamil Nadu? List it on Namma Thalluvandi. Reach vendors in Chennai, Madurai, Salem, Trichy, Tiruppur, Coimbatore, Erode, Vellore and all districts. Free listing.",
  keywords: [
    "list food cart tamil nadu",
    "publish thallu vandi tamil nadu",
    "rent out food cart tamil nadu",
    "food cart owner listing",
    "thallu vandi owner registration",
    "வண்டி பதிவு தமிழ்நாடு",
    "உணவு வண்டி பட்டியல் தமிழ்நாடு",
    "list food cart chennai",
    "list food cart madurai",
    "list food cart salem",
    "list food cart trichy",
    "list food cart erode",
    "list food cart vellore",
    "list food cart tirunelveli",
    "list food cart tiruppur",
    "list food cart coimbatore",
    "food cart listing all districts tamil nadu"
  ],
  alternates: {
    canonical: "https://nammathalluvandi.in/publish"
  },
  openGraph: {
    title: "List Your Thallu Vandi | All Tamil Nadu Districts | Namma Thalluvandi",
    description: "Own a food cart anywhere in Tamil Nadu? List it on Namma Thalluvandi. Reach vendors in Chennai, Madurai, Salem, Trichy, Tiruppur, Coimbatore, Erode, Vellore and all districts. Free listing.",
    url: "https://nammathalluvandi.in/publish",
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
    title: "List Your Thallu Vandi | All Tamil Nadu Districts | Namma Thalluvandi",
    description: "Own a food cart anywhere in Tamil Nadu? List it on Namma Thalluvandi. Reach vendors in Chennai, Madurai, Salem, Trichy, Tiruppur, Coimbatore, Erode, Vellore and all districts.",
    images: ["https://nammathalluvandi.in/brand/full-logo-with-background.webp"]
  }
};

export default function PublishLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
