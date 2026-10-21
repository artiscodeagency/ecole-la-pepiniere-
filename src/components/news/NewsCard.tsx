import { ArrowRight, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";

import { useLanguage } from "@/i18n/useLanguage";
import type { NewsSummary, PublicImage } from "@/lib/api/publicNews";
import { useApiText, useLongDate } from "@/lib/api/useApiText";
import { cn } from "@/lib/utils";

/** The cover in the size the card needs; a soft panel when there is none or it fails to load. */
export function NewsCover({ image, className, sizes }: { image: PublicImage | null; className?: string; sizes: string }) {
  const text = useApiText();
  if (!image) {
    return (
      <div className={cn("flex items-center justify-center bg-primary-light text-primary/60", className)} aria-hidden="true">
        <Newspaper size={40} strokeWidth={1.4} />
      </div>
    );
  }
  const { thumb, medium, large, original } = image.urls;
  const srcSet = [thumb && `${thumb} 400w`, medium && `${medium} 1024w`, large && `${large} 1920w`].filter(Boolean).join(", ");
  return (
    <img
      src={medium ?? original}
      srcSet={srcSet || undefined}
      sizes={sizes}
      alt={text(image.alt)}
      loading="lazy"
      decoding="async"
      className={cn("bg-primary-light object-cover", className)}
      onError={(event) => {
        // A missing file shows the panel colour instead of a broken image.
        event.currentTarget.removeAttribute("srcset");
        event.currentTarget.style.visibility = "hidden";
      }}
    />
  );
}

export function NewsCard({ news }: { news: NewsSummary }) {
  const { t } = useLanguage();
  const text = useApiText();
  const longDate = useLongDate();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px_16px_28px_16px] border border-border-soft bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
      <Link to={`/actualites/${news.slug}`} className="flex h-full flex-col" aria-label={text(news.title)}>
        <div className="aspect-16/10 overflow-hidden bg-primary-light">
          <NewsCover
            image={news.cover}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-ink-soft">
            {news.category && <span className="rounded-full bg-secondary-light px-2.5 py-1 font-semibold text-secondary">{text(news.category.name)}</span>}
            <time dateTime={news.published_at}>{longDate(news.published_at)}</time>
          </p>
          <h3 className="mt-4 text-lg font-bold leading-snug text-ink">{text(news.title)}</h3>
          {text(news.excerpt) && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-soft">{text(news.excerpt)}</p>}
          <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-primary transition-colors group-hover:text-primary-dark">
            {t("Lire l'article", "Read the article")} <ArrowRight size={16} aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
}
