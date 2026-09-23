import {
  Bus,
  CalendarDays,
  ChefHat,
  Clock3,
  Computer,
  Dumbbell,
  HeartPulse,
  LandPlot,
  Music2,
  NotebookText,
  Palmtree,
  PartyPopper,
  School,
  Sparkles,
  TentTree,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SCHOOL } from "@/data/school";

const FACILITY_ICONS = [
  School,
  Computer,
  HeartPulse,
  Palmtree,
  Sparkles,
  TentTree,
  Bus,
];
const ACTIVITY_ICONS = [
  ChefHat,
  LandPlot,
  Music2,
  Dumbbell,
  TentTree,
  PartyPopper,
  Sparkles,
  School,
];
const ACTIVITY_DESCRIPTIONS = [
  "Découvrir et pratiquer autour de la cuisine.",
  "S'initier aux activités agricoles.",
  "Explorer les activités musicales.",
  "Participer à des activités sportives.",
  "Découvrir autrement à travers les excursions.",
  "Rencontrer l'école lors de journées portes ouvertes.",
  "Partager des activités culturelles.",
  "Éveiller la curiosité par la découverte.",
];

export function SchoolLifePage() {
  useEffect(() => {
    document.title = `Vie scolaire | ${SCHOOL.shortName} — Bertoua, Cameroun`;
    const description =
      "Découvrez les infrastructures, activités extrascolaires et le transport scolaire du Groupe Scolaire Privé Bilingue La Pépinière à Bertoua.";
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
          eyebrow="VIE SCOLAIRE"
          title="Bien plus qu'une salle de classe."
          description="À La Pépinière, les enfants découvrent une vie scolaire rythmée par les activités, les rencontres et les espaces qui font vivre l'école."
          imageLabel="enfants africains en activité"
        />

        <section className="relative overflow-hidden bg-surface px-6 py-24 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 top-16 h-36 w-28 -rotate-12 rounded-[52%_48%_60%_40%] bg-accent-yellow/15"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-[12%] bottom-12 h-4 w-4 rounded-full bg-accent-coral/40 shadow-[18px_24px_0_rgba(50,183,104,0.2),-12px_42px_0_rgba(245,185,66,0.24)]"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <Reveal delay={0.08}>
              <div>
                <p className="text-sm font-medium tracking-[0.18em] text-secondary">
                  UN QUOTIDIEN VIVANT
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  Des espaces et des moments pour grandir ensemble.
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-ink-soft">
                  La vie scolaire complète le parcours des enfants par des
                  activités de découverte, culturelles, sportives et pratiques,
                  dans les espaces de l'établissement.
                </p>
                <div className="mt-8 flex items-center gap-4 rounded-[24px_14px_24px_14px] border border-border-soft bg-surface-alt p-5 shadow-soft">
                  <Sparkles className="shrink-0 text-secondary" size={25} />
                  <p className="text-sm font-medium text-ink">
                    Une école pensée pour apprendre, découvrir et partager.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.18}>
              <ImagePlaceholder
                className="relative z-10 aspect-4/3 w-full rounded-[34px_18px_34px_18px] shadow-soft-lg"
                content="vie quotidienne des élèves"
              />
            </Reveal>
          </div>
        </section>

        <section className="relative overflow-hidden bg-surface-alt px-6 py-24 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 top-10 h-28 w-36 rotate-6 rounded-[45%_55%_60%_40%] bg-secondary/10"
          />
          <div className="relative mx-auto max-w-6xl">
            <Reveal delay={0.08}>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-medium tracking-[0.18em] text-primary">
                  NOS INFRASTRUCTURES
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  Des espaces au service de la vie de l'école.
                </h2>
              </div>
            </Reveal>
            <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
              {SCHOOL.schoolLife.facilities.map((facility, index) => {
                const Icon = FACILITY_ICONS[index];
                return (
                  <Reveal key={facility} delay={0.12 + index * 0.07}>
                    <article className="group flex min-h-40 flex-col items-center justify-center rounded-[24px_14px_24px_14px] border border-border-soft bg-white p-5 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                        <Icon size={21} />
                      </span>
                      <h3 className="mt-4 text-sm font-bold leading-snug text-ink">
                        {facility}
                      </h3>
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
            className="pointer-events-none absolute -left-10 bottom-10 h-28 w-44 rotate-3 rounded-[55%_45%_38%_62%] bg-primary-light"
          />
          <div className="relative mx-auto max-w-6xl">
            <Reveal delay={0.08}>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-medium tracking-[0.18em] text-primary">
                  ACTIVITÉS EXTRASCOLAIRES
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  Des occasions d'apprendre autrement.
                </h2>
              </div>
            </Reveal>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {SCHOOL.schoolLife.activities.map((title, index) => {
                const Icon = ACTIVITY_ICONS[index];
                return (
                  <Reveal key={title} delay={0.12 + index * 0.08}>
                    <article className="group rounded-[28px_16px_28px_16px] border border-border-soft bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-soft">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-light text-secondary transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                        <Icon size={20} />
                      </span>
                      <h3 className="mt-5 text-lg font-bold text-ink">
                        {title}
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

        <section className="relative overflow-hidden bg-surface-alt px-6 py-24 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute right-8 top-10 h-5 w-5 rounded-full bg-accent-yellow/60 shadow-[18px_20px_0_rgba(244,119,107,0.2),-14px_38px_0_rgba(50,183,104,0.2)]"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <Reveal delay={0.08}>
              <ImagePlaceholder
                className="aspect-4/3 w-full rounded-[18px_34px_18px_34px] shadow-soft-lg"
                content="transport scolaire"
              />
            </Reveal>
            <Reveal delay={0.16}>
              <div>
                <p className="text-sm font-medium tracking-[0.18em] text-secondary">
                  TRANSPORT SCOLAIRE
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  Un service de transport selon la distance.
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-ink-soft">
                  {SCHOOL.transport.description}
                </p>
                <div className="mt-8 grid grid-cols-3 gap-3">
                  {SCHOOL.transport.tariffs.map((tariff, index) => (
                    <div
                      key={tariff}
                      className="rounded-[18px_10px_18px_10px] bg-white px-3 py-4 text-center text-sm font-bold text-primary shadow-soft"
                      style={{ transitionDelay: `${index * 80}ms` }}
                    >
                      {tariff}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm font-medium text-ink-soft">
                  Tarifs annoncés selon la distance.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative overflow-hidden bg-surface px-6 py-24 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 bottom-12 h-32 w-32 rounded-full bg-accent-coral/10"
          />
          <div className="relative mx-auto max-w-6xl">
            <Reveal delay={0.08}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-medium tracking-[0.18em] text-primary">
                    INFORMATIONS AUX PARENTS
                  </p>
                  <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                    Les documents et informations utiles.
                  </h2>
                </div>
                <CalendarDays
                  className="hidden text-secondary lg:block"
                  size={42}
                  strokeWidth={1.4}
                />
              </div>
            </Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                {
                  icon: Clock3,
                  title: "Horaires scolaires",
                  text: "Les horaires de la maternelle et du primaire sont disponibles sur leurs pages respectives.",
                },
                {
                  icon: NotebookText,
                  title: "Règlement intérieur",
                  text: "Règlement intérieur officiel — document à intégrer.",
                },
                {
                  icon: CalendarDays,
                  title: "Calendrier scolaire",
                  text: "Calendrier scolaire officiel — document à intégrer.",
                },
              ].map(({ icon: Icon, title, text }, index) => (
                <Reveal key={title} delay={0.12 + index * 0.08}>
                  <article className="rounded-[22px_14px_22px_14px] border border-border-soft bg-surface-alt p-6">
                    <Icon className="text-secondary" size={23} />
                    <h3 className="mt-5 text-xl font-bold text-ink">{title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                      {text}
                    </p>
                  </article>
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
                LA VIE À L'ÉCOLE
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Grandir, apprendre et partager chaque jour.
              </h2>
            </div>
            <Link
              to="/galerie"
              className="inline-flex items-center justify-center rounded-btn bg-white px-5 py-3 text-sm font-medium text-primary shadow-soft transition-colors hover:bg-surface-alt"
            >
              Voir la galerie
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
