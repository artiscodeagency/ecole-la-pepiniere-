import { ArrowLeft, ArrowRight, Eye, ImagePlus, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PageHero } from "@/components/ui/PageHero";
import { schoolImages } from "@/data/galleryImages";
import { useSchool } from "@/data/useSchool";
import { useLanguage } from "@/i18n/useLanguage";
import { usePageMeta } from "@/lib/usePageMeta";
import { cn } from "@/lib/utils";

const PHOTO_COLORS = [
  "bg-accent-yellow/20",
  "bg-primary-light",
  "bg-accent-coral/15",
  "bg-secondary-light",
];

function getDisplayName(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function GalleryPage() {
  const { t } = useLanguage();
  const school = useSchool();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedImage =
    selectedIndex === null ? null : schoolImages[selectedIndex];

  usePageMeta(
    `${t("Galerie", "Gallery")} | ${school.shortName} — ${school.location.city}, ${school.location.country}`,
    t(
      "Galerie photo du Groupe Scolaire Privé Bilingue La Pépinière à Bertoua.",
      "Photo gallery of La Pépinière Bilingual Private School Group in Bertoua.",
    ),
  );

  useEffect(() => {
    if (selectedIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedIndex(null);
      if (event.key === "ArrowRight") {
        setSelectedIndex((current) =>
          current === null ? null : (current + 1) % schoolImages.length,
        );
      }
      if (event.key === "ArrowLeft") {
        setSelectedIndex((current) =>
          current === null
            ? null
            : (current - 1 + schoolImages.length) % schoolImages.length,
        );
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedIndex]);

  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow={t("GALERIE", "GALLERY")}
          title={t(
            "La vie de La Pépinière en images.",
            "Life at La Pépinière in pictures.",
          )}
          description={t(
            "Parcourez toutes les photos de notre établissement.",
            "Browse all the photos of our school.",
          )}
          imageLabel={t("moments de vie scolaire", "moments of school life")}
        />
        <section className="bg-surface px-6 py-20 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium tracking-[0.18em] text-primary">
                  {t("GALERIE COMPLÈTE", "COMPLETE GALLERY")}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  {t("Toutes les photos", "All photos")}
                </h2>
              </div>
              <p className="text-sm text-ink-soft">
                {t(
                  `${schoolImages.length} photos`,
                  `${schoolImages.length} photos`,
                )}
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {schoolImages.map((image, index) => {
                const displayName = getDisplayName(image.name);

                return (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    aria-label={`${t("Voir la photo", "View photo")}: ${displayName}`}
                    className="group relative aspect-[4/3] overflow-hidden rounded-2xl text-left shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
                  >
                    <ImagePlaceholder
                      src={image.src}
                      className={cn(
                        "h-full w-full",
                        PHOTO_COLORS[index % PHOTO_COLORS.length],
                      )}
                      content={displayName}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-ink/65 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-95" />
                    <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary shadow-soft transition-transform duration-300 group-hover:scale-110">
                      <Eye size={17} />
                    </span>
                    <span className="absolute inset-x-0 bottom-0 truncate px-4 pb-4 text-sm font-medium capitalize text-white">
                      {displayName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {selectedImage && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={getDisplayName(selectedImage.name)}
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-3xl border-4 border-white bg-white shadow-soft-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label={t("Fermer la galerie", "Close the gallery")}
              onClick={() => setSelectedIndex(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft hover:text-primary"
            >
              <X size={18} />
            </button>
            <div className="grid md:grid-cols-[1.3fr_0.7fr]">
              <ImagePlaceholder
                src={selectedImage.src}
                className="h-72 w-full bg-surface-alt md:h-full md:min-h-105"
                content={getDisplayName(selectedImage.name)}
              />
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <span className="flex w-fit items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary">
                  <ImagePlus size={14} />
                  {t(
                    `Photo ${selectedIndex + 1} sur ${schoolImages.length}`,
                    `Photo ${selectedIndex + 1} of ${schoolImages.length}`,
                  )}
                </span>
                <h2 className="mt-4 break-words text-2xl font-bold capitalize text-ink">
                  {getDisplayName(selectedImage.name)}
                </h2>
                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    aria-label={t("Image précédente", "Previous image")}
                    onClick={() =>
                      setSelectedIndex(
                        (selectedIndex - 1 + schoolImages.length) %
                          schoolImages.length,
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border-soft text-ink transition-colors hover:border-primary hover:text-primary"
                  >
                    <ArrowLeft size={17} />
                  </button>
                  <button
                    type="button"
                    aria-label={t("Image suivante", "Next image")}
                    onClick={() =>
                      setSelectedIndex((selectedIndex + 1) % schoolImages.length)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border-soft text-ink transition-colors hover:border-primary hover:text-primary"
                  >
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
