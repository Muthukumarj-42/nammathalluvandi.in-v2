"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = window.localStorage.getItem("thalluvandi-theme") as "light" | "dark" | null;
    
    // Default to dark theme if not saved
    const activeTheme = savedTheme || "dark";
    setTheme(activeTheme);
    
    if (activeTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem("thalluvandi-theme", nextTheme);
    
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  if (!mounted) {
    return (
      <div 
        className={cn(
          "w-11 h-11 rounded-full border border-[#ffb690]/25 bg-transparent shrink-0 animate-pulse",
          compact && "w-10 h-10"
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[#ffb690]/25 hover:border-[#f97316] bg-transparent text-[#e0c0b1] hover:text-[#ffb690] shadow-sm transition shrink-0",
        compact && "min-h-10 min-w-10"
      )}
      aria-label="Toggle color theme"
    >
      {theme === "dark" ? (
        <Sun size={compact ? 16 : 18} />
      ) : (
        <Moon size={compact ? 16 : 18} />
      )}
    </button>
  );
}
