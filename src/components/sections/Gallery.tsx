import { ArrowUpRight, ImagePlus, X } from "lucide-react";
import { useState } from "react";

import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/ui/Reveal";
import { useSchool } from "@/data/useSchool";
import { useLanguage } from "@/i18n/useLanguage";
import { cn } from "@/lib/utils";

/** "all", or the index of a category in `school.gallery.categories`. */
type GalleryFilter = "all" | number;

export function Gallery() {
  const { t } = useLanguage();
  const school = useSchool();
  const categories = school.gallery.categories;
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const filters: { id: GalleryFilter; label: string }[] = [
    { id: "all", label: t("Toutes", "All") },
    ...categories.map((label, index) => ({ id: index, label })),
  ];
  const visibleCategories = categories
    .map((label, index) => ({ label, index }))
    .filter(({ index }) => activeFilter === "all" || index === activeFilter);
  const selectedLabel =
    selectedCategory === null ? null : categories[selectedCategory];
  const photoPlaceholder = t("photo officielle à intégrer", "official photo to be added");

  return (
    <section id="galerie" className="bg-surface px-6 py-24 lg:px-10 lg:py-32">
      <Reveal delay={0.05}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-wide text-primary">
            {t("GALERIE", "GALLERY")}
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">
            {t("La vie à La Pépinière", "Life at La Pépinière")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            {t(
              "Les photos officielles de l'établissement seront ajoutées progressivement.",
              "The school's official photos will be added gradually.",
            )}
          </p>
        </div>
      </Reveal>
      <Reveal delay={0.12}>
        <div className="mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-center gap-3">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
                activeFilter === filter.id
                  ? "border-primary bg-primary text-white shadow-soft"
                  : "border-border-soft bg-white text-ink-soft hover:border-primary/30 hover:text-primary",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </Reveal>
      <Reveal delay={0.18}>
        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-45">
          {visibleCategories.map(({ label, index: categoryIndex }, index) => (
            <button
              key={categoryIndex}
              type="button"
              onClick={() => setSelectedCategory(categoryIndex)}
              className={cn(
                "group relative overflow-hidden rounded-image text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg",
                index === 0 && "sm:col-span-2 lg:col-span-2",
                index === 3 && "lg:row-span-2",
              )}
            >
              <ImagePlaceholder
                className="h-full min-h-60 w-full transition-transform duration-500 group-hover:scale-[1.04]"
                content={`${photoPlaceholder} · ${label}`}
              />
              <div className="absolute inset-0 bg-linear-to-t from-ink/75 via-ink/15 to-transparent" />
              <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition-transform duration-300 group-hover:scale-105">
                <ArrowUpRight size={18} />
              </span>
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <span className="inline-flex rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink">
                  {label}
                </span>
                <p className="mt-3 text-base font-semibold text-white">
                  {t("Photo à intégrer", "Photo to be added")}
                </p>
              </div>
            </button>
          ))}
        </div>
      </Reveal>
      {selectedLabel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
          onClick={() => setSelectedCategory(null)}
          role="dialog"
          aria-modal="true"
          aria-label={selectedLabel}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-soft-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label={t("Fermer la galerie", "Close the gallery")}
              onClick={() => setSelectedCategory(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition-opacity hover:opacity-90"
            >
              <X size={18} />
            </button>
            <div className="grid md:grid-cols-[1.3fr_0.7fr]">
              <ImagePlaceholder
                className="h-80 w-full md:h-full md:min-h-105"
                content={`${photoPlaceholder} · ${selectedLabel}`}
              />
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <span className="flex w-fit items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary">
                  <ImagePlus size={14} />
                  {selectedLabel}
                </span>
                <h3 className="mt-4 text-2xl font-bold text-ink">
                  {t("Photo à intégrer", "Photo to be added")}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-ink-soft">
                  {t(
                    "Cet emplacement est réservé à une photographie officielle de l'établissement.",
                    "This space is reserved for an official photograph of the school.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
