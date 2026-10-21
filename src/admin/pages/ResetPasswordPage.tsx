import { type FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { AuthLayout } from "@/admin/components/AuthLayout";
import { FormAlert } from "@/admin/components/FormAlert";
import { PasswordField } from "@/admin/components/FormField";
import { SubmitButton } from "@/admin/components/SubmitButton";
import { PATHS } from "@/admin/paths";
import { api, ApiError } from "@/lib/api/client";
import { usePageMeta } from "@/lib/usePageMeta";

/** Opened from the link of the reset email: /admin/mot-de-passe/reinitialiser?token=…&email=… */
export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const email = params.get("email");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  usePageMeta("Nouveau mot de passe | Administration La Pépinière", "Choix d'un nouveau mot de passe.");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      const { message } = await api<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: {
          token,
          email,
          password: form.get("password"),
          password_confirmation: form.get("password_confirmation"),
        },
      });
      setDone(message);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught : new ApiError(0, "Une erreur inattendue est survenue."));
    } finally {
      setPending(false);
    }
  };

  if (!token || !email) {
    return (
      <AuthLayout title="Lien invalide">
        <FormAlert tone="error">
          Ce lien de réinitialisation est incomplet. Utilisez le lien reçu par email, ou faites une
          nouvelle demande.
        </FormAlert>
        <p className="mt-6 text-center text-sm">
          <Link to={PATHS.forgotPassword} className="font-medium text-primary-dark transition-colors hover:text-ink">
            Faire une nouvelle demande
          </Link>
        </p>
      </AuthLayout>
    );
  }

  // An expired or wrong token comes back on the email field.
  const generalError = error && !error.field("password") ? (error.field("email") ?? error.message) : null;

  return (
    <AuthLayout
      title="Nouveau mot de passe"
      description={`Pour le compte ${email}. Au moins 10 caractères, avec des lettres et des chiffres.`}
    >
      {done ? (
        <div className="space-y-6">
          <FormAlert tone="success">{done}</FormAlert>
          <Link
            to={PATHS.login}
            className="flex w-full items-center justify-center rounded-btn bg-primary-dark px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-ink"
          >
            Se connecter
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {generalError && <FormAlert tone="error">{generalError}</FormAlert>}
          <PasswordField
            label="Nouveau mot de passe"
            name="password"
            autoComplete="new-password"
            aria-required
            minLength={10}
            autoFocus
            error={error?.field("password")}
          />
          <PasswordField
            label="Confirmez le mot de passe"
            name="password_confirmation"
            autoComplete="new-password"
            aria-required
            minLength={10}
          />
          <SubmitButton pending={pending} pendingLabel="Enregistrement…">
            Enregistrer le mot de passe
          </SubmitButton>
        </form>
      )}
    </AuthLayout>
  );
}
