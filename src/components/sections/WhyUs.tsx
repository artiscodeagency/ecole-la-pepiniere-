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
import { type Localized, tr } from "@/i18n/types";
import { useLanguage } from "@/i18n/useLanguage";

interface Reason {
  icon: LucideIcon;
  title: Localized;
  description: Localized;
  iconClass: string;
}

const REASONS: Reason[] = [
  {
    icon: Heart,
    title: tr("Bienveillance", "Kindness"),
    description: tr(
      "Une écoute attentive et un accompagnement individualisé pour chaque enfant.",
      "Attentive listening and individual support for every child.",
    ),
    iconClass: "bg-accent-coral/10 text-accent-coral",
  },
  {
    icon: ShieldCheck,
    title: tr("Sécurité", "Safety"),
    description: tr(
      "Un environnement sécurisé et surveillé à chaque instant de la journée.",
      "A secure environment, supervised at every moment of the day.",
    ),
    iconClass: "bg-primary-light text-primary",
  },
  {
    icon: GraduationCap,
    title: tr("Excellence pédagogique", "Academic excellence"),
    description: tr(
      "Des méthodes d'enseignement rigoureuses et adaptées à chaque âge.",
      "Rigorous teaching methods suited to every age.",
    ),
    iconClass: "bg-primary-light text-primary",
  },
  {
    icon: Sparkles,
    title: tr("Activités enrichissantes", "Enriching activities"),
    description: tr(
      "Sport, arts, lecture et découvertes pour éveiller toutes les curiosités.",
      "Sport, arts, reading and discovery to awaken every kind of curiosity.",
    ),
    iconClass: "bg-accent-yellow/15 text-accent-yellow",
  },
  {
    icon: Users,
    title: tr("Encadrement attentif", "Caring supervision"),
    description: tr(
      "Des équipes formées, présentes et disponibles pour les familles.",
      "Trained teams who are present and available for families.",
    ),
    iconClass: "bg-secondary-light text-secondary",
  },
  {
    icon: Sprout,
    title: tr("Épanouissement", "Personal growth"),
    description: tr(
      "Un cadre qui valorise la confiance en soi et l'autonomie.",
      "A setting that nurtures self-confidence and independence.",
    ),
    iconClass: "bg-secondary-light text-secondary",
  },
];

export function WhyUs() {
  const { lang, t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-surface-alt px-6 py-24 lg:px-10 lg:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-12 h-32 w-32 rounded-[58%_42%_55%_45%] bg-secondary/10"
      />
      <div className="mx-auto max-w-2xl text-center">
        <Reveal delay={0.05}>
          <h2 className="text-3xl font-bold leading-tight text-ink sm:text-4xl">
            {lang === "fr" ? (
              <>
                Un environnement pensé pour{" "}
                <span className="text-primary">faire grandir</span> chaque
                enfant.
              </>
            ) : (
              <>
                An environment designed to help every child{" "}
                <span className="text-primary">grow</span>.
              </>
            )}
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
          <Reveal key={title.fr} delay={0.14 + index * 0.09}>
            <div className="rounded-card border border-border-soft bg-white p-8 transition-shadow duration-300 hover:shadow-soft">
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full ${iconClass}`}
              >
                <Icon size={22} strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink">
                {t(title)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {t(description)}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
