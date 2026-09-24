import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { Reveal } from "@/components/ui/Reveal";
import { SCHOOL_STATS } from "@/data/stats";
import { useLanguage } from "@/i18n/useLanguage";

function useCountUp(target: number, active: boolean, duration = 1600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let raf: number;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);

  return value;
}

interface StatItemProps {
  value: number;
  suffix: string;
  label: string;
  active: boolean;
  instant: boolean;
}

function StatItem({ value, suffix, label, active, instant }: StatItemProps) {
  const animated = useCountUp(value, active && !instant);
  const display = instant ? value : animated;

  return (
    <div className="flex flex-col items-center gap-2 px-4 text-center lg:px-8">
      <p className="text-4xl font-bold text-white sm:text-5xl">
        {display}
        {suffix}
      </p>
      <p className="text-sm font-medium text-white/75">{label}</p>
    </div>
  );
}

export function Stats() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="stats"
      ref={ref}
      className="relative overflow-hidden bg-primary px-6 py-20 lg:px-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-white/5 blur-3xl"
      />

      <Reveal delay={0.08}>
        <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-y-10 lg:grid-cols-4 lg:divide-x lg:divide-white/15">
          {SCHOOL_STATS.map((stat) => (
            <StatItem
              key={stat.label.fr}
              {...stat}
              label={t(stat.label)}
              active={isInView}
              instant={!!prefersReducedMotion}
            />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
