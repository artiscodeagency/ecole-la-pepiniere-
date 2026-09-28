import { getImageForTitle, schoolImages } from "@/data/galleryImages";
import { useLanguage } from "@/i18n/useLanguage";
import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  className?: string;
  /** Describes the real photo that should eventually replace this block. */
  content?: string;
  src?: string;
}

export function ImagePlaceholder({
  className,
  content,
  src,
}: ImagePlaceholderProps) {
  const { t } = useLanguage();
  const imageSrc =
    src ??
    getImageForTitle(content)?.src ??
    schoolImages.find((image) =>
      /teacher|child|school-building|little-children|children/i.test(image.name),
    )?.src ??
    schoolImages[0]?.src;

  return (
    <div
      className={cn(
        "group relative overflow-hidden bg-linear-to-br from-primary-light via-surface-alt to-secondary-light",
        className,
      )}
    >
      {imageSrc ? (
        <>
          <img
            src={imageSrc}
            alt={content ?? t("Photo de l'école", "School photo")}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-linear-to-t from-ink/65 via-ink/10 to-transparent" />
        </>
      ) : null}
    </div>
  );
}
