import { ArrowLeft, ArrowRight, Eye, ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PageHero } from "@/components/ui/PageHero";
import { schoolImages } from "@/data/galleryImages";
import { useSchool } from "@/data/useSchool";
import { useLanguage } from "@/i18n/useLanguage";
import { useGalleryCategories, useGalleryPhotos } from "@/lib/api/publicGallery";
import { useApiText } from "@/lib/api/useApiText";
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

/** One photo of the grid, from the admin or from the photos built into the site. */
interface GalleryItem {
  key: string;
  src: string;
  /** Bigger version for the enlarged view. */
  full: string;
  title: string;
  /** Built-in photos are titled from their file name. */
  fromFileName: boolean;
}

const BUILT_IN_ITEMS: GalleryItem[] = schoolImages.map((image) => ({
  key: image.src,
  src: image.src,
  full: image.src,
  title: getDisplayName(image.name),
  fromFileName: true,
}));

export function GalleryPage() {
  const { t } = useLanguage();
  const text = useApiText();
  const school = useSchool();
  const [params, setParams] = useSearchParams();
  const category = params.get("categorie");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Photos from the admin as soon as there are some; until then (or when
  // the server cannot be reached) the photos built into the site.
  const categories = useGalleryCategories();
  const fromApi = (categories.data?.length ?? 0) > 0;
  const photos = useGalleryPhotos(category, fromApi);
  const loading = categories.isPending || (fromApi && photos.isPending);
  const items: GalleryItem[] = fromApi
    ? (photos.data?.pages.flatMap((page) => page.data) ?? []).map((photo) => ({
        key: String(photo.id),
        src: photo.media.urls.medium ?? photo.media.urls.original,
        full: photo.media.urls.large ?? photo.media.urls.original,
        title:
          text(photo.caption) ||
          text(photo.alt) ||
          text(photo.category?.name) ||
          t("Photo de l'école", "School photo"),
        fromFileName: false,
      }))
    : BUILT_IN_ITEMS;
  const total = fromApi
    ? (photos.data?.pages[0]?.meta.total ?? 0)
    : items.length;
  const activeCategory = categories.data?.find(
    (item) => item.slug === category,
  );
  const selectedImage = selectedIndex === null ? null : items[selectedIndex];

  const chooseCategory = (slug: string | null) => {
    setSelectedIndex(null);
    setParams(slug ? { categorie: slug } : {}, { preventScrollReset: true });
  };

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
          current === null ? null : (current + 1) % items.length,
        );
      }
      if (event.key === "ArrowLeft") {
        setSelectedIndex((current) =>
          current === null
            ? null
            : (current - 1 + items.length) % items.length,
        );
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedIndex, items.length]);

  const filters = [
    { slug: null, label: t("Toutes", "All") },
    ...(categories.data ?? []).map((item) => ({
      slug: item.slug,
      label: text(item.name),
    })),
  ];

  let grid;
  if (loading) {
    grid = (
      <div
        className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        aria-hidden="true"
      >
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="aspect-4/3 animate-pulse rounded-2xl bg-surface-alt"
          />
        ))}
      </div>
    );
  } else if (items.length === 0) {
    grid = (
      <div className="mt-10 rounded-2xl border border-border-soft bg-white p-8 text-center shadow-soft">
        <p className="font-semibold text-ink">
          {photos.isError
            ? t(
                "Les photos n'ont pas pu être chargées.",
                "The photos could not be loaded.",
              )
            : t(
                "Aucune photo dans cette catégorie pour le moment.",
                "No photos in this category at the moment.",
              )}
        </p>
        <button
          type="button"
          onClick={() =>
            photos.isError ? void photos.refetch() : chooseCategory(null)
          }
          className="mt-4 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
        >
          {photos.isError
            ? t("Réessayer", "Try again")
            : t("Voir toutes les photos", "See all photos")}
        </button>
      </div>
    );
  } else {
    grid = (
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((image, index) => (
          <button
            key={image.key}
            type="button"
            onClick={() => setSelectedIndex(index)}
            aria-label={`${t("Voir la photo", "View photo")}: ${image.title}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl text-left shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
          >
            <ImagePlaceholder
              src={image.src}
              className={cn(
                "h-full w-full",
                PHOTO_COLORS[index % PHOTO_COLORS.length],
              )}
              content={image.title}
            />
            <div className="absolute inset-0 bg-linear-to-t from-ink/65 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-95" />
            <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary shadow-soft transition-transform duration-300 group-hover:scale-110">
              <Eye size={17} />
            </span>
            <span
              className={cn(
                "absolute inset-x-0 bottom-0 truncate px-4 pb-4 text-sm font-medium text-white",
                image.fromFileName && "capitalize",
              )}
            >
              {image.title}
            </span>
          </button>
        ))}
      </div>
    );
  }

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
                  {activeCategory
                    ? text(activeCategory.name)
                    : t("Toutes les photos", "All photos")}
                </h2>
              </div>
              {!loading && (
                <p className="text-sm text-ink-soft">
                  {total > 1 ? `${total} photos` : `${total} photo`}
                </p>
              )}
            </div>

            {fromApi && (
              <div className="mt-8 flex flex-wrap gap-3">
                {filters.map((filter) => (
                  <button
                    key={filter.slug ?? "all"}
                    type="button"
                    aria-pressed={filter.slug === category}
                    onClick={() => chooseCategory(filter.slug)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
                      filter.slug === category
                        ? "border-primary bg-primary text-white shadow-soft"
                        : "border-border-soft bg-white text-ink-soft hover:border-primary/30 hover:text-primary",
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}

            {grid}

            {fromApi && photos.hasNextPage && (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => void photos.fetchNextPage()}
                  disabled={photos.isFetchingNextPage}
                  className="inline-flex items-center gap-2 rounded-btn border border-border-soft bg-white px-5 py-3 text-sm font-medium text-ink shadow-soft transition-colors hover:bg-surface-alt disabled:opacity-60"
                >
                  {photos.isFetchingNextPage && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {t("Voir plus de photos", "See more photos")}
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />

      {selectedImage && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.title}
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
                src={selectedImage.full}
                className="h-72 w-full bg-surface-alt md:h-full md:min-h-105"
                content={selectedImage.title}
              />
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <span className="flex w-fit items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary">
                  <ImagePlus size={14} />
                  {t(
                    `Photo ${selectedIndex + 1} sur ${total}`,
                    `Photo ${selectedIndex + 1} of ${total}`,
                  )}
                </span>
                <h2
                  className={cn(
                    "mt-4 break-words text-2xl font-bold text-ink",
                    selectedImage.fromFileName && "capitalize",
                  )}
                >
                  {selectedImage.title}
                </h2>
                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    aria-label={t("Image précédente", "Previous image")}
                    onClick={() =>
                      setSelectedIndex(
                        (selectedIndex - 1 + items.length) % items.length,
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
                      setSelectedIndex((selectedIndex + 1) % items.length)
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
