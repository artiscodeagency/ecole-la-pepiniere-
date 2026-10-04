import { CheckCircle2 } from "lucide-react";

import { useSchool } from "@/data/useSchool";
import { useLanguage } from "@/i18n/useLanguage";
import { telUrl } from "@/lib/whatsapp";

/** Shown once a form has opened WhatsApp: the message still has to be sent there. */
export function WhatsAppSentNotice({ whatsappLink }: { whatsappLink: string }) {
  const { t } = useLanguage();
  const school = useSchool();
  const phone = school.contacts.whatsappPrimary;

  return (
    <p role="status" className="flex items-start gap-2 text-sm text-secondary">
      <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
      <span>
        {t(
          "Votre message est prêt dans WhatsApp : appuyez sur Envoyer pour le transmettre à l'école.",
          "Your message is ready in WhatsApp: press Send to deliver it to the school.",
        )}{" "}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline hover:text-secondary-dark"
        >
          {t("Rouvrir WhatsApp", "Reopen WhatsApp")}
        </a>
        {" · "}
        {t("Pas de WhatsApp ? Appelez le", "No WhatsApp? Call")}{" "}
        <a
          href={telUrl(phone)}
          className="font-medium underline hover:text-secondary-dark"
        >
          {phone}
        </a>
      </span>
    </p>
  );
}
