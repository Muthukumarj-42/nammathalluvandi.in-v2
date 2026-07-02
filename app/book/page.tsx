import { Suspense } from "react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

const BookingFlow = dynamic(
  () => import("@/components/sections/booking-flow").then((mod) => mod.BookingFlow),
  {
    loading: () => (
      <main className="bg-[#fffdf7] min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted text-sm font-semibold">Loading booking details...</p>
        </div>
      </main>
    ),
  }
);

export const metadata: Metadata = {
  title: "Book a Food Cart | Namma Thalluvandi",
  description: "Securely rent your food cart in Coimbatore, Tamil Nadu. Select your cart, review rental terms, and continue to WhatsApp.",
  alternates: {
    canonical: "https://nammathalluvandi.in/book",
  },
  openGraph: {
    title: "Book a Food Cart | Namma Thalluvandi",
    description: "Securely rent your food cart in Coimbatore, Tamil Nadu. Select your cart, review rental terms, and continue to WhatsApp.",
    url: "https://nammathalluvandi.in/book",
  }
};

export default function BookPage() {
  return (
    <Suspense fallback={
      <main className="bg-[#fffdf7] min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted text-sm font-semibold">Loading booking details...</p>
        </div>
      </main>
    }>
      <BookingFlow />
    </Suspense>
  );
}
