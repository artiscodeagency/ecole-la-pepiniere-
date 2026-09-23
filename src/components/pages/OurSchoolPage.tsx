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
import { useEffect } from "react";
import { Link } from "react-router-dom";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SCHOOL } from "@/data/school";

const MISSION = [
  {
    icon: Shield,
    title: "Connaissances",
    description: "Développer les connaissances des enfants dès le bas âge.",
  },
  {
    icon: BookHeart,
    title: "Autonomie",
    description: "Développer l'autonomie de chaque enfant.",
  },
  {
    icon: Sparkles,
    title: "Créativité",
    description: "Développer la créativité et le sens des responsabilités.",
  },
  {
    icon: Medal,
    title: "Bilinguisme",
    description: "Favoriser la maîtrise du français et de l'anglais.",
  },
];

const VALUES = [
  {
    icon: HeartHandshake,
    title: "Discipline",
    description:
      "Une valeur officielle du Groupe Scolaire Privé Bilingue La Pépinière.",
  },
  {
    icon: Award,
    title: "Travail",
    description:
      "Une valeur officielle du Groupe Scolaire Privé Bilingue La Pépinière.",
  },
  {
    icon: Shield,
    title: "Succès",
    description:
      "Une valeur officielle du Groupe Scolaire Privé Bilingue La Pépinière.",
  },
  {
    icon: Compass,
    title: "Respect",
    description:
      "Une valeur officielle du Groupe Scolaire Privé Bilingue La Pépinière.",
  },
  {
    icon: Lightbulb,
    title: "Responsabilité",
    description:
      "Une valeur officielle du Groupe Scolaire Privé Bilingue La Pépinière.",
  },
  {
    icon: Sparkles,
    title: "Excellence",
    description:
      "Une valeur officielle du Groupe Scolaire Privé Bilingue La Pépinière.",
  },
];

const HIGHLIGHTS = [
  { label: "Création", value: SCHOOL.history.foundedOn },
  { label: "Ouverture", value: SCHOOL.history.openedIn },
  { label: "Parcours", value: "Bilingue" },
  { label: "Implantation", value: SCHOOL.location.city },
];

const ENVIRONMENT_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=900&q=80",
    alt: "Salle de classe lumineuse",
  },
  {
    src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
    alt: "Enfants dans une salle de classe",
  },
  {
    src: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=900&q=80",
    alt: "Activité créative d'enfants",
  },
  {
    src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
    alt: "Espace de lecture pour enfants",
  },
  {
    src: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80",
    alt: "Moment d'apprentissage partagé",
  },
];

export function OurSchoolPage() {
  useEffect(() => {
    document.title = `Notre école | ${SCHOOL.shortName} — Bertoua, Cameroun`;
    const description =
      "Découvrez le Groupe Scolaire Privé Bilingue La Pépinière à Bertoua : histoire, vision, mission et valeurs.";
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
          eyebrow="NOTRE ÉCOLE"
          title="Une autre vision de l'éducation bilingue."
          description={`${SCHOOL.name}, établissement privé bilingue situé à ${SCHOOL.location.address}.`}
          imageLabel="élèves et équipe pédagogique"
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
                  content="vie de l'école"
                />
              </div>
            </Reveal>
            <Reveal delay={0.16}>
              <div>
                <p className="text-sm font-medium tracking-[0.18em] text-primary">
                  PRÉSENTATION
                </p>
                <h2 className="mt-4 text-3xl font-bold text-ink sm:text-4xl">
                  Bienvenue à La Pépinière
                </h2>
                <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink-soft">
                  <p>
                    {SCHOOL.name} est un établissement d'enseignement maternel
                    et primaire situé à Bertoua, dans le quartier Mokolo I
                    (Sembé), à proximité de Talma Hôtel.
                  </p>
                  <p>
                    L'établissement propose une éducation bilingue à travers ses
                    sections francophone et anglophone, ainsi qu'un enseignement
                    adapté aux enfants de la maternelle et du primaire.
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
                  NOTRE VISION
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  {SCHOOL.vision}
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-ink-soft">
                  Une éducation bilingue de qualité, dans un environnement
                  propice à l'épanouissement, à la discipline et à la réussite.
                </p>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {HIGHLIGHTS.map((item, index) => (
                <Reveal key={item.label} delay={0.12 + index * 0.08}>
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
                  NOTRE MISSION
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  Former les enfants dès le bas âge en développant leurs
                  connaissances, leur autonomie, leur créativité et leur sens
                  des responsabilités.
                </h2>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {MISSION.map(({ icon: Icon, title, description }, index) => (
                <Reveal key={title} delay={0.12 + index * 0.08}>
                  <div className="rounded-card border border-border-soft bg-surface-alt p-6">
                    <Icon
                      className="text-secondary"
                      size={24}
                      strokeWidth={1.8}
                    />
                    <h3 className="mt-6 text-xl font-bold text-ink">{title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                      {description}
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
                  NOS VALEURS
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  Les repères qui guident chaque jour notre mission.
                </h2>
              </div>
            </Reveal>
            <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {VALUES.map(({ icon: Icon, title, description }, index) => (
                <Reveal key={title} delay={0.12 + index * 0.08}>
                  <div className="rounded-card border border-border-soft bg-white p-6 shadow-soft transition-transform duration-300 hover:-translate-y-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
                      <Icon size={22} strokeWidth={1.8} />
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-ink">{title}</h3>
                    <p className="mt-3 text-base leading-relaxed text-ink-soft">
                      {description}
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
                content="direction de l'école"
              />
            </div>
            <div>
              <p className="text-sm font-medium tracking-[0.18em] text-primary">
                MOT DE LA DIRECTION
              </p>
              <h2 className="mt-4 text-3xl font-bold text-ink sm:text-4xl">
                Une équipe identifiée pour accompagner les sections de l'école.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-ink-soft">
                Les responsables et fonctions officielles de l'établissement
                seront présentés avec leurs informations validées.
              </p>
              <div className="mt-8 flex items-center gap-4 rounded-card border border-border-soft bg-surface-alt p-4">
                <Sparkles className="text-secondary" size={22} />
                <div>
                  <p className="font-semibold text-ink">
                    [Nom du directeur / de la directrice]
                  </p>
                  <p className="text-sm text-ink-soft">
                    Direction de La Pépinière
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-alt px-6 py-24 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-4xl">
            <p className="text-sm font-medium tracking-[0.18em] text-primary">
              NOTRE ENVIRONNEMENT
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold text-ink sm:text-4xl">
              Un cadre agréable pour apprendre, jouer et se construire.
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
              {ENVIRONMENT_IMAGES.map(({ src, alt }) => (
                <div
                  key={src}
                  className="aspect-square overflow-hidden rounded-card bg-surface"
                >
                  <img
                    src={src}
                    alt={alt}
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
                POUR ALLER PLUS LOIN
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Découvrez l'univers de La Pépinière.
              </h2>
            </div>
            <Link
              to="/maternelle"
              className="inline-flex items-center justify-center gap-2 self-start rounded-btn bg-white px-5 py-3 text-sm font-medium text-primary shadow-soft transition-colors hover:bg-surface-alt"
            >
              Découvrir nos programmes
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
