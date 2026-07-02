"use client";

import { useEffect, useState } from "react";
import { Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const [lang, setLang] = useState<"en" | "ta">("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("thalluvandi-lang") === "ta" ? "ta" : "en";
    setLang(saved);
    document.documentElement.dataset.lang = saved;
  }, []);

  function toggleLanguage() {
    const next = lang === "en" ? "ta" : "en";
    setLang(next);
    document.documentElement.dataset.lang = next;
    window.localStorage.setItem("thalluvandi-lang", next);
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      suppressHydrationWarning
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary/25 bg-white px-4 text-xs font-bold uppercase tracking-[0.12em] text-ink shadow-sm transition hover:border-primary hover:text-primary",
        compact && "min-h-10 px-3 text-[11px]"
      )}
      aria-label="Toggle language"
    >
      <Globe2 size={compact ? 15 : 17} />
      <span>{lang === "en" ? "EN | தமிழ்" : "தமிழ் | EN"}</span>
    </button>
  );
}
