import { ImageIcon } from "lucide-react";

import { useLanguage } from "@/i18n/useLanguage";
import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  className?: string;
  /** Describes the real photo that should eventually replace this block. */
  content?: string;
}

export function ImagePlaceholder({
  className,
  content,
}: ImagePlaceholderProps) {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        "group relative overflow-hidden bg-linear-to-br from-primary-light via-surface-alt to-secondary-light",
        className,
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-105">
        <ImageIcon className="h-12 w-12 text-primary/15" strokeWidth={1.5} />
      </div>
      <span className="absolute left-3 top-3 max-w-[42%] truncate rounded-full bg-white/85 px-3 py-1 text-[11px] font-medium text-ink-soft backdrop-blur-sm">
        {t("Photo à intégrer", "Photo to be added")}
        {content ? ` · ${content}` : ""}
      </span>
    </div>
  );
}
