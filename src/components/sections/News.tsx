import { ArrowRight, BellRing } from "lucide-react";
import { Link } from "react-router-dom";

import { Reveal } from "@/components/ui/Reveal";
import { useSchool } from "@/data/useSchool";
import { useLanguage } from "@/i18n/useLanguage";

export function News() {
  const { lang, t } = useLanguage();
  const school = useSchool();
  const categories = school.news.categories.slice(0, 3).join(", ");

  return (
    <section
      id="actualites"
      className="bg-surface-alt px-6 py-24 lg:px-10 lg:py-32"
    >
      <Reveal delay={0.05}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium tracking-wide text-primary">
            {t("ACTUALITÉS", "NEWS")}
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">
            {t(
              "Les dernières nouvelles de l'école",
              "The latest news from the school",
            )}
          </h2>
        </div>
      </Reveal>
      <Reveal delay={0.14}>
        <div className="mx-auto mt-14 max-w-4xl rounded-[30px_16px_30px_16px] border border-border-soft bg-white p-8 text-center shadow-soft sm:p-10">
          <span className="mx-auto flex h-13 w-13 items-center justify-center rounded-full bg-primary-light text-primary">
            <BellRing size={25} />
          </span>
          <h3 className="mt-6 text-2xl font-bold text-ink">
            {t(
              "Les actualités officielles arrivent bientôt.",
              "Official news is coming soon.",
            )}
          </h3>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-ink-soft">
            {lang === "fr"
              ? `Les publications de La Pépinière seront ajoutées après communication officielle : ${categories} et plus encore.`
              : `La Pépinière's posts will be added after official communication: ${categories} and more.`}
          </p>
          <Link
            to="/actualites"
            className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary-dark"
          >
            {t("Voir les rubriques d'actualités", "View the news categories")}{" "}
            <ArrowRight size={16} />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
