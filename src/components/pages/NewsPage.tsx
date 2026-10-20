import { BellRing, CalendarDays, Loader2, Megaphone, RotateCcw, Sparkles } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AnnouncementsSection } from "@/components/announcements/AnnouncementsSection";
import { AgendaSection } from "@/components/events/AgendaSection";
import { NewsCard } from "@/components/news/NewsCard";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { useSchool } from "@/data/useSchool";
import { useLanguage } from "@/i18n/useLanguage";
import { useNewsCategories, useNewsList } from "@/lib/api/publicNews";
import { useApiText } from "@/lib/api/useApiText";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/lib/usePageMeta";

export function NewsPage() {
  const { t } = useLanguage();
  const text = useApiText();
  const school = useSchool();
  const [params, setParams] = useSearchParams();
  const category = params.get("rubrique");
  const news = useNewsList(category);
  const categories = useNewsCategories();

  const articles = news.data?.pages.flatMap((page) => page.data) ?? [];
  const total = news.data?.pages[0]?.meta.total ?? 0;
  // Without any published article, the page keeps its "nothing yet" presentation.
  const hasPublished = articles.length > 0 || Boolean(category);
  const activeCategory = categories.data?.find((item) => item.slug === category);

  const chooseCategory = (slug: string | null) => {
    setParams(slug ? { rubrique: slug } : {}, { preventScrollReset: true });
    document.getElementById("journal")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  usePageMeta(
    `${t("Actualités", "News")} | ${school.shortName} — ${school.location.city}, ${school.location.country}`,
    t(
      "Actualités, communiqués et informations aux parents du Groupe Scolaire Privé Bilingue La Pépinière à Bertoua.",
      "News, announcements and information for parents from La Pépinière Bilingual Private School Group in Bertoua.",
    ),
  );

  const emptyState = (
    <div className="mt-12 grid items-center gap-10 rounded-[32px_18px_32px_18px] border border-border-soft bg-white p-7 shadow-soft lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
      <Reveal delay={0.12}>
        <ImagePlaceholder
          className="aspect-4/3 rounded-[24px_14px_24px_14px]"
          content={t("photo officielle d'actualité à intégrer", "official news photo to be added")}
        />
      </Reveal>
      <Reveal delay={0.2}>
        <div>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
            <Megaphone size={23} />
          </span>
          <h3 className="mt-6 text-2xl font-bold text-ink">
            {t("Aucune actualité officielle publiée pour le moment.", "No official news published at the moment.")}
          </h3>
          <p className="mt-4 leading-relaxed text-ink-soft">
            {t(
              "Cette page est prête à recevoir les communications vérifiées de l'établissement. Aucun contenu de démonstration n'est présenté comme une actualité réelle.",
              "This page is ready to receive the school's verified communications. No demonstration content is presented as real news.",
            )}
          </p>
          <Link
            to="/contact"
            className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
          >
            {t("Contacter l'administration", "Contact the administration")} <BellRing size={16} />
          </Link>
        </div>
      </Reveal>
    </div>
  );

  let journal;
  if (news.isPending) {
    journal = (
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-96 animate-pulse rounded-[28px_16px_28px_16px] border border-border-soft bg-white" />
        ))}
      </div>
    );
  } else if (news.isError) {
    journal = (
      <div className="mt-12 rounded-[32px_18px_32px_18px] border border-border-soft bg-white p-8 text-center shadow-soft">
        <p className="font-semibold text-ink">
          {t("Les actualités n'ont pas pu être chargées.", "The news could not be loaded.")}
        </p>
        <p className="mt-2 text-sm text-ink-soft">{t("Vérifiez votre connexion internet.", "Please check your internet connection.")}</p>
        <button
          type="button"
          onClick={() => void news.refetch()}
          className="mt-5 inline-flex items-center gap-2 rounded-btn bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-primary-dark"
        >
          <RotateCcw size={16} aria-hidden="true" />
          {t("Réessayer", "Try again")}
        </button>
      </div>
    );
  } else if (!hasPublished) {
    journal = emptyState;
  } else if (articles.length === 0) {
    journal = (
      <div className="mt-12 rounded-[32px_18px_32px_18px] border border-border-soft bg-white p-8 text-center shadow-soft">
        <p className="font-semibold text-ink">
          {t("Aucune actualité dans cette rubrique pour le moment.", "No news in this category at the moment.")}
        </p>
        <button
          type="button"
          onClick={() => chooseCategory(null)}
          className="mt-4 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
        >
          {t("Voir toutes les actualités", "See all news")}
        </button>
      </div>
    );
  } else {
    journal = (
      <>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <Reveal key={article.id} delay={0.08 + (index % 3) * 0.08}>
              <NewsCard news={article} />
            </Reveal>
          ))}
        </div>
        {news.hasNextPage && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => void news.fetchNextPage()}
              disabled={news.isFetchingNextPage}
              className="inline-flex items-center gap-2 rounded-btn border border-border-soft bg-white px-5 py-3 text-sm font-medium text-ink shadow-soft transition-colors hover:bg-surface-alt disabled:opacity-60"
            >
              {news.isFetchingNextPage && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
              {t("Voir plus d'actualités", "See more news")}
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow={t("ACTUALITÉS", "NEWS")}
          title={t("La vie de l'école, au fil des jours.", "School life, day by day.")}
          description={t(
            "Retrouvez ici les informations communiquées par La Pépinière pour les familles et la communauté scolaire.",
            "Find here the information shared by La Pépinière for families and the school community.",
          )}
          imageLabel={t("vie de l'école", "school life")}
        />
        <AnnouncementsSection className="bg-surface-alt" />
        <AgendaSection className="border-t border-border-soft bg-surface-alt" />
        <section id="journal" className="relative scroll-mt-24 overflow-hidden bg-surface px-6 py-20 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-8 top-24 h-32 w-24 -rotate-12 rounded-[48%_52%_60%_40%] bg-accent-yellow/15"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-[10%] top-12 h-5 w-5 rounded-full bg-accent-coral/35 shadow-[18px_22px_0_rgba(50,183,104,0.2),-14px_40px_0_rgba(245,185,66,0.22)]"
          />
          <div className="relative mx-auto max-w-6xl">
            <Reveal delay={0.08}>
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-medium tracking-[0.18em] text-primary">
                    {t("JOURNAL DE L'ÉCOLE", "SCHOOL JOURNAL")}
                  </p>
                  <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                    {activeCategory ? (
                      text(activeCategory.name)
                    ) : (
                      <>
                        {t("Les informations de", "News from")} <span className="text-secondary">La Pépinière</span>.
                      </>
                    )}
                  </h2>
                </div>
                <div className="flex items-center gap-3 rounded-[22px_12px_22px_12px] bg-surface-alt px-4 py-3 text-sm text-ink-soft shadow-soft">
                  <CalendarDays className="text-secondary" size={19} />
                  <span>
                    {hasPublished && !news.isPending && !news.isError
                      ? t(
                          `${total} actualité${total > 1 ? "s" : ""} publiée${total > 1 ? "s" : ""}`,
                          `${total} published article${total > 1 ? "s" : ""}`,
                        )
                      : t("Les communiqués officiels seront publiés ici.", "Official announcements will be published here.")}
                  </span>
                </div>
              </div>
            </Reveal>
            {journal}
          </div>
        </section>
        <section className="relative overflow-hidden bg-surface-alt px-6 py-20 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 bottom-10 h-28 w-40 rotate-6 rounded-[45%_55%_60%_40%] bg-secondary/10"
          />
          <div className="relative mx-auto max-w-6xl">
            <Reveal delay={0.08}>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-medium tracking-[0.18em] text-primary">
                  {hasPublished ? t("RUBRIQUES", "CATEGORIES") : t("À VENIR ICI", "COMING HERE")}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  {hasPublished ? t("Parcourir par rubrique.", "Browse by category.") : t("Les rubriques officielles.", "The official categories.")}
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-ink-soft">
                  {hasPublished
                    ? t("Choisissez une rubrique pour n'afficher que ses actualités.", "Choose a category to show only its news.")
                    : t(
                        "Les prochaines publications seront classées dans les catégories communiquées par l'école.",
                        "Upcoming posts will be sorted into the categories provided by the school.",
                      )}
                </p>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hasPublished && categories.data
                ? categories.data.map((item, index) => {
                    const active = item.slug === category;
                    return (
                      <Reveal key={item.id} delay={0.12 + index * 0.05}>
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={() => chooseCategory(active ? null : item.slug)}
                          className={cn(
                            "group flex w-full items-center gap-4 rounded-[22px_14px_22px_14px] border bg-white p-5 text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg",
                            active ? "border-secondary ring-2 ring-secondary/30" : "border-border-soft",
                          )}
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-light text-sm font-bold text-secondary">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="text-sm font-semibold leading-snug text-ink">{text(item.name)}</span>
                        </button>
                      </Reveal>
                    );
                  })
                : school.news.categories.map((item, index) => (
                    <Reveal key={index} delay={0.12 + index * 0.08}>
                      <div className="group flex items-center gap-4 rounded-[22px_14px_22px_14px] border border-border-soft bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-light text-sm font-bold text-secondary">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-semibold leading-snug text-ink">{item}</span>
                      </div>
                    </Reveal>
                  ))}
            </div>
          </div>
        </section>
        <section className="relative overflow-hidden bg-linear-to-r from-primary to-primary-dark px-6 py-16 text-white lg:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border-8 border-white/10"
          />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-secondary-light">
                <Sparkles size={19} />
                <p className="text-sm font-medium tracking-[0.18em]">{t("RESTEZ INFORMÉS", "STAY INFORMED")}</p>
              </div>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                {t(
                  "Pour toute information, l'administration reste à votre écoute.",
                  "For any information, the administration is here to listen.",
                )}
              </h2>
            </div>
            <Link
              to="/contact"
              className="inline-flex shrink-0 items-center justify-center rounded-btn bg-white px-5 py-3 text-sm font-medium text-primary shadow-soft transition-colors hover:bg-surface-alt"
            >
              {t("Nous contacter", "Contact us")}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
