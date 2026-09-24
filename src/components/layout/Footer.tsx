import {
  Camera,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Timer,
} from "lucide-react";
import { Link } from "react-router-dom";

import officialLogo from "@/assets/logo-transparent.png";
import { useSchool } from "@/data/useSchool";
import { useLanguage } from "@/i18n/useLanguage";
import { tr } from "@/i18n/types";

const NAV_GROUPS = {
  school: [
    { label: tr("Notre école", "Our school"), href: "/notre-ecole" },
    { label: tr("Maternelle", "Nursery"), href: "/maternelle" },
    { label: tr("Primaire", "Primary"), href: "/primaire" },
    { label: tr("Vie scolaire", "School life"), href: "/vie-scolaire" },
  ],
  quick: [
    { label: tr("Admissions", "Admissions"), href: "/admissions" },
    { label: tr("Galerie", "Gallery"), href: "/galerie" },
    { label: tr("Actualités", "News"), href: "/actualites" },
    { label: tr("Contact", "Contact"), href: "/contact" },
  ],
};

const SOCIALS = [
  { label: "Facebook", href: "#", icon: MessageCircle },
  { label: "Instagram", href: "#", icon: Camera },
  { label: "WhatsApp", href: "#", icon: Send },
];

export function Footer() {
  const { t } = useLanguage();
  const school = useSchool();

  const contactItems = [
    { icon: Phone, text: school.contacts.mainPhone, href: "/contact" },
    { icon: Mail, text: school.contacts.email, href: "/contact" },
    { icon: MapPin, text: school.location.address, href: "/contact" },
    {
      icon: Timer,
      text: t("Horaires scolaires : voir les sections", "School hours: see the sections"),
      href: "/contact",
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-white px-6 py-16 text-ink lg:px-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-12 top-10 h-28 w-28 rounded-full bg-primary/8 blur-2xl"
      />

      <div className="relative mx-auto max-w-7xl rounded-3xl border border-border-soft bg-surface px-6 py-10 shadow-soft lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1.1fr]">
          <div>
            <div className="flex items-center gap-3">
              <img
                src={officialLogo}
                alt={school.name}
                className="h-12 w-12 object-contain object-center"
              />
              <div>
                <p className="text-lg font-semibold tracking-wide text-ink">
                  {school.shortName}
                </p>
                <p className="text-xs text-ink-soft">{school.motto}</p>
              </div>
            </div>

            <p className="mt-6 max-w-xs text-sm leading-relaxed text-ink-soft">
              {school.slogan}. {school.location.address}.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Navigation
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-ink-soft">
              {NAV_GROUPS.school.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="transition-colors hover:text-primary"
                  >
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-soft">
              {t("En savoir plus", "Learn more")}
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-ink-soft">
              {NAV_GROUPS.quick.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="transition-colors hover:text-primary"
                  >
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Contact
            </h3>
            <ul className="mt-5 space-y-4 text-sm text-ink-soft">
              {contactItems.map(({ icon: Icon, text, href }) => (
                <li key={text}>
                  <Link
                    to={href}
                    className="flex items-start gap-3 transition-colors hover:text-primary"
                  >
                    <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/8">
                      <Icon size={15} className="text-primary" />
                    </span>
                    <span>{text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-border-soft pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-ink-soft">
            {t(
              "© 2026 La Pépinière. Tous droits réservés.",
              "© 2026 La Pépinière. All rights reserved.",
            )}
          </p>

          <div className="flex items-center gap-3">
            {SOCIALS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border-soft bg-surface-alt text-ink-soft transition-colors hover:border-primary/20 hover:text-primary"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
