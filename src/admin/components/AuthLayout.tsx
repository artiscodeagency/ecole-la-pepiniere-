import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import officialLogo from "@/assets/logo-transparent.png";

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Frame of the sign-in pages, in the style of the public site. */
export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface-alt px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-8 h-56 w-56 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-10 h-40 w-40 rounded-full bg-accent-yellow/20 blur-3xl"
      />

      <main className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={officialLogo} alt="" className="h-16 w-16 object-contain" />
          <p className="mt-3 text-lg font-bold text-ink">La Pépinière</p>
          <p className="text-xs font-medium tracking-[0.18em] text-primary-dark">ADMINISTRATION</p>
        </div>

        <div className="rounded-[28px_16px_28px_16px] border border-border-soft bg-white p-6 shadow-soft-lg sm:p-8">
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          {description && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{description}</p>}
          <div className="mt-7">{children}</div>
        </div>

        <a
          href="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-soft transition-colors hover:text-primary-dark"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Retour au site public
        </a>
      </main>
    </div>
  );
}
