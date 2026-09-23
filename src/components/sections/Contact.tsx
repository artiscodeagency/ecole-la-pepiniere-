import {
  CheckCircle2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Timer,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";

import { Reveal } from "@/components/ui/Reveal";

const CONTACT_ITEMS = [
  {
    icon: Phone,
    title: "Téléphone",
    value: "[Numéro de téléphone à confirmer]",
  },
  { icon: Mail, title: "Email", value: "[Adresse email à confirmer]" },
  { icon: MapPin, title: "Adresse", value: "[Adresse de l’école à confirmer]" },
  {
    icon: Timer,
    title: "Horaires",
    value: "[Horaires d’ouverture à confirmer]",
  },
];

type FormStatus = "idle" | "loading" | "success";

export function Contact() {
  const [status, setStatus] = useState<FormStatus>("idle");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    window.setTimeout(() => setStatus("success"), 700);
  };

  return (
    <section
      id="contact"
      className="scroll-mt-24 bg-surface px-6 py-24 lg:px-10 lg:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal delay={0.05}>
          <div className="max-w-3xl">
            <p className="text-sm font-medium tracking-wide text-primary">
              CONTACT
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl lg:text-5xl">
              Parlons de l’avenir de votre enfant.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
              Contactez l’école pour obtenir des informations, préparer une
              visite ou échanger autour d’une inscription.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CONTACT_ITEMS.map(({ icon: Icon, title, value }) => (
              <article
                key={title}
                className="rounded-card border border-border-soft bg-surface-alt p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
                  <Icon size={20} />
                </span>
                <h3 className="mt-5 text-base font-semibold text-ink">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {value}
                </p>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-16 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="flex flex-col justify-between rounded-card bg-primary p-7 text-white sm:p-8">
              <div>
                <MessageCircle size={28} strokeWidth={1.7} />
                <h3 className="mt-8 text-2xl font-bold">
                  Une question rapide ?
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  Échangez directement avec notre équipe.
                </p>
              </div>
              <Link
                to="/contact"
                className="mt-10 inline-flex w-fit rounded-btn bg-white px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-surface-alt"
              >
                Nous écrire sur WhatsApp
              </Link>
            </div>

            <div className="rounded-card border border-border-soft bg-white p-6 shadow-soft sm:p-8">
              <h3 className="text-2xl font-bold text-ink">
                Envoyer un message
              </h3>
              <p className="mt-3 text-sm text-ink-soft">
                Formulaire de contact frontend-only, prêt à être relié à un
                service d’envoi.
              </p>
              <form
                onSubmit={handleSubmit}
                className="mt-8 grid gap-5 sm:grid-cols-2"
              >
                <label className="text-sm font-medium text-ink">
                  Nom
                  <input
                    required
                    name="name"
                    className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none focus:border-primary"
                  />
                </label>
                <label className="text-sm font-medium text-ink">
                  Email
                  <input
                    required
                    type="email"
                    name="email"
                    className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none focus:border-primary"
                  />
                </label>
                <label className="text-sm font-medium text-ink">
                  Téléphone
                  <input
                    required
                    type="tel"
                    name="phone"
                    className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none focus:border-primary"
                  />
                </label>
                <label className="text-sm font-medium text-ink">
                  Sujet
                  <input
                    required
                    name="subject"
                    className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none focus:border-primary"
                  />
                </label>
                <label className="text-sm font-medium text-ink sm:col-span-2">
                  Message
                  <textarea
                    required
                    name="message"
                    rows={4}
                    className="mt-2 w-full resize-y rounded-btn border border-border-soft px-4 py-3 font-normal outline-none focus:border-primary"
                  />
                </label>
                <div className="sm:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    disabled={status === "loading"}
                    type="submit"
                    className="rounded-btn bg-primary px-6 py-3.5 text-sm font-medium text-white shadow-soft hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "loading"
                      ? "Envoi en cours..."
                      : "Envoyer le message"}
                  </button>
                  {status === "success" && (
                    <p
                      role="status"
                      className="flex items-center gap-2 text-sm text-secondary"
                    >
                      <CheckCircle2 size={17} /> Message enregistré pour
                      démonstration.
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.22}>
          <div className="mt-8 flex min-h-56 flex-col items-center justify-center rounded-card border border-dashed border-border-soft bg-surface-alt p-8 text-center">
            <MapPin className="text-primary" size={28} strokeWidth={1.7} />
            <h3 className="mt-4 text-lg font-semibold text-ink">
              Localisation de l’école
            </h3>
            <p className="mt-2 text-sm text-ink-soft">
              [Carte à configurer avec l’adresse officielle]
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.26}>
          <div className="mt-16 rounded-card bg-surface-alt px-6 py-12 text-center sm:px-10">
            <h3 className="text-2xl font-bold text-ink sm:text-3xl">
              Prêt à découvrir La Pépinière ?
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
              Commencez naturellement votre démarche en échangeant avec notre
              équipe.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <Link
                to="/admissions"
                className="rounded-btn bg-primary px-6 py-3.5 text-sm font-medium text-white shadow-soft hover:bg-primary-dark"
              >
                Demander une inscription
              </Link>
              <Link
                to="/contact"
                className="rounded-btn border border-border-soft bg-white px-6 py-3.5 text-sm font-medium text-ink hover:bg-surface"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
