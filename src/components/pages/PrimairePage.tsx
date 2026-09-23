import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Languages,
  School,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SCHOOL } from "@/data/school";

const PATHWAY_ICONS = [BookOpen, Languages];
const PRIMARY_HOURS = [
  { days: "Lundi – Jeudi", hours: SCHOOL.hours.primary.mondayToThursday },
  { days: "Vendredi", hours: SCHOOL.hours.primary.friday },
];

export function PrimairePage() {
  useEffect(() => {
    document.title = `Primaire | ${SCHOOL.shortName} — Bertoua, Cameroun`;
    const description =
      "Le primaire du Groupe Scolaire Privé Bilingue La Pépinière à Bertoua : parcours francophone et anglophone selon le programme scolaire applicable.";
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
          eyebrow="PRIMAIRE"
          title="Deux parcours pour apprendre et progresser."
          description="La Pépinière propose un primaire francophone et un primaire anglophone, dans le cadre de son projet d'éducation bilingue."
          imageLabel="élèves du primaire en apprentissage"
        />

        <section className="relative overflow-hidden bg-surface px-6 py-24 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 top-16 h-40 w-32 rotate-12 rounded-[45%_55%_42%_58%] bg-primary-light"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-14 left-[12%] h-4 w-24 -rotate-6 rounded-full bg-accent-yellow/60"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
            <Reveal delay={0.08}>
              <div>
                <p className="text-sm font-medium tracking-[0.18em] text-primary">
                  NOTRE APPROCHE
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  Une éducation bilingue tournée vers la réussite.
                </h2>
                <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink-soft">
                  <p>
                    Au primaire, l'école poursuit sa mission de développer les
                    connaissances, l'autonomie, la créativité et le sens des
                    responsabilités de chaque enfant.
                  </p>
                  <p>
                    Les apprentissages accompagnent aussi la maîtrise du
                    français et de l'anglais, conformément à l'identité bilingue
                    de La Pépinière.
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  {SCHOOL.values.map((value) => (
                    <span
                      key={value}
                      className="rounded-full bg-primary-light px-4 py-2 text-sm font-medium text-primary transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.18}>
              <ImagePlaceholder
                className="relative z-10 aspect-4/3 w-full rounded-[18px_32px_18px_32px] shadow-soft-lg"
                content="classe primaire africaine"
              />
            </Reveal>
          </div>
        </section>

        <section className="relative overflow-hidden bg-surface-alt px-6 py-24 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 bottom-12 h-28 w-28 rounded-full border-8 border-accent-yellow/20"
          />
          <div className="relative mx-auto max-w-6xl">
            <Reveal delay={0.08}>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-medium tracking-[0.18em] text-secondary">
                  LES DEUX PARCOURS
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  Choisir la section qui correspond à votre enfant.
                </h2>
                <p className="mt-5 text-lg text-ink-soft">
                  Deux sections primaires au sein d'un même établissement
                  bilingue.
                </p>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {SCHOOL.primary.pathways.map(
                ({ title, language, description }, index) => {
                  const Icon = PATHWAY_ICONS[index];
                  return (
                    <Reveal key={title} delay={0.12 + index * 0.1}>
                      <article className="group rounded-[28px_16px_28px_16px] border border-border-soft bg-white p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
                        <span className="flex h-13 w-13 items-center justify-center rounded-full bg-secondary-light text-secondary transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
                          <Icon size={25} strokeWidth={1.8} />
                        </span>
                        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.12em] text-secondary">
                          {language}
                        </p>
                        <h3 className="mt-2 text-2xl font-bold text-ink">
                          {title}
                        </h3>
                        <p className="mt-4 leading-relaxed text-ink-soft">
                          {description}
                        </p>
                      </article>
                    </Reveal>
                  );
                },
              )}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-surface px-6 py-24 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-8 top-20 h-24 w-40 -rotate-6 rounded-[50%_50%_35%_65%] bg-accent-coral/10"
          />
          <div className="relative mx-auto max-w-5xl">
            <Reveal delay={0.08}>
              <div className="max-w-2xl">
                <p className="text-sm font-medium tracking-[0.18em] text-primary">
                  HORAIRES
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  Le rythme du primaire.
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-ink-soft">
                  Les horaires communiqués par l'établissement pour les sections
                  primaires.
                </p>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {PRIMARY_HOURS.map(({ days, hours }, index) => (
                <Reveal key={days} delay={0.12 + index * 0.08}>
                  <article className="flex items-center gap-5 rounded-[28px_16px_28px_16px] border border-border-soft bg-surface-alt p-7 shadow-soft">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                      <Clock3 size={24} strokeWidth={1.8} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-secondary">
                        {days}
                      </p>
                      <h3 className="mt-1 text-2xl font-bold text-ink">
                        {hours}
                      </h3>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-surface-alt px-6 py-24 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute right-[8%] top-10 h-5 w-5 rounded-full bg-secondary/30 shadow-[18px_20px_0_rgba(244,119,107,0.18),-14px_38px_0_rgba(245,185,66,0.25)]"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal delay={0.08}>
              <ImagePlaceholder
                className="aspect-4/3 w-full rounded-[34px_18px_34px_18px] shadow-soft-lg"
                content="élèves du primaire en classe"
              />
            </Reveal>
            <Reveal delay={0.16}>
              <div>
                <p className="text-sm font-medium tracking-[0.18em] text-secondary">
                  REPÈRES PÉDAGOGIQUES
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  Des valeurs qui accompagnent le parcours de chaque enfant.
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-ink-soft">
                  Discipline, travail, succès, respect, responsabilité et
                  excellence sont les valeurs officielles de l'établissement.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {SCHOOL.values.map((value, index) => (
                    <div
                      key={value}
                      className="flex items-center gap-3 rounded-[18px_10px_18px_10px] border border-border-soft bg-white px-4 py-3 shadow-soft"
                      style={{ transitionDelay: `${index * 80}ms` }}
                    >
                      <CheckCircle2
                        className="shrink-0 text-secondary"
                        size={19}
                      />
                      <span className="text-sm font-semibold text-ink">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative overflow-hidden bg-surface px-6 py-24 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-8 right-1/4 h-24 w-56 rotate-3 rounded-[55%_45%_60%_40%] bg-secondary/8"
          />
          <div className="relative mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium tracking-[0.18em] text-primary">
                UNE ÉCOLE, DEUX LANGUES
              </p>
              <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                Découvrir le primaire à La Pépinière.
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                "salle de classe",
                "apprentissage en français",
                "learning in English",
                "vie scolaire",
              ].map((content, index) => (
                <ImagePlaceholder
                  key={content}
                  className={
                    index % 2 === 0
                      ? "aspect-square rounded-[28px_14px_28px_14px]"
                      : "aspect-square rounded-[14px_28px_14px_28px]"
                  }
                  content={content}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-linear-to-r from-primary to-primary-dark px-6 py-20 text-white lg:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border-8 border-white/10"
          />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium tracking-[0.18em] text-white/80">
                PROCHAINE ÉTAPE
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Préparez l'inscription de votre enfant.
              </h2>
            </div>
            <Link
              to="/admissions"
              className="inline-flex items-center justify-center gap-2 self-start rounded-btn bg-white px-5 py-3 text-sm font-medium text-primary shadow-soft transition-colors hover:bg-surface-alt"
            >
              <School size={17} />
              Découvrir les admissions
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
