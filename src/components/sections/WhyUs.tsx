import {
  GraduationCap,
  Heart,
  ShieldCheck,
  Sparkles,
  Sprout,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";

interface Reason {
  icon: LucideIcon;
  title: string;
  description: string;
  iconClass: string;
}

const REASONS: Reason[] = [
  {
    icon: Heart,
    title: "Bienveillance",
    description:
      "Une écoute attentive et un accompagnement individualisé pour chaque enfant.",
    iconClass: "bg-accent-coral/10 text-accent-coral",
  },
  {
    icon: ShieldCheck,
    title: "Sécurité",
    description:
      "Un environnement sécurisé et surveillé à chaque instant de la journée.",
    iconClass: "bg-primary-light text-primary",
  },
  {
    icon: GraduationCap,
    title: "Excellence pédagogique",
    description:
      "Des méthodes d'enseignement rigoureuses et adaptées à chaque âge.",
    iconClass: "bg-primary-light text-primary",
  },
  {
    icon: Sparkles,
    title: "Activités enrichissantes",
    description:
      "Sport, arts, lecture et découvertes pour éveiller toutes les curiosités.",
    iconClass: "bg-accent-yellow/15 text-accent-yellow",
  },
  {
    icon: Users,
    title: "Encadrement attentif",
    description:
      "Des équipes formées, présentes et disponibles pour les familles.",
    iconClass: "bg-secondary-light text-secondary",
  },
  {
    icon: Sprout,
    title: "Épanouissement",
    description: "Un cadre qui valorise la confiance en soi et l'autonomie.",
    iconClass: "bg-secondary-light text-secondary",
  },
];

export function WhyUs() {
  return (
    <section className="relative overflow-hidden bg-surface-alt px-6 py-24 lg:px-10 lg:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-12 h-32 w-32 rounded-[58%_42%_55%_45%] bg-secondary/10"
      />
      <div className="mx-auto max-w-2xl text-center">
        <Reveal delay={0.05}>
          <h2 className="text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Un environnement pensé pour{" "}
            <span className="text-primary">faire grandir</span> chaque enfant.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <div
            aria-hidden
            className="mx-auto mt-5 h-1.5 w-16 rotate-2 rounded-full bg-accent-coral/60"
          />
        </Reveal>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {REASONS.map(({ icon: Icon, title, description, iconClass }, index) => (
          <Reveal key={title} delay={0.14 + index * 0.09}>
            <div className="rounded-card border border-border-soft bg-white p-8 transition-shadow duration-300 hover:shadow-soft">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full ${iconClass}`}
              >
                <Icon size={22} strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
