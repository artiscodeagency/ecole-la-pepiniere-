import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { useLanguage } from "@/i18n/useLanguage";
import type { SchoolFormState } from "@/lib/useSchoolForm";

/** Submit button of a public form, disabled while sending. */
export function FormSubmitButton({ state, label }: { state: SchoolFormState; label: string }) {
  const { t } = useLanguage();
  const sending = state.status === "sending";

  return (
    <button
      type="submit"
      disabled={sending}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-btn bg-primary px-6 py-3.5 text-sm font-medium text-white shadow-soft transition-colors hover:bg-primary-dark disabled:opacity-70"
    >
      {sending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
      {sending ? t("Envoi…", "Sending…") : label}
    </button>
  );
}

/** What happened to the form: sent, or why not (with WhatsApp as a way out). */
export function FormFeedback({ state, sentMessage }: { state: SchoolFormState; sentMessage: string }) {
  const { t } = useLanguage();

  if (state.status === "sent") {
    return (
      <p role="status" className="flex items-start gap-2 text-sm text-secondary-dark">
        <CheckCircle2 size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>{sentMessage}</span>
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <p role="alert" className="flex items-start gap-2 text-sm text-red-700">
        <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          {state.message}
          {state.whatsappLink && (
            <>
              {" "}
              <a
                href={state.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline hover:text-red-800"
              >
                {t("Envoyer plutôt via WhatsApp", "Send it via WhatsApp instead")}
              </a>
            </>
          )}
        </span>
      </p>
    );
  }

  return null;
}
