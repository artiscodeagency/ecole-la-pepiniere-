import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Reveal } from "@/components/ui/Reveal";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  imageLabel: string;
}

export function PageHero({
  eyebrow,
  title,
  description,
  imageLabel,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-surface-alt px-6 pb-20 pt-14 lg:px-10 lg:pb-28 lg:pt-20">
      <div
        aria-hidden
        className="absolute -right-20 top-8 h-48 w-48 rounded-full bg-primary/8 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-secondary/10 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal delay={0.08}>
          <div>
            <p className="text-sm font-medium tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight text-ink sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              {description}
            </p>
            <nav
              aria-label="Fil d'Ariane"
              className="mt-8 flex items-center gap-2 text-sm text-ink-soft"
            >
              <Link to="/" className="transition-colors hover:text-primary">
                Accueil
              </Link>
              <ChevronRight size={15} aria-hidden="true" />
              <span className="font-medium text-primary">{eyebrow}</span>
            </nav>
          </div>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="relative lg:pl-8">
            <div
              aria-hidden
              className="absolute -left-2 top-10 h-20 w-20 rounded-full bg-accent-yellow/20 blur-2xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-6 right-4 h-24 w-24 rounded-full bg-secondary/15 blur-2xl"
            />
            <div className="group relative overflow-hidden rounded-[28px] border border-border-soft bg-white p-3 shadow-soft-lg">
              <div className="aspect-4/3 overflow-hidden rounded-image">
                <div className="flex h-full items-center justify-center bg-linear-to-br from-primary-light via-white to-secondary-light px-8 text-center transition-transform duration-500 ease-out group-hover:scale-105">
                  <span className="rounded-full bg-white/85 px-4 py-2 text-xs font-medium text-ink-soft shadow-soft">
                    Photo à intégrer · {imageLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
