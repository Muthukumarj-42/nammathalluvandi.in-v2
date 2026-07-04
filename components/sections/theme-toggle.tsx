"use client";

import { Sun } from "lucide-react";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  return (
    <button
      disabled
      className="p-2 text-on-surface-variant/40 cursor-not-allowed opacity-50 transition"
      aria-label="Theme toggle (disabled)"
      title="Theme toggle is disabled"
    >
      <Sun size={20} className="shrink-0" />
    </button>
  );
}
