import { type FormEvent, useState } from "react";

import { HONEYPOT_NAME } from "@/components/ui/FormFeedback";
import { useSchool } from "@/data/useSchool";
import { useLanguage } from "@/i18n/useLanguage";
import { api, ApiError } from "@/lib/api/client";
import { formatWhatsAppMessage, whatsappUrl } from "@/lib/whatsapp";

/** A form field: its visible label, its `name` in the form, and its name for the API. */
export type SchoolFormField = readonly [label: string, name: string, apiName: string];

export type SchoolFormState =
  | { status: "idle" | "sending" | "sent" }
  /** `whatsappLink`: the same answers ready in WhatsApp when the server failed. */
  | { status: "error"; message: string; whatsappLink: string | null };

const ENDPOINTS = {
  contact: "/public/contact-messages",
  admission: "/public/admission-requests",
} as const;

/** Value sent to the API: a select gives its visible text (the level label), a date stays ISO. */
function apiValue(form: HTMLFormElement, name: string) {
  const element = form.elements.namedItem(name);
  if (element instanceof HTMLSelectElement) {
    return element.value ? (element.selectedOptions[0]?.text ?? "") : "";
  }
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value.trim();
  }
  return "";
}

/** Value written in a WhatsApp message: the date in the visitor's language. */
function readableValue(form: HTMLFormElement, name: string, locale: string) {
  const element = form.elements.namedItem(name);
  if (element instanceof HTMLInputElement && element.type === "date") {
    return element.valueAsDate?.toLocaleDateString(locale, { timeZone: "UTC" }) ?? "";
  }
  return apiValue(form, name);
}

/**
 * Sends a public form to the school (it appears in the admin). When the
 * server cannot take it, the visitor is offered the same answers in
 * WhatsApp instead, so a message is never lost and no success is faked.
 */
export function useSchoolForm(kind: keyof typeof ENDPOINTS, whatsappTitle: string, fields: readonly SchoolFormField[]) {
  const { lang, t } = useLanguage();
  const school = useSchool();
  const [state, setState] = useState<SchoolFormState>({ status: "idle" });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (state.status === "sending") return;

    const body: Record<string, string> = { website: apiValue(form, HONEYPOT_NAME) };
    for (const [, name, apiName] of fields) body[apiName] = apiValue(form, name);

    setState({ status: "sending" });
    try {
      await api(ENDPOINTS[kind], { method: "POST", body });
      form.reset();
      setState({ status: "sent" });
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 0;
      if (status === 422 && error instanceof ApiError) {
        // The visitor can correct the answers: the server's messages say what to change.
        const messages = Object.values(error.errors).map((list) => list[0]);
        setState({ status: "error", message: messages.join(" ") || error.message, whatsappLink: null });
        return;
      }

      const locale = lang === "fr" ? "fr-FR" : "en-GB";
      const message = formatWhatsAppMessage(
        whatsappTitle,
        fields.map(([label, name]) => [label, readableValue(form, name, locale)] as const),
      );
      setState({
        status: "error",
        message:
          status === 429
            ? t("Trop d'envois en peu de temps. Patientez quelques minutes avant de réessayer.", "Too many messages in a short time. Please wait a few minutes before trying again.")
            : t("Le message n'a pas pu être envoyé. Réessayez dans un instant.", "The message could not be sent. Please try again in a moment."),
        whatsappLink: whatsappUrl(school.contacts.whatsappPrimary, message),
      });
    }
  };

  return { state, handleSubmit };
}
