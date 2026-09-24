import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Languages,
  School,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { useSchool } from "@/data/useSchool";
import { tr } from "@/i18n/types";
import { useLanguage } from "@/i18n/useLanguage";
import { usePageMeta } from "@/lib/usePageMeta";

const PATHWAY_ICONS = [BookOpen, Languages];
const GALLERY_CONTENT = [
  tr("salle de classe", "classroom"),
  tr("apprentissage en français", "learning in French"),
  tr("learning in English", "learning in English"),
  tr("vie scolaire", "school life"),
];

export function PrimairePage() {
  const { t } = useLanguage();
  const school = useSchool();

  const primaryHours = [
    {
      days: t("Lundi – Jeudi", "Monday – Thursday"),
      hours: school.hours.primary.mondayToThursday,
    },
    { days: t("Vendredi", "Friday"), hours: school.hours.primary.friday },
  ];

  usePageMeta(
    `${t("Primaire", "Primary")} | ${school.shortName} — ${school.location.city}, ${school.location.country}`,
    t(
      "Le primaire du Groupe Scolaire Privé Bilingue La Pépinière à Bertoua : parcours francophone et anglophone selon le programme scolaire applicable.",
      "The primary school of La Pépinière Bilingual Private School Group in Bertoua: French-speaking and English-speaking pathways following the applicable school curriculum.",
    ),
  );

  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow={t("PRIMAIRE", "PRIMARY")}
          title={t(
            "Deux parcours pour apprendre et progresser.",
            "Two pathways to learn and progress.",
          )}
          description={t(
            "La Pépinière propose un primaire francophone et un primaire anglophone, dans le cadre de son projet d'éducation bilingue.",
            "La Pépinière offers a French-speaking primary and an English-speaking primary, as part of its bilingual education project.",
          )}
          imageLabel={t(
            "élèves du primaire en apprentissage",
            "primary students learning",
          )}
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
                  {t("NOTRE APPROCHE", "OUR APPROACH")}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  {t(
                    "Une éducation bilingue tournée vers la réussite.",
                    "A bilingual education focused on success.",
                  )}
                </h2>
                <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink-soft">
                  <p>
                    {t(
                      "Au primaire, l'école poursuit sa mission de développer les connaissances, l'autonomie, la créativité et le sens des responsabilités de chaque enfant.",
                      "In primary school, the school continues its mission to develop each child's knowledge, independence, creativity and sense of responsibility.",
                    )}
                  </p>
                  <p>
                    {t(
                      "Les apprentissages accompagnent aussi la maîtrise du français et de l'anglais, conformément à l'identité bilingue de La Pépinière.",
                      "Learning also supports proficiency in French and English, in line with La Pépinière's bilingual identity.",
                    )}
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  {school.values.map((value) => (
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
                content={t(
                  "classe primaire africaine",
                  "African primary classroom",
                )}
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
                  {t("LES DEUX PARCOURS", "THE TWO PATHWAYS")}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  {t(
                    "Choisir la section qui correspond à votre enfant.",
                    "Choose the section that suits your child.",
                  )}
                </h2>
                <p className="mt-5 text-lg text-ink-soft">
                  {t(
                    "Deux sections primaires au sein d'un même établissement bilingue.",
                    "Two primary sections within the same bilingual school.",
                  )}
                </p>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {school.primary.pathways.map(
                ({ title, language, description }, index) => {
                  const Icon = PATHWAY_ICONS[index];
                  return (
                    <Reveal key={index} delay={0.12 + index * 0.1}>
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
                  {t("HORAIRES", "SCHOOL HOURS")}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  {t(
                    "Le rythme du primaire.",
                    "The primary school's daily rhythm.",
                  )}
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-ink-soft">
                  {t(
                    "Les horaires communiqués par l'établissement pour les sections primaires.",
                    "The hours provided by the school for the primary sections.",
                  )}
                </p>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {primaryHours.map(({ days, hours }, index) => (
                <Reveal key={index} delay={0.12 + index * 0.08}>
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
                content={t(
                  "élèves du primaire en classe",
                  "primary students in class",
                )}
              />
            </Reveal>
            <Reveal delay={0.16}>
              <div>
                <p className="text-sm font-medium tracking-[0.18em] text-secondary">
                  {t("REPÈRES PÉDAGOGIQUES", "TEACHING PRINCIPLES")}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  {t(
                    "Des valeurs qui accompagnent le parcours de chaque enfant.",
                    "Values that accompany every child's journey.",
                  )}
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-ink-soft">
                  {t(
                    "Discipline, travail, succès, respect, responsabilité et excellence sont les valeurs officielles de l'établissement.",
                    "Discipline, hard work, success, respect, responsibility and excellence are the school's official values.",
                  )}
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {school.values.map((value, index) => (
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
                {t("UNE ÉCOLE, DEUX LANGUES", "ONE SCHOOL, TWO LANGUAGES")}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                {t(
                  "Découvrir le primaire à La Pépinière.",
                  "Discover primary school at La Pépinière.",
                )}
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
              {GALLERY_CONTENT.map((content, index) => (
                <ImagePlaceholder
                  key={content.fr}
                  className={
                    index % 2 === 0
                      ? "aspect-square rounded-[28px_14px_28px_14px]"
                      : "aspect-square rounded-[14px_28px_14px_28px]"
                  }
                  content={t(content)}
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
                {t("PROCHAINE ÉTAPE", "NEXT STEP")}
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                {t(
                  "Préparez l'inscription de votre enfant.",
                  "Prepare your child's enrolment.",
                )}
              </h2>
            </div>
            <Link
              to="/admissions"
              className="inline-flex items-center justify-center gap-2 self-start rounded-btn bg-white px-5 py-3 text-sm font-medium text-primary shadow-soft transition-colors hover:bg-surface-alt"
            >
              <School size={17} />
              {t("Découvrir les admissions", "Discover admissions")}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
