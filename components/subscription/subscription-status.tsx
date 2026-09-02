"use client";

import Link from "next/link";
import { Sparkles, CheckCircle2, Clock, AlertCircle, ArrowUpRight, Crown } from "lucide-react";
import { UserEntitlement } from "@/lib/db";
import { getPlan } from "@/lib/plans";

function T({ en, ta }: { en: string; ta: string }) {
  return (
    <>
      <span className="en">{en}</span>
      <span className="ta tamil-text">{ta}</span>
    </>
  );
}

interface SubscriptionStatusProps {
  entitlement: UserEntitlement | null;
  className?: string;
  compact?: boolean;
}

export function SubscriptionStatus({
  entitlement,
  className = "",
  compact = false,
}: SubscriptionStatusProps) {
  if (!entitlement || !entitlement.plan || entitlement.status !== "active") {
    return (
      <div
        className={`bg-surface rounded-2xl p-5 border border-amber-500/20 shadow-xs space-y-3 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <T en="No Active Plan" ta="செயலில் உள்ள திட்டம் இல்லை" />
          </div>
          <span className="text-[11px] font-semibold text-on-surface-variant">0 listings</span>
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          <T
            en="Choose a listing plan to publish your cart and start receiving customer enquiries."
            ta="உங்கள் வண்டியைப் பட்டியலிட மற்றும் விசாரணைகளைப் பெற ஒரு திட்டத்தைத் தேர்ந்தெடுக்கவும்."
          />
        </p>
        <Link
          href="/publish?change_plan=true"
          className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition shadow-xs"
        >
          <span><T en="Choose a Plan" ta="திட்டத்தைத் தேர்ந்தெடுக்கவும்" /></span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const plan = getPlan(entitlement.plan);
  const cycleLabel = entitlement.billingCycle === "3_months" ? "3 Months" : "1 Month";
  const formattedExpiry = entitlement.expiresAt
    ? new Date(entitlement.expiresAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Active";

  const percentageUsed = Math.min(
    100,
    Math.round((entitlement.totalListings / Math.max(1, entitlement.listingLimit)) * 100)
  );

  if (compact) {
    return (
      <div
        className={`bg-surface rounded-xl px-3.5 py-2.5 border border-outline-variant/30 flex items-center justify-between shadow-xs ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
            style={{ background: plan.bgHex, color: plan.accentHex }}
          >
            {plan.nameEn}
          </span>
          <span className="text-xs font-semibold text-on-surface">
            {entitlement.totalListings}/{entitlement.listingLimit}{" "}
            <span className="text-on-surface-variant text-[11px] font-normal">Carts</span>
          </span>
        </div>
        <Link
          href="/publish?change_plan=true"
          className="text-[11px] font-bold text-primary hover:underline"
        >
          <T en="Upgrade" ta="உயர்த்துக" />
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`bg-surface rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-4 ${className}`}
    >
      {/* Header: Plan Badge & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
            style={{ background: plan.bgHex, color: plan.accentHex }}
          >
            {plan.badgeEn}
          </span>
          <span className="text-xs text-on-surface-variant font-medium">({cycleLabel})</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Active</span>
        </div>
      </div>

      {/* Quota Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-on-surface-variant font-medium">
            <T en="Listings Usage" ta="பட்டியல் பயன்பாடு" />
          </span>
          <span className="font-bold text-on-surface">
            {entitlement.totalListings} / {entitlement.listingLimit}{" "}
            <span className="text-on-surface-variant font-normal">
              ({entitlement.remainingListings} <T en="remaining" ta="மீதம்" />)
            </span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${percentageUsed}%` }}
          />
        </div>
      </div>

      {/* Expiry Details */}
      <div className="pt-3 border-t border-outline-variant/10 flex items-center justify-between text-xs text-on-surface-variant">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-on-surface-variant/70" />
          <span>
            <T en="Valid until:" ta="செல்லுபடியாகும் நாள்:" /> {formattedExpiry}
          </span>
        </div>

        <Link
          href="/publish?change_plan=true"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
        >
          <span><T en="Change Plan" ta="திட்டம் மாற்ற" /></span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
