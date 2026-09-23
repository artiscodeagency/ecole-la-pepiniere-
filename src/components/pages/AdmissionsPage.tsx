import {
  CheckCircle2,
  ChevronDown,
  FileText,
  Heart,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageHero } from "@/components/ui/PageHero";
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
    text: "Des expériences variées pour nourrir la curiosité et l'autonomie.",
  },
];

const STEPS = [
  [
    "01",
    "Prendre contact",
    "Obtenir les premières informations et parler du projet de votre enfant.",
  ],
  [
    "02",
    "Visiter l'école",
    "Découvrir les espaces et échanger avec l'équipe pédagogique.",
  ],
  [
    "03",
    "Déposer le dossier",
    "Fournir les documents nécessaires à l'étude de la demande.",
  ],
  [
    "04",
    "Finaliser l'inscription",
    "Recevoir la confirmation et préparer sereinement la rentrée.",
  ],
];

const DOCUMENTS = SCHOOL.admissions.documents;
const LEVELS = SCHOOL.sections;
const FAQ = [
  [
    "À partir de quel âge peut-on inscrire un enfant ?",
    "L'âge d'admission et les conditions associées seront confirmés par l'administration selon la classe demandée.",
  ],
  [
    "Quelles classes sont proposées ?",
    "La Pépinière accueille les enfants de la maternelle au primaire. Les niveaux disponibles sont à confirmer pour chaque rentrée.",
  ],
  [
    "Quels documents faut-il fournir ?",
    "La liste officielle pour la rentrée 2026–2027 est affichée sur cette page.",
  ],
  [
    "Peut-on visiter l'école avant l'inscription ?",
    "Une visite peut être organisée selon les disponibilités de l'équipe. Contactez l'école pour préparer ce rendez-vous.",
  ],
  [
    "Quels sont les horaires ?",
    "Les horaires de la maternelle et du primaire sont disponibles sur les pages de chaque section.",
  ],
  [
    "Comment connaître les frais de scolarité ?",
    "Les frais communiqués pour la rentrée 2026–2027 sont affichés sur cette page.",
  ],
];

type FormStatus = "idle" | "loading" | "success";

export function AdmissionsPage() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  useEffect(() => {
    document.title = `Admissions | ${SCHOOL.shortName} — Bertoua, Cameroun`;
    const description =
      "Admissions 2026–2027 au Groupe Scolaire Privé Bilingue La Pépinière à Bertoua : documents requis et frais officiels.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    window.setTimeout(() => setStatus("success"), 700);
  };

  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="ADMISSIONS"
          title="Préparer la rentrée 2026–2027 de votre enfant."
          description="Retrouvez les documents et les frais communiqués par La Pépinière pour préparer l'inscription."
          imageLabel="famille africaine et école"
        />
        <section className="relative overflow-hidden bg-surface px-6 py-20 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 top-12 h-32 w-32 rounded-[45%_55%_58%_42%] bg-accent-yellow/15"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-[14%] bottom-12 h-4 w-24 -rotate-6 rounded-full bg-accent-coral/45"
          />
          <div className="relative mx-auto max-w-6xl">
            <Reveal delay={0.08}>
              <div className="flex flex-col gap-6 rounded-[30px_16px_30px_16px] bg-surface-alt p-7 shadow-soft sm:p-10 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-medium tracking-[0.18em] text-primary">
                    PREMIÈRE ÉTAPE
                  </p>
                  <h2 className="mt-3 max-w-2xl text-3xl font-bold text-ink sm:text-4xl">
                    Parlons ensemble du projet de votre famille.
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
                    Une première demande permet de comprendre vos attentes, de
                    vous orienter vers le niveau adapté et de préciser les
                    prochaines étapes.
                  </p>
                </div>
                <a
                  href="#demande-inscription"
                  className="inline-flex shrink-0 items-center justify-center rounded-btn bg-primary px-6 py-3.5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-primary-dark"
                >
                  Demander une inscription
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="relative overflow-hidden bg-surface-alt px-6 py-20 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-8 top-16 h-28 w-36 rotate-6 rounded-[55%_45%_62%_38%] bg-secondary/10"
          />
          <div className="relative mx-auto max-w-6xl">
            <Reveal delay={0.08}>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-medium tracking-[0.18em] text-secondary">
                  POURQUOI LA PÉPINIÈRE ?
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  Un choix guidé par la confiance.
                </h2>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFITS.map(({ icon: Icon, title, text }, index) => (
                <Reveal key={title} delay={0.12 + index * 0.08}>
                  <article className="group rounded-[24px_14px_24px_14px] border border-border-soft bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                      <Icon size={20} />
                    </span>
                    <h3 className="mt-5 text-base font-semibold text-ink">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {text}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-surface-alt px-6 py-20 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 top-12 h-32 w-32 rounded-full bg-secondary/10"
          />
          <div className="relative mx-auto max-w-6xl">
            <Reveal delay={0.08}>
              <div className="max-w-3xl">
                <p className="text-sm font-medium tracking-[0.18em] text-primary">
                  FRAIS 2026–2027
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  Les frais communiqués par l'établissement.
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-ink-soft">
                  Les montants ci-dessous concernent la rentrée académique{" "}
                  {SCHOOL.admissions.academicYear}.
                </p>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ["Inscription", SCHOOL.admissions.fees.registration],
                ["Carnet de notes", SCHOOL.admissions.fees.reportBook],
                ["Badge maternelle", SCHOOL.admissions.fees.kindergartenBadge],
                [
                  "Fournitures maternelle",
                  SCHOOL.admissions.fees.kindergartenSupplies,
                ],
                ["Papier hygiénique", SCHOOL.admissions.fees.toiletPaper],
              ].map(([label, value], index) => (
                <Reveal key={label} delay={0.12 + index * 0.08}>
                  <div className="rounded-[20px_12px_20px_12px] border border-border-soft bg-white p-5 shadow-soft">
                    <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
                      {label}
                    </p>
                    <p className="mt-3 text-lg font-bold text-primary">
                      {value}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.18}>
              <div className="mt-10 overflow-x-auto rounded-[28px_14px_28px_14px] border border-border-soft bg-white shadow-soft">
                <table className="w-full min-w-175 text-left text-sm">
                  <caption className="px-6 pt-6 text-left text-lg font-bold text-ink">
                    Frais de scolarité
                  </caption>
                  <thead className="text-xs uppercase tracking-[0.08em] text-ink-soft">
                    <tr className="border-b border-border-soft">
                      <th className="px-6 py-4">Section</th>
                      <th className="px-6 py-4">1ère tranche</th>
                      <th className="px-6 py-4">2ème tranche</th>
                      <th className="px-6 py-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCHOOL.admissions.schoolFees.map((fee) => (
                      <tr
                        key={fee.section}
                        className="border-b border-border-soft last:border-0"
                      >
                        <th className="px-6 py-4 font-semibold text-ink">
                          {fee.section}
                        </th>
                        <td className="px-6 py-4 text-ink-soft">
                          {fee.firstInstallment}
                        </td>
                        <td className="px-6 py-4 text-ink-soft">
                          {fee.secondInstallment}
                        </td>
                        <td className="px-6 py-4 font-bold text-primary">
                          {fee.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
            <div className="mt-5 flex flex-col gap-2 text-sm text-ink-soft sm:flex-row sm:gap-8">
              <p>
                <strong className="text-ink">1ère tranche :</strong>{" "}
                {SCHOOL.admissions.installmentDates.first}
              </p>
              <p>
                <strong className="text-ink">2ème tranche :</strong>{" "}
                {SCHOOL.admissions.installmentDates.second}
              </p>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-surface px-6 py-20 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute right-[12%] bottom-12 h-5 w-5 rounded-full bg-accent-coral/35 shadow-[18px_22px_0_rgba(50,183,104,0.2),-12px_40px_0_rgba(245,185,66,0.22)]"
          />
          <div className="relative mx-auto max-w-6xl">
            <Reveal delay={0.08}>
              <div className="max-w-2xl">
                <p className="text-sm font-medium tracking-[0.18em] text-primary">
                  LE PARCOURS
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  Une inscription en quatre étapes.
                </h2>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-6 lg:grid-cols-4">
              {STEPS.map(([number, title, text], index) => (
                <Reveal key={number} delay={0.12 + index * 0.08}>
                  <article className="group relative border-l-2 border-primary/15 pl-5 lg:border-l-0 lg:border-t-2 lg:pl-0 lg:pt-5">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary transition-transform duration-300 group-hover:scale-110">
                      {number}
                    </span>
                    <h3 className="mt-3 text-lg font-semibold text-ink">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {text}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-surface-alt px-6 py-20 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 bottom-16 h-36 w-28 -rotate-12 rounded-[52%_48%_60%_40%] bg-primary-light"
          />
          <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-medium tracking-[0.18em] text-primary">
                À PRÉVOIR
              </p>
              <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                Documents nécessaires
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">
                Pièces communiquées par l'établissement pour la rentrée
                2026–2027.
              </p>
              <ul className="mt-7 space-y-4 rounded-[24px_14px_24px_14px] bg-white p-6 shadow-soft">
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
              className="scroll-mt-24 rounded-[30px_16px_30px_16px] border border-border-soft bg-white p-6 shadow-soft-lg sm:p-8"
            >
              <p className="text-sm font-medium tracking-[0.18em] text-primary">
                PREMIER ÉCHANGE
              </p>
              <h2 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">
                Demander une inscription
              </h2>
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
                    autoComplete="name"
                    className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>
                <label className="text-sm font-medium text-ink">
                  Téléphone
                  <input
                    required
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>
                <label className="text-sm font-medium text-ink">
                  Email
                  <input
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>
                <label className="text-sm font-medium text-ink">
                  Nom de l'enfant
                  <input
                    required
                    name="childName"
                    className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>
                <label className="text-sm font-medium text-ink">
                  Date de naissance
                  <input
                    required
                    type="date"
                    name="birthDate"
                    className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>
                <label className="text-sm font-medium text-ink">
                  Classe souhaitée
                  <select
                    required
                    name="level"
                    defaultValue=""
                    className="mt-2 w-full rounded-btn border border-border-soft bg-white px-4 py-3 font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
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
                    className="mt-2 w-full resize-y rounded-btn border border-border-soft px-4 py-3 font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>
                <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
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
                      <CheckCircle2 size={17} />
                      Demande enregistrée pour démonstration.
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-surface px-6 py-20 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-8 top-16 h-24 w-24 rounded-full bg-accent-yellow/12"
          />
          <div className="relative mx-auto max-w-4xl">
            <div className="text-center">
              <p className="text-sm font-medium tracking-[0.18em] text-primary">
                QUESTIONS FRÉQUENTES
              </p>
              <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                Les premières réponses à vos questions.
              </h2>
            </div>
            <div className="mt-12 divide-y divide-border-soft rounded-[28px_14px_28px_14px] border border-border-soft bg-surface-alt shadow-soft">
              {FAQ.map(([question, answer], index) => (
                <div key={question}>
                  <button
                    type="button"
                    aria-expanded={openQuestion === index}
                    onClick={() =>
                      setOpenQuestion(openQuestion === index ? null : index)
                    }
                    className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left text-sm font-semibold text-ink sm:px-6"
                  >
                    <span>{question}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-primary transition-transform ${openQuestion === index ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openQuestion === index && (
                    <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft sm:px-6">
                      {answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-linear-to-r from-primary to-primary-dark px-6 py-16 text-white lg:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border-8 border-white/10"
          />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium tracking-[0.18em] text-white/80">
                BESOIN D'ÉCHANGER ?
              </p>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                L'équipe est prête à vous écouter.
              </h2>
            </div>
            <Link
              to="/contact"
              className="inline-flex shrink-0 items-center justify-center rounded-btn bg-white px-5 py-3 text-sm font-medium text-primary shadow-soft transition-colors hover:bg-surface-alt"
            >
              Nous contacter
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
