import {
  CheckCircle2,
  ChevronDown,
  FileText,
  Heart,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";

import { Reveal } from "@/components/ui/Reveal";
import { useSchool } from "@/data/useSchool";
import { type Localized, tr } from "@/i18n/types";
import { useLanguage } from "@/i18n/useLanguage";

const BENEFITS = [
  {
    icon: Heart,
    title: tr("Un environnement bienveillant", "A caring environment"),
    text: tr(
      "Un cadre attentif qui respecte le rythme et les besoins de chaque enfant.",
      "An attentive setting that respects each child's pace and needs.",
    ),
  },
  {
    icon: Users,
    title: tr("Un accompagnement adapté", "Tailored support"),
    text: tr(
      "Une équipe disponible pour accompagner les familles à chaque étape.",
      "A team available to support families at every step.",
    ),
  },
  {
    icon: ShieldCheck,
    title: tr("Un apprentissage structuré", "Structured learning"),
    text: tr(
      "Des repères clairs pour apprendre, progresser et prendre confiance.",
      "Clear guidelines to help children learn, progress and build confidence.",
    ),
  },
  {
    icon: Sparkles,
    title: tr("L'épanouissement au quotidien", "Everyday personal growth"),
    text: tr(
      "Des expériences variées pour nourrir la curiosité et l’autonomie.",
      "Varied experiences to nurture curiosity and independence.",
    ),
  },
];

const STEPS: [string, Localized, Localized][] = [
  [
    "01",
    tr("Prendre contact", "Get in touch"),
    tr(
      "Le parent contacte l'école pour obtenir les premières informations.",
      "Parents contact the school to get the first information.",
    ),
  ],
  [
    "02",
    tr("Découvrir l'école", "Discover the school"),
    tr(
      "Possibilité de visiter l'établissement et d'échanger avec l'équipe.",
      "Option to visit the school and speak with the team.",
    ),
  ],
  [
    "03",
    tr("Déposer le dossier", "Submit the application"),
    tr(
      "Le parent fournit les documents nécessaires à l’inscription.",
      "Parents provide the documents required for enrolment.",
    ),
  ],
  [
    "04",
    tr("Finaliser l'inscription", "Complete the enrolment"),
    tr(
      "L’inscription est finalisée après validation du dossier.",
      "Enrolment is completed once the application has been approved.",
    ),
  ],
];

const LEVELS = [
  tr("Petite Section", "Small Section"),
  tr("Moyenne Section", "Middle Section"),
  tr("Grande Section", "Large Section"),
  tr("SIL", "SIL"),
  tr("CP", "CP"),
  tr("CE1", "CE1"),
  tr("CE2", "CE2"),
  tr("CM1", "CM1"),
  tr("CM2", "CM2"),
];

type FormStatus = "idle" | "loading" | "success" | "error";

export function Admissions() {
  const { t } = useLanguage();
  const school = useSchool();
  const documents = school.admissions.documents;
  const faq = school.admissions.faq;
  const [status, setStatus] = useState<FormStatus>("idle");
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    window.setTimeout(() => setStatus("success"), 700);
  };

  return (
    <section
      id="admissions"
      className="scroll-mt-24 bg-surface-alt px-6 py-24 lg:px-10 lg:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal delay={0.05}>
          <div className="grid items-end gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-sm font-medium tracking-wide text-primary">
                ADMISSIONS
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-ink sm:text-4xl lg:text-5xl">
                {t(
                  "Préparer la prochaine étape de votre enfant.",
                  "Prepare your child's next step.",
                )}
              </h2>
            </div>
            <p className="text-base leading-relaxed text-ink-soft sm:text-lg">
              {t(
                "La Pépinière accompagne les enfants dans leur développement et leurs apprentissages. Parlons ensemble du projet qui correspond à votre famille.",
                "La Pépinière supports children in their development and learning. Let's talk together about the plan that suits your family.",
              )}
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link
                to="/admissions"
                className="rounded-btn bg-primary px-6 py-3.5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-primary-dark"
              >
                {t("Demander une inscription", "Request enrolment")}
              </Link>
              <Link
                to="/contact"
                className="rounded-btn border border-border-soft bg-white px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-surface"
              >
                {t("Nous contacter", "Contact us")}
              </Link>
            </div>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <article
              key={title.fr}
              className="rounded-card border border-border-soft bg-white p-6 shadow-soft"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
                <Icon size={20} strokeWidth={1.8} />
              </span>
              <h3 className="mt-5 text-base font-semibold text-ink">
                {t(title)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {t(text)}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-24">
          <p className="text-sm font-medium tracking-wide text-primary">
            {t("LE PARCOURS", "THE PROCESS")}
          </p>
          <h3 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">
            {t(
              "Une inscription en quatre étapes.",
              "Enrolment in four steps.",
            )}
          </h3>
          <div className="mt-10 grid gap-6 lg:grid-cols-4">
            {STEPS.map(([number, title, text]) => (
              <article
                key={number}
                className="relative border-l-2 border-primary/15 pl-5 lg:border-l-0 lg:border-t-2 lg:pl-0 lg:pt-5"
              >
                <span className="text-sm font-semibold text-primary">
                  {number}
                </span>
                <h4 className="mt-3 text-lg font-semibold text-ink">
                  {t(title)}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {t(text)}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-24 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-medium tracking-wide text-primary">
              {t("À PRÉVOIR", "TO PREPARE")}
            </p>
            <h3 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">
              {t("Documents nécessaires", "Required documents")}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              {t(
                "Liste indicative à confirmer par l’administration de l’école.",
                "Indicative list, to be confirmed by the school administration.",
              )}
            </p>
            <ul className="mt-7 space-y-4">
              {documents.map((document) => (
                <li
                  key={document}
                  className="flex items-start gap-3 text-sm text-ink-soft"
                >
                  <FileText
                    size={18}
                    className="mt-0.5 shrink-0 text-primary"
                  />
                  <span>{document}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            id="demande-inscription"
            className="scroll-mt-24 rounded-card border border-border-soft bg-white p-6 shadow-soft sm:p-8"
          >
            <p className="text-sm font-medium tracking-wide text-primary">
              {t("PREMIER ÉCHANGE", "FIRST CONTACT")}
            </p>
            <h3 className="mt-3 text-2xl font-bold text-ink">
              {t("Demander une inscription", "Request enrolment")}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              {t(
                "Parlez-nous de votre projet et notre équipe pourra vous orienter vers les prochaines étapes.",
                "Tell us about your plans and our team can guide you through the next steps.",
              )}
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 grid gap-5 sm:grid-cols-2"
            >
              <label className="text-sm font-medium text-ink">
                {t("Nom du parent / tuteur", "Parent / guardian name")}
                <input
                  required
                  name="parentName"
                  className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none transition-colors focus:border-primary"
                />
              </label>
              <label className="text-sm font-medium text-ink">
                {t("Téléphone", "Phone")}
                <input
                  required
                  type="tel"
                  name="phone"
                  className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none transition-colors focus:border-primary"
                />
              </label>
              <label className="text-sm font-medium text-ink">
                Email
                <input
                  required
                  type="email"
                  name="email"
                  className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none transition-colors focus:border-primary"
                />
              </label>
              <label className="text-sm font-medium text-ink">
                {t("Nom de l’enfant", "Child's name")}
                <input
                  required
                  name="childName"
                  className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none transition-colors focus:border-primary"
                />
              </label>
              <label className="text-sm font-medium text-ink">
                {t("Date de naissance", "Date of birth")}
                <input
                  required
                  type="date"
                  name="birthDate"
                  className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none transition-colors focus:border-primary"
                />
              </label>
              <label className="text-sm font-medium text-ink">
                {t("Niveau souhaité", "Desired level")}
                <select
                  required
                  name="level"
                  defaultValue=""
                  className="mt-2 w-full rounded-btn border border-border-soft bg-white px-4 py-3 font-normal outline-none transition-colors focus:border-primary"
                >
                  <option value="" disabled>
                    {t("Choisir un niveau", "Choose a level")}
                  </option>
                  {LEVELS.map((level) => (
                    <option key={level.fr} value={level.fr}>
                      {t(level)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-ink sm:col-span-2">
                Message
                <textarea
                  required
                  name="message"
                  rows={4}
                  className="mt-2 w-full resize-y rounded-btn border border-border-soft px-4 py-3 font-normal outline-none transition-colors focus:border-primary"
                />
              </label>
              <div className="sm:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                  disabled={status === "loading"}
                  type="submit"
                  className="rounded-btn bg-primary px-6 py-3.5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "loading"
                    ? t("Envoi en cours...", "Sending...")
                    : t("Envoyer une demande", "Send request")}
                </button>
                {status === "success" && (
                  <p
                    role="status"
                    className="flex items-center gap-2 text-sm text-secondary"
                  >
                    <CheckCircle2 size={17} />{" "}
                    {t(
                      "Demande enregistrée pour démonstration.",
                      "Request saved for demonstration.",
                    )}
                  </p>
                )}
                {status === "error" && (
                  <p role="alert" className="text-sm text-accent-coral">
                    {t(
                      "Une erreur est survenue. Réessayez.",
                      "An error occurred. Please try again.",
                    )}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="mx-auto mt-24 max-w-3xl">
          <p className="text-center text-sm font-medium tracking-wide text-primary">
            {t("QUESTIONS FRÉQUENTES", "FREQUENTLY ASKED QUESTIONS")}
          </p>
          <h3 className="mt-3 text-center text-2xl font-bold text-ink sm:text-3xl">
            {t(
              "Les premières réponses à vos questions.",
              "First answers to your questions.",
            )}
          </h3>
          <div className="mt-8 divide-y divide-border-soft rounded-card border border-border-soft bg-white px-6">
            {faq.map(([question, answer], index) => (
              <div key={index}>
                <button
                  type="button"
                  aria-expanded={openQuestion === index}
                  onClick={() =>
                    setOpenQuestion(openQuestion === index ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-4 py-5 text-left text-sm font-medium text-ink"
                >
                  {question}
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-primary transition-transform ${openQuestion === index ? "rotate-180" : ""}`}
                  />
                </button>
                {openQuestion === index && (
                  <p className="pb-5 pr-8 text-sm leading-relaxed text-ink-soft">
                    {answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
