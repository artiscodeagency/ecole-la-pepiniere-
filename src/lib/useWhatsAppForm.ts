import { type FormEvent, useState } from "react";

import { useSchool } from "@/data/useSchool";
import { useLanguage } from "@/i18n/useLanguage";
import { formatWhatsAppMessage, openWhatsApp, whatsappUrl } from "@/lib/whatsapp";

/** A form field to copy into the message: its visible label and its `name`. */
export type WhatsAppField = readonly [label: string, name: string];

function readField(form: HTMLFormElement, name: string, locale: string) {
  const element = form.elements.namedItem(name);
  if (element instanceof HTMLSelectElement) {
    return element.value ? (element.selectedOptions[0]?.text ?? "") : "";
  }
  if (element instanceof HTMLInputElement && element.type === "date") {
    return (
      element.valueAsDate?.toLocaleDateString(locale, { timeZone: "UTC" }) ?? ""
    );
  }
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  ) {
    return element.value;
  }
  return "";
}

/**
 * Turns a form into a WhatsApp message to the school: on submit, WhatsApp
 * opens with the answers pre-filled and the visitor only has to press Send.
 * Nothing is sent by the website itself, so no fake success is shown.
 */
export function useWhatsAppForm(title: string, fields: readonly WhatsAppField[]) {
  const { lang } = useLanguage();
  const school = useSchool();
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const locale = lang === "fr" ? "fr-FR" : "en-GB";
    const message = formatWhatsAppMessage(
      title,
      fields.map(([label, name]) => [label, readField(form, name, locale)] as const),
    );
    const url = whatsappUrl(school.contacts.whatsappPrimary, message);
    openWhatsApp(url);
    setWhatsappLink(url);
  };

  return { whatsappLink, handleSubmit };
}
