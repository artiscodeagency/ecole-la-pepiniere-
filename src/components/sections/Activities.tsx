import {
  BookOpen,
  Dumbbell,
  Laptop,
  MapPin,
  Palette,
  PartyPopper,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/ui/Reveal";
import { type Localized, tr } from "@/i18n/types";
import { useLanguage } from "@/i18n/useLanguage";
import { cn } from "@/lib/utils";

interface Activity {
  label: Localized;
  icon: LucideIcon;
  imageContent: Localized;
  featured?: boolean;
}

const ACTIVITIES: Activity[] = [
  {
    label: tr("Sport", "Sport"),
    icon: Dumbbell,
    imageContent: tr("enfants faisant du sport", "children playing sport"),
    featured: true,
  },
  {
    label: tr("Arts & créativité", "Arts & creativity"),
    icon: Palette,
    imageContent: tr("atelier créatif", "creative workshop"),
  },
  {
    label: tr("Lecture", "Reading"),
    icon: BookOpen,
    imageContent: tr("coin lecture", "reading corner"),
  },
  {
    label: tr("Informatique", "Computing"),
    icon: Laptop,
    imageContent: tr("atelier informatique", "computer workshop"),
  },
  {
    label: tr("Sorties éducatives", "Educational outings"),
    icon: MapPin,
    imageContent: tr("sortie scolaire", "school trip"),
    featured: true,
  },
  {
    label: tr("Événements scolaires", "School events"),
    icon: PartyPopper,
    imageContent: tr("fête d'école", "school celebration"),
  },
];

export function Activities() {
  const { t } = useLanguage();

  return (
    <section
      id="vie-scolaire"
      className="scroll-mt-24 bg-surface px-6 py-24 lg:px-10 lg:py-32"
    >
      <div className="mx-auto max-w-2xl text-center">
        <Reveal delay={0.05}>
          <p className="text-sm font-medium tracking-wide text-primary">
            {t("VIE SCOLAIRE", "SCHOOL LIFE")}
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">
            {t(
              "Apprendre ne se limite pas à la salle de classe.",
              "Learning goes beyond the classroom.",
            )}
          </h2>
        </Reveal>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {ACTIVITIES.map(
          ({ label, icon: Icon, imageContent, featured }, index) => (
            <Reveal key={label.fr} delay={0.12 + index * 0.09}>
              <div
                className={cn(
                  "group relative overflow-hidden rounded-image",
                  featured && "lg:col-span-2",
                )}
              >
                <ImagePlaceholder
                  className="h-72 w-full transition-transform duration-500 ease-out group-hover:scale-[1.04] lg:h-80"
                  content={t(imageContent)}
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/70 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <span className="text-base font-semibold text-white">
                    {t(label)}
                  </span>
                </div>
              </div>
            </Reveal>
          ),
        )}
      </div>
    </section>
  );
}
