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
import { SCHOOL } from "@/data/school";

const BENEFITS = [
  {
    icon: Heart,
    title: "Un environnement bienveillant",
    text: "Un cadre attentif qui respecte le rythme et les besoins de chaque enfant.",
  },
  {
    icon: Users,
    title: "Un accompagnement adapté",
    text: "Une équipe disponible pour accompagner les familles à chaque étape.",
  },
  {
    icon: ShieldCheck,
    title: "Un apprentissage structuré",
    text: "Des repères clairs pour apprendre, progresser et prendre confiance.",
  },
  {
    icon: Sparkles,
    title: "L'épanouissement au quotidien",
    text: "Des expériences variées pour nourrir la curiosité et l’autonomie.",
  },
];

const STEPS = [
  [
    "01",
    "Prendre contact",
    "Le parent contacte l'école pour obtenir les premières informations.",
  ],
  [
    "02",
    "Découvrir l'école",
    "Possibilité de visiter l'établissement et d'échanger avec l'équipe.",
  ],
  [
    "03",
    "Déposer le dossier",
    "Le parent fournit les documents nécessaires à l’inscription.",
  ],
  [
    "04",
    "Finaliser l'inscription",
    "L’inscription est finalisée après validation du dossier.",
  ],
];

const DOCUMENTS = SCHOOL.admissions.documents;

const FAQ = SCHOOL.admissions.faq;

const LEVELS = [
  "Petite Section",
  "Moyenne Section",
  "Grande Section",
  "SIL",
  "CP",
  "CE1",
  "CE2",
  "CM1",
  "CM2",
];

type FormStatus = "idle" | "loading" | "success" | "error";

export function Admissions() {
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
                Préparer la prochaine étape de votre enfant.
              </h2>
            </div>
            <p className="text-base leading-relaxed text-ink-soft sm:text-lg">
              La Pépinière accompagne les enfants dans leur développement et
              leurs apprentissages. Parlons ensemble du projet qui correspond à
              votre famille.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <Link
                to="/admissions"
                className="rounded-btn bg-primary px-6 py-3.5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-primary-dark"
              >
                Demander une inscription
              </Link>
              <Link
                to="/contact"
                className="rounded-btn border border-border-soft bg-white px-6 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-surface"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-card border border-border-soft bg-white p-6 shadow-soft"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
                <Icon size={20} strokeWidth={1.8} />
              </span>
              <h3 className="mt-5 text-base font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {text}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-24">
          <p className="text-sm font-medium tracking-wide text-primary">
            LE PARCOURS
          </p>
          <h3 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">
            Une inscription en quatre étapes.
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
                <h4 className="mt-3 text-lg font-semibold text-ink">{title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-24 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-medium tracking-wide text-primary">
              À PRÉVOIR
            </p>
            <h3 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">
              Documents nécessaires
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              Liste indicative à confirmer par l’administration de l’école.
            </p>
            <ul className="mt-7 space-y-4">
              {DOCUMENTS.map((document) => (
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
              PREMIER ÉCHANGE
            </p>
            <h3 className="mt-3 text-2xl font-bold text-ink">
              Demander une inscription
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Parlez-nous de votre projet et notre équipe pourra vous orienter
              vers les prochaines étapes.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 grid gap-5 sm:grid-cols-2"
            >
              <label className="text-sm font-medium text-ink">
                Nom du parent / tuteur
                <input
                  required
                  name="parentName"
                  className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none transition-colors focus:border-primary"
                />
              </label>
              <label className="text-sm font-medium text-ink">
                Téléphone
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
                Nom de l’enfant
                <input
                  required
                  name="childName"
                  className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none transition-colors focus:border-primary"
                />
              </label>
              <label className="text-sm font-medium text-ink">
                Date de naissance
                <input
                  required
                  type="date"
                  name="birthDate"
                  className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none transition-colors focus:border-primary"
                />
              </label>
              <label className="text-sm font-medium text-ink">
                Niveau souhaité
                <select
                  required
                  name="level"
                  defaultValue=""
                  className="mt-2 w-full rounded-btn border border-border-soft bg-white px-4 py-3 font-normal outline-none transition-colors focus:border-primary"
                >
                  <option value="" disabled>
                    Choisir un niveau
                  </option>
                  {LEVELS.map((level) => (
                    <option key={level}>{level}</option>
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
                    ? "Envoi en cours..."
                    : "Envoyer une demande"}
                </button>
                {status === "success" && (
                  <p
                    role="status"
                    className="flex items-center gap-2 text-sm text-secondary"
                  >
                    <CheckCircle2 size={17} /> Demande enregistrée pour
                    démonstration.
                  </p>
                )}
                {status === "error" && (
                  <p role="alert" className="text-sm text-accent-coral">
                    Une erreur est survenue. Réessayez.
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="mx-auto mt-24 max-w-3xl">
          <p className="text-center text-sm font-medium tracking-wide text-primary">
            QUESTIONS FRÉQUENTES
          </p>
          <h3 className="mt-3 text-center text-2xl font-bold text-ink sm:text-3xl">
            Les premières réponses à vos questions.
          </h3>
          <div className="mt-8 divide-y divide-border-soft rounded-card border border-border-soft bg-white px-6">
            {FAQ.map(([question, answer], index) => (
              <div key={question}>
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
