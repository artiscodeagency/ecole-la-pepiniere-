import { ArrowLeft, Check, Link2, Loader2, MessageCircle, Newspaper, RotateCcw, Share2 } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { NewsCard, NewsCover } from "@/components/news/NewsCard";
import { Reveal } from "@/components/ui/Reveal";
import { useSchool } from "@/data/useSchool";
import { useLanguage } from "@/i18n/useLanguage";
import { type NewsArticle, useNewsArticle, useNewsList } from "@/lib/api/publicNews";
import { useApiText, useLongDate } from "@/lib/api/useApiText";
import { usePageMeta } from "@/lib/usePageMeta";

const shareButtonClasses =
  "inline-flex items-center gap-2 rounded-btn border border-border-soft bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-soft transition-colors hover:bg-surface-alt";

function ShareLinks({ title }: { title: string }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const url = window.location.href;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-semibold text-ink">{t("Partager :", "Share:")}</span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={shareButtonClasses}
      >
        <MessageCircle size={16} aria-hidden="true" />
        WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={shareButtonClasses}
      >
        <Share2 size={16} aria-hidden="true" />
        Facebook
      </a>
      <button
        type="button"
        className={shareButtonClasses}
        onClick={() => {
          void navigator.clipboard?.writeText(url).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2500);
          });
        }}
      >
        {copied ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
        <span aria-live="polite">{copied ? t("Lien copié", "Link copied") : t("Copier le lien", "Copy link")}</span>
      </button>
    </div>
  );
}

function MoreNews({ currentId }: { currentId: number }) {
  const { t } = useLanguage();
  const news = useNewsList(null);
  const others = (news.data?.pages[0]?.data ?? []).filter((item) => item.id !== currentId).slice(0, 3);
  if (others.length === 0) return null;

  return (
    <section className="bg-surface-alt px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">{t("Autres actualités", "More news")}</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Article({ article }: { article: NewsArticle }) {
  const { lang, t } = useLanguage();
  const text = useApiText();
  const longDate = useLongDate();
  const frenchOnly = lang === "en" && !article.body.en;
  const title = text(article.title);

  return (
    <>
      <article className="relative overflow-hidden bg-surface px-6 pt-14 pb-20 lg:px-10 lg:pt-20 lg:pb-28">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 top-40 h-36 w-28 -rotate-12 rounded-[52%_48%_60%_40%] bg-accent-yellow/15"
        />
        <div className="relative mx-auto max-w-3xl">
          <Link
            to="/actualites"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {t("Toutes les actualités", "All news")}
          </Link>
          <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-ink-soft">
            {article.category && (
              <Link
                to={`/actualites?rubrique=${article.category.slug}`}
                className="rounded-full bg-secondary-light px-3 py-1 font-semibold text-secondary transition-colors hover:bg-secondary/20"
              >
                {text(article.category.name)}
              </Link>
            )}
            <time dateTime={article.published_at}>{longDate(article.published_at)}</time>
          </p>
          <h1 className="mt-5 text-3xl font-bold leading-tight text-ink sm:text-4xl lg:text-5xl">{title}</h1>
          {text(article.excerpt) && <p className="mt-6 text-lg leading-relaxed text-ink-soft">{text(article.excerpt)}</p>}
        </div>

        {article.cover && (
          <Reveal delay={0.08}>
            <div className="relative mx-auto mt-12 max-w-5xl overflow-hidden rounded-[32px_18px_32px_18px] shadow-soft-lg">
              <NewsCover image={article.cover} sizes="(min-width: 1024px) 1024px, 100vw" className="aspect-16/9 w-full" />
            </div>
          </Reveal>
        )}

        <div className="relative mx-auto mt-12 max-w-3xl">
          {frenchOnly && (
            <p className="mb-8 rounded-[18px_10px_18px_10px] bg-surface-alt px-5 py-4 text-sm text-ink-soft">
              This article is only available in French.
            </p>
          )}
          {/* Cleaned by the server when saved (only text formatting is kept). */}
          <div className="rich-text text-lg leading-relaxed text-ink" dangerouslySetInnerHTML={{ __html: text(article.body) }} />
          <div className="mt-12 border-t border-border-soft pt-8">
            <ShareLinks title={title} />
          </div>
        </div>
      </article>
      <MoreNews currentId={article.id} />
    </>
  );
}

export function NewsArticlePage() {
  const { slug = "" } = useParams();
  const { t } = useLanguage();
  const text = useApiText();
  const school = useSchool();
  const article = useNewsArticle(slug);

  const suffix = `${school.shortName} — ${school.location.city}`;
  usePageMeta(
    article.data ? `${text(article.data.seo.title)} | ${suffix}` : `${t("Actualités", "News")} | ${suffix}`,
    article.data ? text(article.data.seo.description) || text(article.data.excerpt) : t("Actualité de La Pépinière.", "News from La Pépinière."),
  );

  let content;
  if (article.isPending) {
    content = (
      <p role="status" className="flex min-h-[60vh] items-center justify-center gap-3 px-6 text-ink-soft">
        <Loader2 size={20} className="animate-spin" aria-hidden="true" />
        {t("Chargement de l'article…", "Loading the article…")}
      </p>
    );
  } else if (article.isError || article.data === null) {
    const missing = article.data === null;
    content = (
      <section className="flex min-h-[60vh] items-center justify-center bg-surface px-6 py-20">
        <div className="max-w-lg rounded-[32px_18px_32px_18px] border border-border-soft bg-white p-8 text-center shadow-soft">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
            <Newspaper size={23} aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-ink">
            {missing
              ? t("Cette actualité n'existe pas ou n'est plus en ligne.", "This article does not exist or is no longer online.")
              : t("L'article n'a pas pu être chargé.", "The article could not be loaded.")}
          </h1>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {!missing && (
              <button
                type="button"
                onClick={() => void article.refetch()}
                className="inline-flex items-center gap-2 rounded-btn bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-primary-dark"
              >
                <RotateCcw size={16} aria-hidden="true" />
                {t("Réessayer", "Try again")}
              </button>
            )}
            <Link
              to="/actualites"
              className="inline-flex items-center gap-2 rounded-btn border border-border-soft bg-white px-5 py-2.5 text-sm font-medium text-ink shadow-soft transition-colors hover:bg-surface-alt"
            >
              {t("Toutes les actualités", "All news")}
            </Link>
          </div>
        </div>
      </section>
    );
  } else {
    content = <Article article={article.data} />;
  }

  return (
    <>
      <Header />
      <main>{content}</main>
      <Footer />
    </>
  );
}
