import {
  ArrowRight,
  Award,
  BookHeart,
  Compass,
  HeartHandshake,
  Lightbulb,
  Medal,
  Shield,
  Sparkles,
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

const MISSION = [
  {
    icon: Shield,
    title: tr("Connaissances", "Knowledge"),
    description: tr(
      "Développer les connaissances des enfants dès le bas âge.",
      "Develop children's knowledge from an early age.",
    ),
  },
  {
    icon: BookHeart,
    title: tr("Autonomie", "Independence"),
    description: tr(
      "Développer l'autonomie de chaque enfant.",
      "Develop each child's independence.",
    ),
  },
  {
    icon: Sparkles,
    title: tr("Créativité", "Creativity"),
    description: tr(
      "Développer la créativité et le sens des responsabilités.",
      "Develop creativity and a sense of responsibility.",
    ),
  },
  {
    icon: Medal,
    title: tr("Bilinguisme", "Bilingualism"),
    description: tr(
      "Favoriser la maîtrise du français et de l'anglais.",
      "Foster proficiency in French and English.",
    ),
  },
];

const VALUE_DESCRIPTION = tr(
  "Une valeur officielle du Groupe Scolaire Privé Bilingue La Pépinière.",
  "An official value of La Pépinière Bilingual Private School Group.",
);

const VALUES = [
  {
    icon: HeartHandshake,
    title: tr("Discipline", "Discipline"),
    description: VALUE_DESCRIPTION,
  },
  {
    icon: Award,
    title: tr("Travail", "Hard work"),
    description: VALUE_DESCRIPTION,
  },
  {
    icon: Shield,
    title: tr("Succès", "Success"),
    description: VALUE_DESCRIPTION,
  },
  {
    icon: Compass,
    title: tr("Respect", "Respect"),
    description: VALUE_DESCRIPTION,
  },
  {
    icon: Lightbulb,
    title: tr("Responsabilité", "Responsibility"),
    description: VALUE_DESCRIPTION,
  },
  {
    icon: Sparkles,
    title: tr("Excellence", "Excellence"),
    description: VALUE_DESCRIPTION,
  },
];

const ENVIRONMENT_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=900&q=80",
    alt: tr("Salle de classe lumineuse", "Bright classroom"),
  },
  {
    src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
    alt: tr("Enfants dans une salle de classe", "Children in a classroom"),
  },
  {
    src: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=900&q=80",
    alt: tr("Activité créative d'enfants", "Children's creative activity"),
  },
  {
    src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
    alt: tr("Espace de lecture pour enfants", "Reading area for children"),
  },
  {
    src: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80",
    alt: tr("Moment d'apprentissage partagé", "Shared learning moment"),
  },
];

export function OurSchoolPage() {
  const { t } = useLanguage();
  const school = useSchool();

  const highlights = [
    { label: t("Création", "Founded"), value: school.history.foundedOn },
    { label: t("Ouverture", "Opened"), value: school.history.openedIn },
    { label: t("Parcours", "Pathway"), value: t("Bilingue", "Bilingual") },
    { label: t("Implantation", "Location"), value: school.location.city },
  ];

  usePageMeta(
    `${t("Notre école", "Our school")} | ${school.shortName} — ${school.location.city}, ${school.location.country}`,
    t(
      "Découvrez le Groupe Scolaire Privé Bilingue La Pépinière à Bertoua : histoire, vision, mission et valeurs.",
      "Discover La Pépinière Bilingual Private School Group in Bertoua: history, vision, mission and values.",
    ),
  );

  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow={t("NOTRE ÉCOLE", "OUR SCHOOL")}
          title={t(
            "Une autre vision de l'éducation bilingue.",
            "A different vision of bilingual education.",
          )}
          description={t(
            `${school.name}, établissement privé bilingue situé à ${school.location.address}.`,
            `${school.name}, a bilingual private school located at ${school.location.address}.`,
          )}
          imageLabel={t(
            "élèves et équipe pédagogique",
            "students and teaching team",
          )}
        />

        <section
          id="presentation"
          className="bg-surface px-6 py-24 lg:px-10 lg:py-28"
        >
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal delay={0.08}>
              <div className="overflow-hidden rounded-[28px] border border-border-soft bg-white p-3 shadow-soft-lg">
                <ImagePlaceholder
                  className="aspect-4/5 w-full rounded-image"
                  content={t("vie de l'école", "school life")}
                />
              </div>
            </Reveal>
            <Reveal delay={0.16}>
              <div>
                <p className="text-sm font-medium tracking-[0.18em] text-primary">
                  {t("PRÉSENTATION", "OVERVIEW")}
                </p>
                <h2 className="mt-4 text-3xl font-bold text-ink sm:text-4xl">
                  {t("Bienvenue à La Pépinière", "Welcome to La Pépinière")}
                </h2>
                <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink-soft">
                  <p>
                    {t(
                      `${school.name} est un établissement d'enseignement maternel et primaire situé à Bertoua, dans le quartier Mokolo I (Sembé), à proximité de Talma Hôtel.`,
                      `${school.name} is a nursery and primary school located in Bertoua, in the Mokolo I (Sembé) neighbourhood, near Talma Hôtel.`,
                    )}
                  </p>
                  <p>
                    {t(
                      "L'établissement propose une éducation bilingue à travers ses sections francophone et anglophone, ainsi qu'un enseignement adapté aux enfants de la maternelle et du primaire.",
                      "The school offers a bilingual education through its French-speaking and English-speaking sections, with teaching adapted to nursery and primary school children.",
                    )}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="bg-surface-alt px-6 py-24 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal delay={0.08}>
              <div className="mx-auto max-w-3xl text-center">
                <p className="text-sm font-medium tracking-[0.18em] text-primary">
                  {t("NOTRE VISION", "OUR VISION")}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  {school.vision}
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-ink-soft">
                  {t(
                    "Une éducation bilingue de qualité, dans un environnement propice à l'épanouissement, à la discipline et à la réussite.",
                    "A quality bilingual education in an environment that supports personal growth, discipline and success.",
                  )}
                </p>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {highlights.map((item, index) => (
                <Reveal key={index} delay={0.12 + index * 0.08}>
                  <div className="rounded-card border border-border-soft bg-white p-6 shadow-soft">
                    <p className="text-sm font-medium text-primary">
                      {item.label}
                    </p>
                    <p className="mt-6 text-2xl font-bold text-ink">
                      {item.value}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface px-6 py-24 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal delay={0.08}>
              <div className="max-w-2xl">
                <p className="text-sm font-medium tracking-[0.18em] text-primary">
                  {t("NOTRE MISSION", "OUR MISSION")}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  {t(
                    "Former les enfants dès le bas âge en développant leurs connaissances, leur autonomie, leur créativité et leur sens des responsabilités.",
                    "To educate children from an early age by developing their knowledge, independence, creativity and sense of responsibility.",
                  )}
                </h2>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {MISSION.map(({ icon: Icon, title, description }, index) => (
                <Reveal key={title.fr} delay={0.12 + index * 0.08}>
                  <div className="rounded-card border border-border-soft bg-surface-alt p-6">
                    <Icon
                      className="text-secondary"
                      size={24}
                      strokeWidth={1.8}
                    />
                    <h3 className="mt-6 text-xl font-bold text-ink">
                      {t(title)}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                      {t(description)}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface-alt px-6 py-24 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-6xl">
            <Reveal delay={0.08}>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-medium tracking-[0.18em] text-primary">
                  {t("NOS VALEURS", "OUR VALUES")}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  {t(
                    "Les repères qui guident chaque jour notre mission.",
                    "The guiding principles behind our mission every day.",
                  )}
                </h2>
              </div>
            </Reveal>
            <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {VALUES.map(({ icon: Icon, title, description }, index) => (
                <Reveal key={title.fr} delay={0.12 + index * 0.08}>
                  <div className="rounded-card border border-border-soft bg-white p-6 shadow-soft transition-transform duration-300 hover:-translate-y-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
                      <Icon size={22} strokeWidth={1.8} />
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-ink">
                      {t(title)}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-ink-soft">
                      {t(description)}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface px-6 py-24 lg:px-10 lg:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="overflow-hidden rounded-[28px] border border-border-soft bg-white p-3 shadow-soft-lg">
              <ImagePlaceholder
                className="aspect-4/5 w-full rounded-image"
                content={t("direction de l'école", "school management")}
              />
            </div>
            <div>
              <p className="text-sm font-medium tracking-[0.18em] text-primary">
                {t("MOT DE LA DIRECTION", "MESSAGE FROM THE MANAGEMENT")}
              </p>
              <h2 className="mt-4 text-3xl font-bold text-ink sm:text-4xl">
                {t(
                  "Une équipe identifiée pour accompagner les sections de l'école.",
                  "A dedicated team supporting the school's sections.",
                )}
              </h2>
              <div className="mt-8 flex items-center gap-4 rounded-card border border-border-soft bg-surface-alt p-4">
                <Sparkles className="text-secondary" size={22} />
                <div>
                  <p className="font-semibold text-ink">
                    {t(
                      "[Nom du directeur / de la directrice]",
                      "[Name of the director]",
                    )}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {t("Direction de La Pépinière", "La Pépinière Management")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-alt px-6 py-24 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm font-medium tracking-[0.18em] text-primary">
              {t("NOTRE ENVIRONNEMENT", "OUR ENVIRONMENT")}
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold text-ink sm:text-4xl">
              {t(
                "Un cadre agréable pour apprendre, jouer et se construire.",
                "A pleasant setting to learn, play and grow.",
              )}
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
              {ENVIRONMENT_IMAGES.map(({ src, alt }) => (
                <div
                  key={src}
                  className="aspect-square overflow-hidden rounded-card bg-surface"
                >
                  <img
                    src={src}
                    alt={t(alt)}
                    loading="lazy"
                    width="900"
                    height="900"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary px-6 py-20 text-white lg:px-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium tracking-[0.18em] text-white/80">
                {t("POUR ALLER PLUS LOIN", "GO FURTHER")}
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                {t(
                  "Découvrez l'univers de La Pépinière.",
                  "Discover the world of La Pépinière.",
                )}
              </h2>
            </div>
            <Link
              to="/maternelle"
              className="inline-flex items-center justify-center gap-2 self-start rounded-btn bg-white px-5 py-3 text-sm font-medium text-primary shadow-soft transition-colors hover:bg-surface-alt"
            >
              {t("Découvrir nos programmes", "Discover our programmes")}
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
