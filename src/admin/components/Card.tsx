import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** White panel grouping related fields in a form. */
export function Card({ title, children, className }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-card border border-border-soft bg-white p-5 shadow-soft sm:p-6", className)}>
      {title && <h2 className="mb-4 text-base font-semibold text-ink">{title}</h2>}
      {children}
    </section>
  );
}
