import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "success" | "warning" | "muted" | "danger";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-alt text-ink-soft border-border-soft",
  success: "bg-primary-light text-primary-dark border-primary/30",
  warning: "bg-accent-yellow/25 text-ink border-accent-yellow/60",
  muted: "bg-white text-ink-soft border-border-soft",
  danger: "bg-red-50 text-red-800 border-red-200",
};

export function StatusBadge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold", TONES[tone])}>
      {children}
    </span>
  );
}
