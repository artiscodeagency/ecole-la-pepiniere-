import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";

import { ME_QUERY_KEY } from "@/admin/auth/context";
import { useAuth } from "@/admin/auth/useAuth";
import { Button } from "@/admin/components/Button";
import { Card } from "@/admin/components/Card";
import { FormAlert } from "@/admin/components/FormAlert";
import { PasswordField, TextField } from "@/admin/components/FormField";
import { PageHeader } from "@/admin/components/PageHeader";
import type { AdminUser } from "@/admin/types";
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH } from "@/admin/users/shared";
import { api, ApiError } from "@/lib/api/client";
import { usePageMeta } from "@/lib/usePageMeta";

function asApiError(caught: unknown) {
  return caught instanceof ApiError ? caught : new ApiError(0, "Une erreur inattendue est survenue.");
}

function DetailsCard({ user }: { user: AdminUser }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const [saved, setSaved] = useState(false);
  const emailChanged = email.trim() !== user.email;
  const dirty = name !== user.name || emailChanged;

  const save = useMutation({
    meta: { success: "Profil mis à jour" },
    mutationFn: () =>
      api<{ data: AdminUser }>("/auth/profile", {
        method: "PUT",
        body: { name, email, current_password: emailChanged ? currentPassword : null },
      }),
    onSuccess: ({ data }) => {
      queryClient.setQueryData(ME_QUERY_KEY, data);
      setCurrentPassword("");
      setSaved(true);
    },
    onError: (caught) => setError(asApiError(caught)),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaved(false);
    save.mutate();
  };

  const otherError = error && Object.keys(error.errors).length === 0 ? error.message : null;

  return (
    <Card title="Mes informations">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div aria-live="polite" className="space-y-3 empty:hidden">
          {saved && !dirty && <FormAlert tone="success">Vos informations sont enregistrées.</FormAlert>}
          {otherError && <FormAlert tone="error">{otherError}</FormAlert>}
        </div>
        <TextField
          label="Nom"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setSaved(false);
          }}
          error={error?.field("name")}
          required
          maxLength={120}
          autoComplete="name"
        />
        <TextField
          label="Adresse email"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setSaved(false);
          }}
          error={error?.field("email")}
          hint="Elle sert à vous connecter."
          required
          maxLength={190}
          autoComplete="email"
        />
        {emailChanged && (
          <PasswordField
            label="Mot de passe actuel"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            error={error?.field("current_password")}
            hint="Demandé pour changer l'adresse de connexion."
            required
            autoComplete="current-password"
          />
        )}
        <Button type="submit" variant="primary" pending={save.isPending} disabled={!dirty}>
          Enregistrer
        </Button>
      </form>
    </Card>
  );
}

function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<ApiError | null>(null);
  const [saved, setSaved] = useState(false);

  const save = useMutation({
    meta: { success: "Mot de passe changé" },
    mutationFn: () =>
      api("/auth/password", {
        method: "PUT",
        body: { current_password: currentPassword, password, password_confirmation: confirmation },
      }),
    onSuccess: () => {
      setCurrentPassword("");
      setPassword("");
      setConfirmation("");
      setSaved(true);
    },
    onError: (caught) => setError(asApiError(caught)),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaved(false);
    save.mutate();
  };

  const otherError = error && Object.keys(error.errors).length === 0 ? error.message : null;

  return (
    <Card title="Mot de passe">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div aria-live="polite" className="space-y-3 empty:hidden">
          {saved && (
            <FormAlert tone="success">Mot de passe changé. Vos autres appareils ont été déconnectés.</FormAlert>
          )}
          {otherError && <FormAlert tone="error">{otherError}</FormAlert>}
        </div>
        <PasswordField
          label="Mot de passe actuel"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          error={error?.field("current_password")}
          required
          autoComplete="current-password"
        />
        <PasswordField
          label="Nouveau mot de passe"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={error?.field("password")}
          hint={PASSWORD_HINT}
          required
          minLength={PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
        />
        <PasswordField
          label="Confirmez le nouveau mot de passe"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          required
          minLength={PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
        />
        <Button type="submit" variant="primary" pending={save.isPending} disabled={!currentPassword || !password}>
          Changer le mot de passe
        </Button>
      </form>
    </Card>
  );
}

export function ProfilePage() {
  const { user } = useAuth();

  usePageMeta("Mon profil | Administration La Pépinière", "Vos informations de connexion.");

  if (!user) return null;

  return (
    <div>
      <PageHeader title="Mon profil" description="Votre nom, votre adresse de connexion et votre mot de passe." />
      <div className="grid max-w-4xl items-start gap-6 lg:grid-cols-2">
        <DetailsCard user={user} />
        <PasswordCard />
      </div>
    </div>
  );
}
