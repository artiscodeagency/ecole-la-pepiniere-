import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Reveal } from "@/components/ui/Reveal";

interface Testimonial {
  name: string;
  role: string;
  text: string;
  initials: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sophie L.",
    role: "Parent d’élève",
    text: "Une école douce, attentive et exigeante à la fois. Mon enfant est heureux d’y aller chaque matin et nous avons vraiment l’impression qu’il grandit dans un environnement bienveillant.",
    initials: "SL",
  },
  {
    name: "Karim A.",
    role: "Parent d’élève",
    text: "Le cadre est rassurant et les équipes sont très présentes. On sent une vraie attention portée à chacun, tant sur le plan pédagogique que sur le bien-être des enfants.",
    initials: "KA",
  },
  {
    name: "Claire M.",
    role: "Parent d’élève",
    text: "Nous avons choisi La Pépinière pour son équilibre entre exigence, chaleur humaine et apprentissage structuré. C’est exactement ce que nous cherchions pour nos enfants.",
    initials: "CM",
  },
];

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % TESTIMONIALS.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const visibleTestimonials = useMemo(() => {
    const result: Testimonial[] = [];

    for (let index = 0; index < 3; index += 1) {
      result.push(TESTIMONIALS[(activeIndex + index) % TESTIMONIALS.length]);
    }

    return result;
  }, [activeIndex]);

  const previous = () =>
    setActiveIndex(
      (currentIndex) =>
        (currentIndex - 1 + TESTIMONIALS.length) % TESTIMONIALS.length,
    );
  const next = () =>
    setActiveIndex((currentIndex) => (currentIndex + 1) % TESTIMONIALS.length);

  return (
    <section className="bg-white px-6 py-24 lg:px-10 lg:py-32">
      <Reveal delay={0.05}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-wide text-primary">
            TÉMOIGNAGES
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">
            La confiance des parents compte.
          </h2>
        </div>
      </Reveal>

      <div className="mx-auto mt-16 max-w-6xl">
        <Reveal delay={0.12}>
          <div className="mb-6 flex items-center justify-end gap-2">
            <button
              type="button"
              aria-label="Témoignage précédent"
              onClick={previous}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border-soft bg-white text-ink transition-colors hover:border-primary hover:text-primary"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Témoignage suivant"
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border-soft bg-white text-ink transition-colors hover:border-primary hover:text-primary"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-3">
          {visibleTestimonials.map(({ name, role, text, initials }, index) => (
            <Reveal key={`${name}-${index}`} delay={0.18 + index * 0.08}>
              <article className="rounded-card border border-border-soft bg-white p-7 shadow-soft transition-shadow duration-300 hover:shadow-soft-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
                    {initials}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-ink">{name}</p>
                    <p className="text-sm text-ink-soft">{role}</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-1 text-accent-yellow">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={`${name}-star-${starIndex}`}
                      size={16}
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  ))}
                </div>

                <p className="mt-5 text-base leading-relaxed text-ink-soft">
                  “{text}”
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
