import { BellRing, CalendarDays, Megaphone, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SCHOOL } from "@/data/school";

export function NewsPage() {
  useEffect(() => {
    document.title = `Actualités | ${SCHOOL.shortName} — Bertoua, Cameroun`;
    const description =
      "Actualités, communiqués et informations aux parents du Groupe Scolaire Privé Bilingue La Pépinière à Bertoua.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
  }, []);

  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="ACTUALITÉS"
          title="La vie de l'école, au fil des jours."
          description="Retrouvez ici les informations communiquées par La Pépinière pour les familles et la communauté scolaire."
          imageLabel="vie de l'école"
        />
        <section className="relative overflow-hidden bg-surface px-6 py-20 lg:px-10 lg:py-28">
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
                    JOURNAL DE L'ÉCOLE
                  </p>
                  <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                    Les informations de{" "}
                    <span className="text-secondary">La Pépinière</span>.
                  </h2>
                </div>
                <div className="flex items-center gap-3 rounded-[22px_12px_22px_12px] bg-surface-alt px-4 py-3 text-sm text-ink-soft shadow-soft">
                  <CalendarDays className="text-secondary" size={19} />
                  <span>Les communiqués officiels seront publiés ici.</span>
                </div>
              </div>
            </Reveal>
            <div className="mt-12 grid items-center gap-10 rounded-[32px_18px_32px_18px] border border-border-soft bg-white p-7 shadow-soft lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
              <Reveal delay={0.12}>
                <ImagePlaceholder
                  className="aspect-4/3 rounded-[24px_14px_24px_14px]"
                  content="photo officielle d'actualité à intégrer"
                />
              </Reveal>
              <Reveal delay={0.2}>
                <div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
                    <Megaphone size={23} />
                  </span>
                  <h3 className="mt-6 text-2xl font-bold text-ink">
                    Aucune actualité officielle publiée pour le moment.
                  </h3>
                  <p className="mt-4 leading-relaxed text-ink-soft">
                    Cette page est prête à recevoir les communications vérifiées
                    de l'établissement. Aucun contenu de démonstration n'est
                    présenté comme une actualité réelle.
                  </p>
                  <Link
                    to="/contact"
                    className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-dark"
                  >
                    Contacter l'administration <BellRing size={16} />
                  </Link>
                </div>
              </Reveal>
            </div>
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
                  À VENIR ICI
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  Les rubriques officielles.
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-ink-soft">
                  Les prochaines publications seront classées dans les
                  catégories communiquées par l'école.
                </p>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SCHOOL.news.categories.map((category, index) => (
                <Reveal key={category} delay={0.12 + index * 0.08}>
                  <div className="group flex items-center gap-4 rounded-[22px_14px_22px_14px] border border-border-soft bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-light text-sm font-bold text-secondary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-semibold leading-snug text-ink">
                      {category}
                    </span>
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
                <p className="text-sm font-medium tracking-[0.18em]">
                  RESTEZ INFORMÉS
                </p>
              </div>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                Pour toute information, l'administration reste à votre écoute.
              </h2>
            </div>
            <Link
              to="/contact"
              className="inline-flex shrink-0 items-center justify-center rounded-btn bg-white px-5 py-3 text-sm font-medium text-primary shadow-soft transition-colors hover:bg-surface-alt"
            >
              Nous contacter
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
