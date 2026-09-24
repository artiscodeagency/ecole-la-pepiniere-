import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/ui/Reveal";
import { useSchool } from "@/data/useSchool";
import { type Localized, tr } from "@/i18n/types";
import { useLanguage } from "@/i18n/useLanguage";

interface Program {
  id: string;
  eyebrow: Localized;
  title: Localized;
  description: Localized;
  ctaLabel: Localized;
  imageContent: Localized;
  accent: "secondary" | "primary";
}

const PROGRAMS: Program[] = [
  {
    id: "maternelle",
    eyebrow: tr("Maternelle", "Nursery"),
    title: tr("Découvrir, jouer et grandir", "Discover, play and grow"),
    description: tr(
      "Un cadre chaleureux où les tout-petits découvrent le plaisir d'apprendre par le jeu, la créativité et les premières relations sociales.",
      "A warm setting where little ones discover the joy of learning through play, creativity and their first social relationships.",
    ),
    ctaLabel: tr("Découvrir la maternelle", "Discover the nursery"),
    imageContent: tr("enfants en maternelle", "children in nursery"),
    accent: "secondary",
  },
  {
    id: "primaire",
    eyebrow: tr("Primaire bilingue", "Bilingual primary"),
    title: tr(
      "Deux parcours pour apprendre et progresser",
      "Two pathways to learn and progress",
    ),
    description: tr(
      "Primaire francophone et primaire anglophone, selon le programme scolaire applicable.",
      "French-speaking primary and English-speaking primary, following the applicable school curriculum.",
    ),
    ctaLabel: tr("Découvrir le primaire", "Discover the primary school"),
    imageContent: tr("classe de primaire", "primary class"),
    accent: "primary",
  },
];

const ACCENT_CLASSES = {
  secondary: {
    badge: "bg-secondary-light text-secondary",
    cta: "text-secondary",
  },
  primary: { badge: "bg-primary-light text-primary", cta: "text-primary" },
} as const;

export function Programs() {
  const { t } = useLanguage();
  const school = useSchool();

  return (
    <section className="bg-surface px-6 py-24 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal delay={0.05}>
          <p className="text-sm font-medium tracking-wide text-primary">
            {school.slogan}
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">
            {t(
              "Un parcours adapté à chaque âge.",
              "A pathway suited to every age.",
            )}
          </h2>
        </Reveal>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl gap-8 lg:grid-cols-2 lg:gap-10">
        {PROGRAMS.map((program, index) => {
          const accent = ACCENT_CLASSES[program.accent];
          return (
            <Reveal key={program.id} delay={0.12 + index * 0.12}>
              <div
                id={program.id}
                className="group scroll-mt-24 overflow-hidden rounded-card bg-white shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-lg"
              >
                <div className="relative overflow-hidden">
                  <ImagePlaceholder
                    className="aspect-4/3 w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    content={t(program.imageContent)}
                  />
                  <div className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/10" />
                </div>

                <div className="p-8">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${accent.badge}`}
                  >
                    {t(program.eyebrow)}
                  </span>
                  <h3 className="mt-4 text-2xl font-bold text-ink">
                    {t(program.title)}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-ink-soft">
                    {t(program.description)}
                  </p>
                  <Link
                    to={`/${program.id}`}
                    className={`mt-6 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:underline ${accent.cta}`}
                  >
                    {t(program.ctaLabel)}
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
