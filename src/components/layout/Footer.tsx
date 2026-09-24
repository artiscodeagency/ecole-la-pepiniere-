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
import { SCHOOL } from "@/data/school";

const NAV_GROUPS = {
  school: [
    { label: "Notre école", href: "/notre-ecole" },
    { label: "Maternelle", href: "/maternelle" },
    { label: "Primaire", href: "/primaire" },
    { label: "Vie scolaire", href: "/vie-scolaire" },
  ],
  quick: [
    { label: "Admissions", href: "/admissions" },
    { label: "Galerie", href: "/galerie" },
    { label: "Actualités", href: "/actualites" },
    { label: "Contact", href: "/contact" },
  ],
};

const CONTACT_ITEMS = [
  { icon: Phone, text: SCHOOL.contacts.mainPhone, href: "/contact" },
  {
    icon: Mail,
    text: SCHOOL.contacts.email,
    href: "/contact",
  },
  {
    icon: MapPin,
    text: SCHOOL.location.address,
    href: "/contact",
  },
  {
    icon: Timer,
    text: "Horaires scolaires : voir les sections",
    href: "/contact",
  },
];

const SOCIALS = [
  { label: "Facebook", href: "#", icon: MessageCircle },
  { label: "Instagram", href: "#", icon: Camera },
  { label: "WhatsApp", href: "#", icon: Send },
];

export function Footer() {
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
                alt={SCHOOL.name}
                className="h-12 w-12 object-contain object-center"
              />
              <div>
                <p className="text-lg font-semibold tracking-wide text-ink">
                  {SCHOOL.shortName}
                </p>
                <p className="text-xs text-ink-soft">{SCHOOL.motto}</p>
              </div>
            </div>

            <p className="mt-6 max-w-xs text-sm leading-relaxed text-ink-soft">
              {SCHOOL.slogan}. {SCHOOL.location.address}.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Navigation
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-ink-soft">
              {NAV_GROUPS.school.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-soft">
              En savoir plus
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-ink-soft">
              {NAV_GROUPS.quick.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="transition-colors hover:text-primary"
                  >
                    {link.label}
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
              {CONTACT_ITEMS.map(({ icon: Icon, text, href }) => (
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
            © 2026 La Pépinière. Tous droits réservés.
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
