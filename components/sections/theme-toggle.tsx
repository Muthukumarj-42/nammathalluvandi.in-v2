"use client";

import { useEffect } from "react";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  useEffect(() => {
    // Force light theme
    document.documentElement.classList.remove("dark");
    window.localStorage.setItem("thalluvandi-theme", "light");
  }, []);

  return null;
}
