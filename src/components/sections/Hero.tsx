import { motion, useReducedMotion } from "framer-motion";
import { Heart, Leaf, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";

import { useSchool } from "@/data/useSchool";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { useLanguage } from "@/i18n/useLanguage";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Hero() {
  const { lang, t } = useLanguage();
  const school = useSchool();
  const prefersReducedMotion = useReducedMotion();

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: prefersReducedMotion ? 0 : 0.12 },
    },
  };

  const itemTransition = {
    duration: prefersReducedMotion ? 0 : 0.6,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  return (
    <section
      id="accueil"
      className="relative scroll-mt-24 overflow-hidden bg-surface"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-secondary/5 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 h-56 w-56 rounded-full bg-accent-yellow/10 blur-3xl"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-16 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-2 lg:gap-12 lg:px-10 lg:py-20">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-xl"
        >
          <motion.div
            variants={fadeUp}
            transition={itemTransition}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-2 text-xs font-medium tracking-wide text-primary"
          >
            <Sparkles size={14} />
            {school.type.toUpperCase()}
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={itemTransition}
            className="text-4xl font-bold leading-[1.15] text-ink sm:text-5xl lg:text-[3.25rem]"
          >
            {lang === "fr" ? (
              <>
                Une autre vision de l'éducation{" "}
                <span className="text-secondary">bilingue</span>.
              </>
            ) : (
              <>
                A different vision of{" "}
                <span className="text-secondary">bilingual</span> education.
              </>
            )}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={itemTransition}
            className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft"
          >
            {school.vision}
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={itemTransition}
            className="mt-9 flex flex-wrap gap-4"
          >
            <Link
              to="/notre-ecole"
              className="rounded-btn bg-primary px-7 py-3.5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-primary-dark"
            >
              {t("Découvrir notre école", "Discover our school")}
            </Link>
            <Link
              to="/admissions"
              className="rounded-btn border border-border-soft bg-white px-7 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-surface-alt"
            >
              {t("Demander une inscription", "Request enrolment")}
            </Link>
          </motion.div>
          <motion.p
            variants={fadeUp}
            transition={itemTransition}
            className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-secondary"
          >
            {school.motto}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 36 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.7,
            delay: prefersReducedMotion ? 0 : 0.32,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative mx-auto w-full max-w-md pb-8 pr-6 lg:max-w-none lg:pb-10 lg:pr-8"
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-2 left-3 z-0 h-32 w-40 -rotate-12 rounded-[42%_58%_55%_45%] bg-accent-yellow/20 blur-[1px]"
            animate={
              prefersReducedMotion ? undefined : { rotate: [-12, -8, -12] }
            }
            transition={
              prefersReducedMotion
                ? undefined
                : { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-5 top-16 z-0 h-44 w-24 rotate-12 rounded-[55%_45%_48%_52%] bg-secondary/15"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-3 top-1/3 z-20 h-3 w-3 rotate-12 rounded-[40%_60%_55%_45%] bg-accent-coral shadow-[12px_8px_0_rgba(244,119,107,0.2),-8px_18px_0_rgba(245,185,66,0.25)]"
          />
          <Leaf
            aria-hidden
            className="pointer-events-none absolute -top-5 right-4 z-20 h-8 w-8 -rotate-12 text-secondary/60 lg:right-10"
          />

          <ImagePlaceholder
            className="relative z-10 aspect-4/5 w-full rounded-hero shadow-soft-lg"
            content={t(
              "enfants en classe, lumière naturelle",
              "children in class, natural light",
            )}
          />

          <FloatingStatCard prefersReducedMotion={prefersReducedMotion} />
          <FloatingQuoteCard prefersReducedMotion={prefersReducedMotion} />
        </motion.div>
      </div>
    </section>
  );
}

function FloatingStatCard({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean | null;
}) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.6,
        delay: prefersReducedMotion ? 0 : 0.62,
      }}
      className="absolute bottom-0 left-0 z-20"
    >
      <motion.div
        animate={prefersReducedMotion ? undefined : { y: [0, -6, 0] }}
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
        }
        className="flex items-center gap-3 rounded-card bg-white px-5 py-4 shadow-soft-lg"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-yellow/15 text-accent-yellow">
          <Star size={18} fill="currentColor" strokeWidth={0} />
        </span>
        <div>
          <p className="text-lg font-bold leading-none text-ink">10+</p>
          <p className="text-xs text-ink-soft">
            {t("années d'expérience", "years of experience")}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FloatingQuoteCard({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean | null;
}) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.6,
        delay: prefersReducedMotion ? 0 : 0.78,
      }}
      className="absolute right-0 top-0 z-20 hidden max-w-52 sm:block"
    >
      <motion.div
        animate={prefersReducedMotion ? undefined : { y: [0, 6, 0] }}
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }
        }
        className="flex items-center gap-3 rounded-card bg-white px-4 py-3.5 shadow-soft-lg"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-light text-secondary">
          <Heart size={16} fill="currentColor" strokeWidth={0} />
        </span>
        <p className="text-sm font-medium leading-snug text-ink">
          {t("Une école où chaque enfant compte.", "A school where every child matters.")}
        </p>
      </motion.div>
    </motion.div>
  );
}
