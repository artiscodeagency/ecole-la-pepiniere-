import { BookOpen, Heart, Sprout } from "lucide-react";

import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/ui/Reveal";
import { useSchool } from "@/data/useSchool";
import { useLanguage } from "@/i18n/useLanguage";

const VALUES = [
  {
    icon: Heart,
    label: "Bienveillance",
    iconClass: "bg-accent-coral/10 text-accent-coral",
  },
  {
    icon: BookOpen,
    label: "Excellence",
    iconClass: "bg-primary-light text-primary",
  },
  {
    icon: Sprout,
    label: "Épanouissement",
    iconClass: "bg-secondary-light text-secondary",
  },
];

export function Welcome() {
  const { t } = useLanguage();
  const school = useSchool();

  return (
    <section
      id="notre-ecole"
      className="relative scroll-mt-24 overflow-hidden bg-surface px-6 py-24 lg:px-10 lg:py-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-16 h-36 w-52 rotate-12 rounded-[48%_52%_42%_58%] bg-accent-yellow/10"
      />
      <div className="mx-auto max-w-3xl text-center">
        <Reveal delay={0.05}>
          <p className="text-sm font-medium tracking-wide text-primary">
            {school.name}
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">
            {t(
              "Une éducation bilingue pour grandir avec",
              "A bilingual education to grow with",
            )}{" "}
            <span className="relative inline-block text-secondary">
              {t("discipline et confiance", "discipline and confidence")}
              <span
                aria-hidden
                className="absolute -bottom-2 left-1/2 h-1.5 w-4/5 -translate-x-1/2 -rotate-2 rounded-full bg-accent-yellow/60"
              />
            </span>
            .
          </h2>
        </Reveal>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal delay={0.15}>
          <ImagePlaceholder
            className="aspect-4/5 w-full rounded-image shadow-soft"
            content={t("enseignant avec des enfants", "teacher with children")}
          />
        </Reveal>

        <Reveal delay={0.22}>
          <div>
            <p className="text-lg leading-relaxed text-ink-soft">
              {school.vision}
            </p>

            <div className="mt-10 flex flex-wrap gap-8">
              {school.values.slice(0, 3).map((label, index) => {
                const value = VALUES[index];
                const Icon = value.icon;
                return (
                  <div
                    key={label}
                    className="flex items-center gap-3"
                    style={{ transitionDelay: `${index * 90}ms` }}
                  >
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full ${value.iconClass}`}
                    >
                      <Icon size={20} strokeWidth={1.75} />
                    </span>
                    <span className="text-sm font-medium text-ink">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-3 right-[14%] h-4 w-28 -rotate-3 rounded-[68%_32%_54%_46%] bg-secondary/15"
      />
    </section>
  );
}
