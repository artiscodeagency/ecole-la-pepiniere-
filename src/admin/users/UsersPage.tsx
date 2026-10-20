import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Pencil, Plus, Trash2, UserRound, Users } from "lucide-react";
import { type FormEvent, useState } from "react";

import { useAuth } from "@/admin/auth/useAuth";
import { Button } from "@/admin/components/Button";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { Dialog } from "@/admin/components/Dialog";
import { EmptyState } from "@/admin/components/EmptyState";
import { FormAlert } from "@/admin/components/FormAlert";
import { CheckboxField, PasswordField, TextField } from "@/admin/components/FormField";
import { PageHeader } from "@/admin/components/PageHeader";
import { RadioCards } from "@/admin/components/RadioCards";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { formatDateTime } from "@/admin/lib/dates";
import type { AdminUser, Role } from "@/admin/types";
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH, ROLE_OPTIONS, USERS_QUERY_KEY } from "@/admin/users/shared";
import { api, ApiError } from "@/lib/api/client";
import { usePageMeta } from "@/lib/usePageMeta";

const ROLE_LABELS: Record<Role, string> = { director: "Directeur", assistant: "Assistante" };

/** Errors that are not about one field (last director, own account…) come under the key "user". */
function generalMessage(error: ApiError | null) {
  if (!error) return null;
  return error.field("user") ?? (Object.keys(error.errors).length === 0 ? error.message : null);
}

function asApiError(caught: unknown) {
  return caught instanceof ApiError ? caught : new ApiError(0, "Une erreur inattendue est survenue.");
}

/** Create a colleague's account, or change its name, email, role and access. */
function AccountDialog({ user, onClose }: { user: AdminUser | null; onClose: () => void }) {
  const isNew = user === null;
  const queryClient = useQueryClient();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<Role>(user?.role ?? "assistant");
  const [isActive, setIsActive] = useState(user?.is_active ?? true);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<ApiError | null>(null);

  const save = useMutation({
    mutationFn: () =>
      isNew
        ? api("/admin/users", { method: "POST", body: { name, email, role, password, password_confirmation: confirmation } })
        : api(`/admin/users/${user.id}`, { method: "PUT", body: { name, email, role, is_active: isActive } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      onClose();
    },
    onError: (caught) => setError(asApiError(caught)),
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    save.mutate();
  };

  const message = generalMessage(error);

  return (
    <Dialog
      open
      title={isNew ? "Nouveau compte" : `Modifier le compte de ${user.name}`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" form="account-form" variant="primary" pending={save.isPending}>
            {isNew ? "Créer le compte" : "Enregistrer"}
          </Button>
        </>
      }
    >
      <form id="account-form" onSubmit={handleSubmit} noValidate className="space-y-5">
        {message && <FormAlert tone="error">{message}</FormAlert>}
        <TextField label="Nom" value={name} onChange={(event) => setName(event.target.value)} error={error?.field("name")} required maxLength={120} autoComplete="off" />
        <TextField
          label="Adresse email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={error?.field("email")}
          hint="Elle sert à se connecter."
          required
          maxLength={190}
          autoComplete="off"
        />
        <RadioCards name="role" legend="Rôle" value={role} options={ROLE_OPTIONS} onChange={setRole} />
        {error?.field("role") && <p className="text-sm text-red-700">{error.field("role")}</p>}
        {isNew ? (
          <>
            <PasswordField
              label="Mot de passe"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={error?.field("password")}
              hint={`${PASSWORD_HINT} Communiquez-le en personne à votre collègue.`}
              required
              minLength={PASSWORD_MIN_LENGTH}
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirmez le mot de passe"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              required
              minLength={PASSWORD_MIN_LENGTH}
              autoComplete="new-password"
            />
          </>
        ) : (
          <CheckboxField
            label="Compte actif"
            hint="Décochez pour bloquer l'accès sans supprimer le compte : la personne est déconnectée aussitôt."
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />
        )}
      </form>
    </Dialog>
  );
}

/** The director sets a new password for a colleague: no school mailbox exists for reset emails yet. */
function PasswordDialog({ user, onClose, onDone }: { user: AdminUser; onClose: () => void; onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<ApiError | null>(null);

  const save = useMutation({
    mutationFn: () => api(`/admin/users/${user.id}/password`, { method: "PUT", body: { password, password_confirmation: confirmation } }),
    onSuccess: onDone,
    onError: (caught) => setError(asApiError(caught)),
  });

  const message = generalMessage(error);

  return (
    <Dialog
      open
      title={`Nouveau mot de passe pour ${user.name}`}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" form="password-form" variant="primary" pending={save.isPending}>
            Enregistrer le mot de passe
          </Button>
        </>
      }
    >
      <form
        id="password-form"
        noValidate
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          save.mutate();
        }}
      >
        {message && <FormAlert tone="error">{message}</FormAlert>}
        <p className="text-sm text-ink-soft">
          {user.name} sera déconnecté(e) de tous ses appareils et devra utiliser ce nouveau mot de passe. Communiquez-le en personne.
        </p>
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
          label="Confirmez le mot de passe"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          required
          minLength={PASSWORD_MIN_LENGTH}
          autoComplete="new-password"
        />
      </form>
    </Dialog>
  );
}

type OpenDialog = { kind: "account"; user: AdminUser | null } | { kind: "password"; user: AdminUser } | { kind: "delete"; user: AdminUser } | null;

export function UsersPage() {
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const allowed = Boolean(me?.abilities["manage-users"]);

  usePageMeta("Utilisateurs | Administration La Pépinière", "Comptes du personnel de l'école.");

  const users = useQuery({
    queryKey: [...USERS_QUERY_KEY, "list"],
    queryFn: async () => (await api<{ data: AdminUser[] }>("/admin/users")).data,
    enabled: allowed,
  });

  const remove = useMutation({
    mutationFn: (id: number) => api(`/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      setNotice("Le compte a été supprimé.");
      setDialog(null);
    },
    onError: () => setDialog(null),
  });

  const removeError = remove.error ? (generalMessage(asApiError(remove.error)) ?? remove.error.message) : null;

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        description="Les comptes du personnel qui gère le site. Réservé au Directeur."
        actions={
          allowed && (
            <Button
              variant="primary"
              onClick={() => {
                setNotice(null);
                setDialog({ kind: "account", user: null });
              }}
            >
              <Plus size={17} aria-hidden="true" />
              Nouveau compte
            </Button>
          )
        }
      />

      {!allowed ? (
        <FormAlert tone="error">Cette page est réservée au Directeur.</FormAlert>
      ) : (
        <>
          <div className="mb-4 space-y-3 empty:hidden" aria-live="polite">
            {notice && <FormAlert tone="success">{notice}</FormAlert>}
            {removeError && <FormAlert tone="error">{removeError}</FormAlert>}
          </div>

          {users.isError ? (
            <div className="space-y-4">
              <FormAlert tone="error">{users.error.message}</FormAlert>
              <Button onClick={() => void users.refetch()}>Réessayer</Button>
            </div>
          ) : users.isPending ? (
            <ul className="space-y-3" aria-hidden="true">
              {[0, 1].map((index) => (
                <li key={index} className="h-20 animate-pulse rounded-card border border-border-soft bg-white" />
              ))}
            </ul>
          ) : users.data.length === 0 ? (
            <EmptyState icon={Users} title="Aucun compte." />
          ) : (
            <ul className="space-y-3">
              {users.data.map((account) => {
                const isMe = account.id === me?.id;
                return (
                  <li key={account.id} className="flex flex-wrap items-center gap-4 rounded-card border border-border-soft bg-white p-4 shadow-soft">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-alt text-primary-dark">
                      <UserRound size={21} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-ink">{account.name}</p>
                        {isMe && <span className="text-xs text-ink-soft">(vous)</span>}
                        <StatusBadge tone="neutral">{ROLE_LABELS[account.role]}</StatusBadge>
                        {!account.is_active && <StatusBadge tone="danger">Désactivé</StatusBadge>}
                      </div>
                      <p className="mt-0.5 truncate text-sm text-ink-soft">{account.email}</p>
                      <p className="mt-0.5 text-xs text-ink-soft">
                        {account.last_login_at ? `Dernière connexion le ${formatDateTime(account.last_login_at)}` : "Jamais connecté(e)"}
                      </p>
                    </div>
                    {!isMe && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => {
                            setNotice(null);
                            setDialog({ kind: "account", user: account });
                          }}
                        >
                          <Pencil size={15} aria-hidden="true" />
                          Modifier
                        </Button>
                        <Button
                          onClick={() => {
                            setNotice(null);
                            setDialog({ kind: "password", user: account });
                          }}
                        >
                          <KeyRound size={15} aria-hidden="true" />
                          Mot de passe
                        </Button>
                        <Button variant="danger" aria-label={`Supprimer le compte de ${account.name}`} onClick={() => setDialog({ kind: "delete", user: account })}>
                          <Trash2 size={15} aria-hidden="true" />
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-4 text-xs text-ink-soft">Votre propre compte se modifie depuis « Mon profil ».</p>
        </>
      )}

      {dialog?.kind === "account" && <AccountDialog user={dialog.user} onClose={() => setDialog(null)} />}
      {dialog?.kind === "password" && (
        <PasswordDialog
          user={dialog.user}
          onClose={() => setDialog(null)}
          onDone={() => {
            setNotice(`Le mot de passe de ${dialog.user.name} a été changé.`);
            setDialog(null);
          }}
        />
      )}
      <ConfirmDialog
        open={dialog?.kind === "delete"}
        title="Supprimer ce compte ?"
        message={
          dialog?.kind === "delete"
            ? `${dialog.user.name} ne pourra plus se connecter. Les contenus qu'il ou elle a écrits restent sur le site. Pour bloquer l'accès temporairement, désactivez plutôt le compte.`
            : ""
        }
        confirmLabel="Supprimer le compte"
        pending={remove.isPending}
        onConfirm={() => dialog?.kind === "delete" && remove.mutate(dialog.user.id)}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}
