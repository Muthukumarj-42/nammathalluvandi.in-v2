import type { Metadata } from "next";
import { BarChart3, CalendarDays, CreditCard, Database, Lock, Newspaper, PackageSearch, UsersRound } from "lucide-react";

export const metadata: Metadata = {
  title: "Food Cart Marketplace Phase | Namma Thalluvandi",
  description: "Next-gen street food cart ecosystem features and payment gateway roadmap for vendors and custom thallu vandi manufacturing.",
  alternates: {
    canonical: "https://nammathalluvandi.in/marketplace"
  },
  robots: {
    index: false,
    follow: false
  }
};

function Text({ en, ta }: { en: string; ta: string }) {
  return (
    <>
      <span className="en">{en}</span>
      <span className="ta">{ta}</span>
    </>
  );
}

export default function MarketplacePage() {


  return (
    <main className="bg-[#F8F6F2] pt-0 md:pt-28">
      <section className="pb-24 pt-12 md:pt-0">
        <div className="site-container">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            <Text en="Marketplace Placeholder" ta="அடுத்த கட்ட marketplace" />
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-6xl uppercase leading-none text-ink md:text-8xl">
            <Text en="Backend-ready architecture for the next phase" ta="நாளைக்கு பெரிய platform ஆக வளர தயாரான அமைப்பு" />
          </h1>
          <p className="mt-6 max-w-[680px] text-lg leading-8 text-muted">
            <Text en="This frontend is structured for payment gateways, dashboards, database-backed listings, and city-wise scaling." ta="Payment, dashboard, live booking, city-wise listings — அடுத்த கட்ட வளர்ச்சிக்காக இந்த site ready ஆ இருக்கு." />
          </p>
          <div className="mt-12 grid items-stretch gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
            <div className="flex h-full flex-col rounded-xl border border-black/10 bg-white p-5 shadow-sm">
              <Database className="text-primary" />
              <h2 className="mt-5 font-bold text-ink"><Text en="PostgreSQL + Prisma" ta="Database setup" /></h2>
            </div>
            <div className="flex h-full flex-col rounded-xl border border-black/10 bg-white p-5 shadow-sm">
              <CreditCard className="text-primary" />
              <h2 className="mt-5 font-bold text-ink"><Text en="Razorpay / Stripe" ta="Payment வசதி" /></h2>
            </div>
            <div className="flex h-full flex-col rounded-xl border border-black/10 bg-white p-5 shadow-sm">
              <Lock className="text-primary" />
              <h2 className="mt-5 font-bold text-ink"><Text en="User authentication" ta="Login பாதுகாப்பு" /></h2>
            </div>
            <div className="flex h-full flex-col rounded-xl border border-black/10 bg-white p-5 shadow-sm">
              <UsersRound className="text-primary" />
              <h2 className="mt-5 font-bold text-ink"><Text en="Vendor dashboards" ta="Vendor dashboard" /></h2>
            </div>
            <div className="flex h-full flex-col rounded-xl border border-black/10 bg-white p-5 shadow-sm">
              <PackageSearch className="text-primary" />
              <h2 className="mt-5 font-bold text-ink"><Text en="Cart listing system" ta="வண்டி listing system" /></h2>
            </div>
            <div className="flex h-full flex-col rounded-xl border border-black/10 bg-white p-5 shadow-sm">
              <Newspaper className="text-primary" />
              <h2 className="mt-5 font-bold text-ink"><Text en="CMS and blog" ta="Content update வசதி" /></h2>
            </div>
            <div className="flex h-full flex-col rounded-xl border border-black/10 bg-white p-5 shadow-sm">
              <CalendarDays className="text-primary" />
              <h2 className="mt-5 font-bold text-ink"><Text en="Real-time booking" ta="Live booking" /></h2>
            </div>
            <div className="flex h-full flex-col rounded-xl border border-black/10 bg-white p-5 shadow-sm">
              <BarChart3 className="text-primary" />
              <h2 className="mt-5 font-bold text-ink"><Text en="Admin analytics" ta="Admin reports" /></h2>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
