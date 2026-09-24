import {
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { useSchool } from "@/data/useSchool";
import { useLanguage } from "@/i18n/useLanguage";
import { usePageMeta } from "@/lib/usePageMeta";

type FormStatus = "idle" | "loading" | "success" | "error";

export function ContactPage() {
  const { t } = useLanguage();
  const school = useSchool();
  const [status, setStatus] = useState<FormStatus>("idle");

  const whatsappNumber = school.contacts.whatsapp.join(" · ");
  const contactItems = [
    {
      icon: Phone,
      title: t("Téléphones communiqués", "Phone numbers provided"),
      value: `${t("Liste A", "List A")} : ${school.contacts.phoneListA.join(" · ")}. ${t("Liste B", "List B")} : ${school.contacts.phoneListB.join(" · ")}.`,
      accent: "bg-primary-light text-primary",
    },
    {
      icon: Mail,
      title: "WhatsApp",
      value: whatsappNumber,
      accent: "bg-accent-yellow/20 text-ink",
    },
    {
      icon: MapPin,
      title: t("Adresse", "Address"),
      value: `${school.location.address}, ${school.location.country}`,
      accent: "bg-secondary-light text-secondary",
    },
    {
      icon: Clock3,
      title: "Email",
      value: school.contacts.email,
      accent: "bg-accent-coral/15 text-ink",
    },
  ];

  usePageMeta(
    `Contact | ${school.shortName} — ${school.location.city}, ${school.location.country}`,
    t(
      "Coordonnées du Groupe Scolaire Privé Bilingue La Pépinière à Bertoua, Cameroun.",
      "Contact details of La Pépinière Bilingual Private School Group in Bertoua, Cameroon.",
    ),
  );

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
          eyebrow="CONTACT"
          title={t(
            "Parlons de l'avenir de votre enfant.",
            "Let's talk about your child's future.",
          )}
          description={t(
            "Une question, une visite ou un premier échange ? Retrouvez les coordonnées et l'adresse officielle de La Pépinière.",
            "A question, a visit or a first conversation? Find La Pépinière's contact details and official address.",
          )}
          imageLabel={t("famille africaine et école", "African family and school")}
        />

        <section className="relative overflow-hidden bg-surface px-6 py-20 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-8 top-20 h-32 w-24 -rotate-12 rounded-[48%_52%_60%_40%] bg-accent-yellow/15"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-[12%] top-12 h-5 w-5 rounded-full bg-accent-coral/35 shadow-[18px_22px_0_rgba(50,183,104,0.2),-14px_40px_0_rgba(245,185,66,0.22)]"
          />
          <div className="relative mx-auto max-w-6xl">
            <Reveal delay={0.08}>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-medium tracking-[0.18em] text-primary">
                  {t("NOUS TROUVER", "FIND US")}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">
                  {t(
                    "Les informations utiles pour nous joindre.",
                    "Useful information to reach us.",
                  )}
                </h2>
              </div>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {contactItems.map(
                ({ icon: Icon, title, value, accent }, index) => (
                  <Reveal key={index} delay={0.12 + index * 0.08}>
                    <article className="group rounded-[24px_14px_24px_14px] border border-border-soft bg-surface-alt p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-soft-lg">
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-full ${accent} transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110`}
                      >
                        <Icon size={20} />
                      </span>
                      <h3 className="mt-5 text-base font-semibold text-ink">
                        {title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                        {value}
                      </p>
                    </article>
                  </Reveal>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-surface-alt px-6 py-20 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 bottom-10 h-36 w-28 rotate-12 rounded-[55%_45%_60%_40%] bg-secondary/10"
          />
          <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <Reveal delay={0.08}>
              <div className="flex flex-col justify-between rounded-[34px_18px_34px_18px] bg-linear-to-br from-primary to-primary-dark p-7 text-white shadow-soft-lg sm:p-9">
                <div>
                  <MessageCircle
                    className="text-secondary-light"
                    size={30}
                    strokeWidth={1.7}
                  />
                  <h2 className="mt-8 text-2xl font-bold sm:text-3xl">
                    {t("Une question rapide ?", "A quick question?")}
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-white/80">
                    {t(
                      "WhatsApp communiqué par l'établissement. Les numéros de téléphone affichés ci-dessus doivent encore être confirmés.",
                      "WhatsApp number provided by the school. The phone numbers shown above still need to be confirmed.",
                    )}
                  </p>
                </div>
                <a
                  href="#contact-form"
                  className="mt-10 inline-flex w-fit items-center gap-2 rounded-btn bg-white px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-surface-alt"
                >
                  <Send size={16} />
                  {whatsappNumber}
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.16}>
              <div
                id="contact-form"
                className="rounded-[18px_34px_18px_34px] border border-border-soft bg-white p-6 shadow-soft-lg sm:p-9"
              >
                <p className="text-sm font-medium tracking-[0.18em] text-primary">
                  {t("ÉCRIVEZ-NOUS", "WRITE TO US")}
                </p>
                <h2 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">
                  {t("Envoyer un message", "Send a message")}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {t(
                    "Ce formulaire est prêt à être relié au service d'envoi de l'école.",
                    "This form is ready to be connected to the school's sending service.",
                  )}
                </p>
                <form
                  onSubmit={handleSubmit}
                  className="mt-8 grid gap-5 sm:grid-cols-2"
                >
                  <label className="text-sm font-medium text-ink">
                    {t("Nom", "Name")}
                    <input
                      required
                      name="name"
                      autoComplete="name"
                      className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </label>
                  <label className="text-sm font-medium text-ink">
                    Email
                    <input
                      required
                      type="email"
                      name="email"
                      autoComplete="email"
                      className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </label>
                  <label className="text-sm font-medium text-ink">
                    {t("Téléphone", "Phone")}
                    <input
                      required
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </label>
                  <label className="text-sm font-medium text-ink">
                    {t("Sujet", "Subject")}
                    <input
                      required
                      name="subject"
                      className="mt-2 w-full rounded-btn border border-border-soft px-4 py-3 font-normal outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </label>
                  <label className="text-sm font-medium text-ink sm:col-span-2">
                    Message
                    <textarea
                      required
                      name="message"
                      rows={5}
                      className="mt-2 w-full resize-y rounded-btn border border-border-soft px-4 py-3 font-normal outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </label>
                  <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      disabled={status === "loading"}
                      type="submit"
                      className="rounded-btn bg-primary px-6 py-3.5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status === "loading"
                        ? t("Envoi en cours...", "Sending...")
                        : t("Envoyer le message", "Send message")}
                    </button>
                    {status === "success" && (
                      <p
                        role="status"
                        className="flex items-center gap-2 text-sm text-secondary"
                      >
                        <CheckCircle2 size={17} />
                        {t(
                          "Message enregistré pour démonstration.",
                          "Message saved for demonstration.",
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
            </Reveal>
          </div>
        </section>

        <section className="relative overflow-hidden bg-surface px-6 py-20 lg:px-10 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-10 bottom-12 h-28 w-40 -rotate-6 rounded-[60%_40%_45%_55%] bg-primary-light"
          />
          <div className="relative mx-auto max-w-6xl">
            <Reveal delay={0.08}>
              <div className="flex min-h-64 flex-col items-center justify-center rounded-[30px_14px_30px_14px] border border-dashed border-border-soft bg-surface-alt p-8 text-center shadow-soft">
                <MapPin className="text-primary" size={30} strokeWidth={1.7} />
                <h2 className="mt-4 text-xl font-bold text-ink">
                  {t("Localisation de l'école", "School location")}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
                  {school.location.address}, {school.location.city},{" "}
                  {school.location.country}
                </p>
              </div>
            </Reveal>
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
                {t("POUR ALLER PLUS LOIN", "GO FURTHER")}
              </p>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                {t(
                  "Préparez sereinement la prochaine étape.",
                  "Prepare calmly for the next step.",
                )}
              </h2>
            </div>
            <Link
              to="/admissions"
              className="inline-flex shrink-0 items-center justify-center rounded-btn bg-white px-5 py-3 text-sm font-medium text-primary shadow-soft transition-colors hover:bg-surface-alt"
            >
              {t("Découvrir les admissions", "Discover admissions")}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
