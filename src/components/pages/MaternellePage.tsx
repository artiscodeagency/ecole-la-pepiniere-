import {
  BookOpen,
  Brush,
  CircleDot,
  Clock3,
  HeartHandshake,
  Puzzle,
  Sparkles,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SCHOOL } from "@/data/school";

const ACTIVITY_ICONS = [Puzzle, Brush, CircleDot, BookOpen, Sparkles];
const ACTIVITY_DESCRIPTIONS = [
  "Des expériences pensées pour éveiller la curiosité des enfants.",
  "Créer, manipuler et s'exprimer au fil des ateliers.",
  "Bouger et développer les repères du corps par l'activité.",
  "Apprendre avec plaisir à travers le jeu.",
  "Observer, explorer et s'ouvrir au monde qui entoure l'enfant.",
];
const APPROACH_POINTS = [
  "Connaissances",
  "Autonomie",
  "Créativité",
  "Responsabilités",
  "Français",
  "Anglais",
];
const SCHEDULE = [
  { days: "Lundi – Jeudi", hours: SCHOOL.hours.kindergarten.mondayToThursday },
  { days: "Vendredi", hours: SCHOOL.hours.kindergarten.friday },
];

export function MaternellePage() {
  useEffect(() => {
    document.title = `Maternelle | ${SCHOOL.shortName} — Bertoua, Cameroun`;
    const description =
      "La maternelle du Groupe Scolaire Privé Bilingue La Pépinière à Bertoua : activités d'éveil, artistiques, sportives, jeux éducatifs et découverte.";
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
          eyebrow="MATERNELLE"
          title="Les premières découvertes comptent."
          description="À La Pépinière, les enfants découvrent, créent, bougent et apprennent dans un environnement propice à leur épanouissement."
          imageLabel="enfants en maternelle"
        />

        <section className="relative overflow-hidden bg-surface px-6 py-24 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-12 top-20 h-36 w-28 -rotate-12 rounded-[55%_45%_60%_40%] bg-accent-yellow/15"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-8 top-12 h-5 w-5 rounded-full bg-accent-coral/30 shadow-[18px_24px_0_rgba(50,183,104,0.18),-12px_42px_0_rgba(245,185,66,0.25)]"
          />
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <Reveal delay={0.08}>
              <div>
                <p className="text-sm font-medium tracking-[0.18em] text-secondary">
                  NOTRE APPROCHE
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  Grandir, découvrir et apprendre.
                </h2>
                <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink-soft">
                  <p>
                    Dès le bas âge, l'école accompagne le développement des
                    connaissances, de l'autonomie, de la créativité et du sens
                    des responsabilités.
                  </p>
                  <p>
                    L'éveil des enfants s'inscrit dans le projet d'une éducation
                    bilingue, en français et en anglais.
                  </p>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-3 text-sm font-medium text-ink sm:grid-cols-3">
                  {APPROACH_POINTS.map((item) => (
                    <span
                      key={item}
                      className="rounded-btn bg-secondary-light px-3 py-2 text-center text-secondary"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.18}>
              <ImagePlaceholder
                className="relative z-10 aspect-4/3 w-full rounded-[32px_18px_32px_18px] shadow-soft-lg"
                content="enfants africains en activité"
              />
            </Reveal>
          </div>
        </section>

        <section className="relative overflow-hidden bg-surface-alt px-6 py-24 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 top-12 h-32 w-32 rounded-[48%_52%_60%_40%] bg-accent-coral/10"
          />
          <div className="relative mx-auto max-w-6xl">
            <Reveal delay={0.08}>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-medium tracking-[0.18em] text-primary">
                  APPRENDRE AUTREMENT
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  Des activités pour éveiller l'envie d'apprendre.
                </h2>
              </div>
            </Reveal>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {SCHOOL.kindergarten.activities.map((label, index) => {
                const Icon = ACTIVITY_ICONS[index];
                return (
                  <Reveal key={label} delay={0.12 + index * 0.08}>
                    <article className="group rounded-[24px_14px_24px_14px] border border-border-soft bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                        <Icon size={22} strokeWidth={1.8} />
                      </span>
                      <h3 className="mt-5 text-lg font-bold text-ink">
                        {label}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                        {ACTIVITY_DESCRIPTIONS[index]}
                      </p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-surface px-6 py-24 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-6 bottom-16 h-24 w-40 -rotate-6 rounded-[60%_40%_45%_55%] bg-secondary/10"
          />
          <div className="relative mx-auto max-w-5xl">
            <Reveal delay={0.08}>
              <div className="max-w-2xl">
                <p className="text-sm font-medium tracking-[0.18em] text-primary">
                  HORAIRES
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  Le rythme de la maternelle.
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-ink-soft">
                  Les horaires communiqués par l'établissement pour la
                  maternelle.
                </p>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {SCHEDULE.map(({ days, hours }, index) => (
                <Reveal key={days} delay={0.12 + index * 0.08}>
                  <article className="flex items-center gap-5 rounded-[28px_16px_28px_16px] border border-border-soft bg-surface-alt p-7 shadow-soft">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary-light text-secondary">
                      <Clock3 size={24} strokeWidth={1.8} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
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
            className="pointer-events-none absolute right-[12%] top-12 h-4 w-4 rounded-full bg-accent-yellow/60 shadow-[16px_22px_0_rgba(244,119,107,0.22),-12px_42px_0_rgba(50,183,104,0.2)]"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal delay={0.08}>
              <ImagePlaceholder
                className="aspect-4/3 w-full rounded-[34px_18px_34px_18px] shadow-soft-lg"
                content="activité de découverte en maternelle"
              />
            </Reveal>
            <Reveal delay={0.16}>
              <div>
                <p className="text-sm font-medium tracking-[0.18em] text-secondary">
                  UNE ÉDUCATION BILINGUE
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  Deux langues, un même élan pour apprendre.
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-ink-soft">
                  La Pépinière est un établissement scolaire privé bilingue. Sa
                  mission est notamment de favoriser la maîtrise du français et
                  de l'anglais.
                </p>
                <div className="mt-8 flex items-center gap-4 rounded-[22px_12px_22px_12px] border border-border-soft bg-white p-5 shadow-soft">
                  <HeartHandshake className="text-secondary" size={24} />
                  <p className="text-sm font-medium text-ink">{SCHOOL.motto}</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative overflow-hidden bg-surface px-6 py-24 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-8 top-10 h-24 w-24 rounded-full bg-accent-yellow/15"
          />
          <div className="relative mx-auto max-w-6xl">
            <Reveal delay={0.08}>
              <p className="text-sm font-medium tracking-[0.18em] text-primary">
                EN IMAGES
              </p>
              <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                Les premiers pas dans un univers vivant.
              </h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                "jeu éducatif",
                "atelier créatif",
                "activité sportive",
                "activité de découverte",
              ].map((content, index) => (
                <Reveal key={content} delay={0.12 + index * 0.08}>
                  <ImagePlaceholder
                    className={
                      index % 2 === 0
                        ? "aspect-square rounded-[30px_14px_30px_14px]"
                        : "aspect-square rounded-[14px_30px_14px_30px]"
                    }
                    content={content}
                  />
                </Reveal>
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
              Découvrir les admissions
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
