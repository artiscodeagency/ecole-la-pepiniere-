import { ArrowLeft, ArrowRight, Eye, ImagePlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PageHero } from "@/components/ui/PageHero";
import { SCHOOL } from "@/data/school";
import { useSchool } from "@/data/useSchool";
import { useLanguage } from "@/i18n/useLanguage";
import { usePageMeta } from "@/lib/usePageMeta";
import { cn } from "@/lib/utils";

/** "all", or the index of a category in `school.gallery.categories`. */
type GalleryFilter = "all" | number;
interface GalleryItem { id: number; categoryIndex: number; color: string; }

// Every language lists the same categories in the same order, so items only store the index.
const GALLERY_ITEMS: GalleryItem[] = SCHOOL.fr.gallery.categories.map((_, index) => ({
  id: index + 1,
  categoryIndex: index,
  color: ["bg-accent-yellow/20", "bg-primary-light", "bg-accent-coral/15", "bg-secondary-light"][index % 4],
}));

export function GalleryPage() {
  const { t } = useLanguage();
  const school = useSchool();
  const categories = school.gallery.categories;
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>("all");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const visibleItems = useMemo(() => activeFilter === "all" ? GALLERY_ITEMS : GALLERY_ITEMS.filter((item) => item.categoryIndex === activeFilter), [activeFilter]);
  const selectedItem = selectedIndex === null ? null : visibleItems[selectedIndex];
  const filters: { id: GalleryFilter; label: string }[] = [{ id: "all", label: t("Toutes", "All") }, ...categories.map((label, index) => ({ id: index, label }))];

  usePageMeta(
    `${t("Galerie", "Gallery")} | ${school.shortName} — ${school.location.city}, ${school.location.country}`,
    t(
      "Galerie du Groupe Scolaire Privé Bilingue La Pépinière à Bertoua : bâtiments, salles de classe, activités, excursions et événements de l'école.",
      "Gallery of La Pépinière Bilingual Private School Group in Bertoua: buildings, classrooms, activities, excursions and school events.",
    ),
  );

  useEffect(() => {
    if (!selectedItem) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedIndex(null);
      if (event.key === "ArrowRight") setSelectedIndex((current) => current === null ? null : (current + 1) % visibleItems.length);
      if (event.key === "ArrowLeft") setSelectedIndex((current) => current === null ? null : (current - 1 + visibleItems.length) % visibleItems.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKeyDown); };
  }, [selectedItem, visibleItems.length]);

  const selectFilter = (filter: GalleryFilter) => { setSelectedIndex(null); setActiveFilter(filter); };
  const imageContent = (categoryIndex: number) => `${t("photo officielle à intégrer", "official photo to be added")} · ${categories[categoryIndex]}`;

  return (
    <>
      <Header />
      <main>
        <PageHero eyebrow={t("GALERIE", "GALLERY")} title={t("La vie de La Pépinière en images.", "Life at La Pépinière in pictures.")} description={t("Découvrez les catégories qui composeront la galerie officielle de l'école.", "Discover the categories that will make up the school's official gallery.")} imageLabel={t("moments de vie scolaire", "moments of school life")} />
        <section className="relative overflow-hidden bg-surface px-6 py-20 lg:px-10 lg:py-28">
          <div aria-hidden className="pointer-events-none absolute -left-10 top-28 h-40 w-32 -rotate-12 rounded-[50%_50%_62%_38%] bg-accent-yellow/12" />
          <div aria-hidden className="pointer-events-none absolute right-[10%] top-16 h-5 w-5 rounded-full bg-accent-coral/35 shadow-[18px_22px_0_rgba(50,183,104,0.2),-14px_40px_0_rgba(245,185,66,0.22)]" />
          <div className="relative mx-auto max-w-6xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div><p className="text-sm font-medium tracking-[0.18em] text-primary">{t("GALERIE OFFICIELLE", "OFFICIAL GALLERY")}</p><h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">{t("Les univers de", "The worlds of")} <span className="text-secondary">La Pépinière</span>.</h2></div>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              {filters.map((filter) => <button key={filter.id} type="button" onClick={() => selectFilter(filter.id)} className={cn("rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5", activeFilter === filter.id ? "border-primary bg-primary text-white shadow-soft" : "border-border-soft bg-white text-ink-soft hover:border-primary/30 hover:text-primary")}>{filter.label}</button>)}
            </div>
            <div className="mt-12 grid auto-rows-42.5 grid-cols-2 gap-4 sm:auto-rows-47.5 md:grid-cols-4 lg:auto-rows-52.5">
              {visibleItems.map((item, index) => (
                <button key={item.id} type="button" onClick={() => setSelectedIndex(index)} className={cn("group relative overflow-hidden text-left shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft-lg", index % 3 === 0 && "rounded-[30px_14px_30px_14px]", index % 3 === 1 && "rounded-[14px_30px_14px_30px]", index % 3 === 2 && "rounded-3xl", index === 0 && "col-span-2 row-span-2", index === 3 && "row-span-2", index === 5 && "col-span-2", index === 7 && "col-span-2")}>
                  <ImagePlaceholder className={cn("h-full w-full", item.color)} content={imageContent(item.categoryIndex)} />
                  <div className="absolute inset-0 bg-linear-to-t from-ink/75 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-90" />
                  <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-primary shadow-soft transition-transform duration-300 group-hover:scale-110"><Eye size={18} /></span>
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5"><span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink">{categories[item.categoryIndex]}</span><h3 className="mt-3 text-base font-semibold text-white">{t("Photo à intégrer", "Photo to be added")}</h3></div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      {selectedItem && selectedIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={categories[selectedItem.categoryIndex]} onClick={() => setSelectedIndex(null)}>
          <div className="relative w-full max-w-4xl overflow-hidden rounded-[34px_18px_34px_18px] border-4 border-white bg-white shadow-soft-lg" onClick={(event) => event.stopPropagation()}>
            <button type="button" aria-label={t("Fermer la galerie", "Close the gallery")} onClick={() => setSelectedIndex(null)} className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft hover:text-primary"><X size={18} /></button>
            <div className="grid md:grid-cols-[1.3fr_0.7fr]">
              <ImagePlaceholder className={cn("h-72 w-full md:h-full md:min-h-105", selectedItem.color)} content={imageContent(selectedItem.categoryIndex)} />
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <span className="flex w-fit items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary"><ImagePlus size={14} />{categories[selectedItem.categoryIndex]}</span>
                <h2 className="mt-4 text-2xl font-bold text-ink">{t("Photo à intégrer", "Photo to be added")}</h2>
                <p className="mt-4 text-sm leading-relaxed text-ink-soft">{t(`Cet emplacement est prêt à recevoir une photographie officielle de l'établissement pour la catégorie « ${categories[selectedItem.categoryIndex]} ».`, `This space is ready to receive an official photograph of the school for the “${categories[selectedItem.categoryIndex]}” category.`)}</p>
                <div className="mt-8 flex gap-3">
                  <button type="button" aria-label={t("Image précédente", "Previous image")} onClick={() => setSelectedIndex((selectedIndex - 1 + visibleItems.length) % visibleItems.length)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border-soft text-ink transition-colors hover:border-primary hover:text-primary"><ArrowLeft size={17} /></button>
                  <button type="button" aria-label={t("Image suivante", "Next image")} onClick={() => setSelectedIndex((selectedIndex + 1) % visibleItems.length)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border-soft text-ink transition-colors hover:border-primary hover:text-primary"><ArrowRight size={17} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
