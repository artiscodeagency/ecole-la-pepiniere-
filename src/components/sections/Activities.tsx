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
import { cn } from "@/lib/utils";

interface Activity {
  label: string;
  icon: LucideIcon;
  imageContent: string;
  featured?: boolean;
}

const ACTIVITIES: Activity[] = [
  {
    label: "Sport",
    icon: Dumbbell,
    imageContent: "enfants faisant du sport",
    featured: true,
  },
  {
    label: "Arts & créativité",
    icon: Palette,
    imageContent: "atelier créatif",
  },
  { label: "Lecture", icon: BookOpen, imageContent: "coin lecture" },
  { label: "Informatique", icon: Laptop, imageContent: "atelier informatique" },
  {
    label: "Sorties éducatives",
    icon: MapPin,
    imageContent: "sortie scolaire",
    featured: true,
  },
  {
    label: "Événements scolaires",
    icon: PartyPopper,
    imageContent: "fête d'école",
  },
];

export function Activities() {
  return (
    <section
      id="vie-scolaire"
      className="scroll-mt-24 bg-surface px-6 py-24 lg:px-10 lg:py-32"
    >
      <div className="mx-auto max-w-2xl text-center">
        <Reveal delay={0.05}>
          <p className="text-sm font-medium tracking-wide text-primary">
            VIE SCOLAIRE
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Apprendre ne se limite pas à la salle de classe.
          </h2>
        </Reveal>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {ACTIVITIES.map(
          ({ label, icon: Icon, imageContent, featured }, index) => (
            <Reveal key={label} delay={0.12 + index * 0.09}>
              <div
                className={cn(
                  "group relative overflow-hidden rounded-image",
                  featured && "lg:col-span-2",
                )}
              >
                <ImagePlaceholder
                  className="h-72 w-full transition-transform duration-500 ease-out group-hover:scale-[1.04] lg:h-80"
                  content={imageContent}
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/70 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <span className="text-base font-semibold text-white">
                    {label}
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
