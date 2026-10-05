import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  type AdminAnnouncement,
  type AnnouncementImportance,
  ANNOUNCEMENTS_QUERY_KEY,
  DISPLAY_STATUS,
} from "@/admin/announcements/types";
import { Button } from "@/admin/components/Button";
import { Card } from "@/admin/components/Card";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { FormAlert } from "@/admin/components/FormAlert";
import { CheckboxField, SelectField, TextAreaField, TextField } from "@/admin/components/FormField";
import { type ContentLang, LanguageTabs } from "@/admin/components/LanguageTabs";
import { PageHeader } from "@/admin/components/PageHeader";
import { type RadioCardOption, RadioCards } from "@/admin/components/RadioCards";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { formatDateTime, fromDateTimeInput, toDateTimeInput } from "@/admin/lib/dates";
import { useSections } from "@/admin/lib/useSections";
import { announcementEditPath, PATHS } from "@/admin/paths";
import type { ContentStatus } from "@/admin/types";
import { api, ApiError } from "@/lib/api/client";
import { usePageMeta } from "@/lib/usePageMeta";

interface FormState {
  title_fr: string;
  title_en: string;
  message_fr: string;
  message_en: string;
  importance: AnnouncementImportance;
  section_id: string;
  /** datetime-local values; an empty start means "now". */
  starts_at: string;
  ends_at: string;
  is_pinned: boolean;
  status: ContentStatus;
}

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

function initialState(announcement: AdminAnnouncement | undefined): FormState {
  return {
    title_fr: announcement?.title.fr ?? "",
    title_en: announcement?.title.en ?? "",
    message_fr: announcement?.message.fr ?? "",
    message_en: announcement?.message.en ?? "",
    importance: announcement?.importance ?? "info",
    section_id: announcement?.section ? String(announcement.section.id) : "",
    starts_at: toDateTimeInput(announcement?.starts_at ?? null),
    // A new announcement is proposed for one week; the end date is always required.
    ends_at: toDateTimeInput(announcement?.ends_at ?? new Date(Date.now() + ONE_WEEK).toISOString()),
    is_pinned: announcement?.is_pinned ?? false,
    status: announcement?.status ?? "draft",
  };
}

const IMPORTANCE_OPTIONS: RadioCardOption<AnnouncementImportance>[] = [
  { value: "info", label: "Information", description: "Affichée dans la rubrique Annonces." },
  { value: "important", label: "Important", description: "Mise en évidence dans la rubrique Annonces." },
  { value: "urgent", label: "Urgent", description: "Affichée aussi en bandeau en haut de toutes les pages du site." },
];

const STATUS_OPTIONS: RadioCardOption<ContentStatus>[] = [
  { value: "draft", label: "Brouillon", description: "Visible uniquement dans l'administration." },
  { value: "published", label: "Publiée", description: "Visible sur le site pendant la période choisie." },
  { value: "archived", label: "Archivée", description: "Retirée du site, conservée ici." },
];

function saveLabel(form: FormState, announcement: AdminAnnouncement | undefined) {
  if (form.status === "draft") return "Enregistrer le brouillon";
  if (form.status === "published" && announcement?.status !== "published") return "Publier";
  return "Enregistrer";
}

function AnnouncementForm({ announcement }: { announcement?: AdminAnnouncement }) {
  const isNew = announcement === undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const sections = useSections();
  const [form, setForm] = useState(() => initialState(announcement));
  const [savedForm, setSavedForm] = useState(form);
  const [lang, setLang] = useState<ContentLang>("fr");
  const [error, setError] = useState<ApiError | null>(null);
  const [saved, setSaved] = useState(Boolean((location.state as { saved?: boolean } | null)?.saved));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(savedForm);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const refreshLists = () => {
    void queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  };

  const save = useMutation({
    mutationFn: (values: FormState) => {
      const payload = {
        title_fr: values.title_fr,
        title_en: values.title_en || null,
        message_fr: values.message_fr,
        message_en: values.message_en || null,
        importance: values.importance,
        section_id: values.section_id ? Number(values.section_id) : null,
        starts_at: fromDateTimeInput(values.starts_at),
        ends_at: fromDateTimeInput(values.ends_at),
        is_pinned: values.is_pinned,
        status: values.status,
      };
      return isNew
        ? api<{ data: AdminAnnouncement }>("/admin/announcements", { method: "POST", body: payload })
        : api<{ data: AdminAnnouncement }>(`/admin/announcements/${announcement.id}`, { method: "PUT", body: payload });
    },
    onSuccess: ({ data }) => {
      refreshLists();
      queryClient.setQueryData([...ANNOUNCEMENTS_QUERY_KEY, "detail", data.id], data);
      if (isNew) {
        navigate(announcementEditPath(data.id), { replace: true, state: { saved: true } });
        return;
      }
      const next = initialState(data);
      setForm(next);
      setSavedForm(next);
      setSaved(true);
      window.scrollTo({ top: 0 });
    },
    onError: (caught) => {
      setError(caught instanceof ApiError ? caught : new ApiError(0, "Une erreur inattendue est survenue."));
      window.scrollTo({ top: 0 });
    },
  });

  const remove = useMutation({
    mutationFn: () => api(`/admin/announcements/${announcement!.id}`, { method: "DELETE" }),
    onSuccess: () => {
      refreshLists();
      navigate(PATHS.announcements, { replace: true });
    },
    onError: (caught) => {
      setConfirmDelete(false);
      setError(caught instanceof ApiError ? caught : new ApiError(0, "La suppression a échoué."));
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaved(false);
    save.mutate(form);
  };

  const fieldError = (name: string) => error?.field(name);
  const hasErrors = (suffix: ContentLang) => Object.keys(error?.errors ?? {}).some((key) => key.endsWith(`_${suffix}`));
  const hasFieldErrors = error && Object.keys(error.errors).length > 0;
  const otherError = error && !hasFieldErrors ? error.message : null;

  const languageFields = (code: ContentLang) => {
    const french = code === "fr";
    return (
      <div className="space-y-5">
        {!french && (
          <p className="rounded-btn bg-surface-alt px-4 py-3 text-sm text-ink-soft">
            Facultatif. Sans traduction, les visiteurs qui lisent le site en anglais voient la version française.
          </p>
        )}
        <TextField
          label={french ? "Titre" : "Title"}
          value={french ? form.title_fr : form.title_en}
          onChange={(event) => set(french ? "title_fr" : "title_en", event.target.value)}
          error={fieldError(french ? "title_fr" : "title_en")}
          required={french}
          maxLength={255}
        />
        <TextAreaField
          label={french ? "Message" : "Message"}
          value={french ? form.message_fr : form.message_en}
          onChange={(event) => set(french ? "message_fr" : "message_en", event.target.value)}
          error={fieldError(french ? "message_fr" : "message_en")}
          hint={french ? "Court et précis : qui, quoi, quand, où." : undefined}
          required={french}
          maxLength={1000}
          rows={5}
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <PageHeader
        title={isNew ? "Nouvelle annonce" : form.title_fr || "Annonce"}
        back={{ to: PATHS.announcements, label: "Annonces" }}
      />

      <div className="mb-6 space-y-3" aria-live="polite">
        {saved && !dirty && <FormAlert tone="success">Annonce enregistrée.</FormAlert>}
        {hasFieldErrors && (
          <FormAlert tone="error">Certains champs sont à corriger : ils sont indiqués en rouge ci-dessous.</FormAlert>
        )}
        {otherError && <FormAlert tone="error">{otherError}</FormAlert>}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Card>
            <LanguageTabs
              active={lang}
              onChange={setLang}
              withErrors={{ fr: hasErrors("fr"), en: hasErrors("en") }}
              fr={languageFields("fr")}
              en={languageFields("en")}
            />
          </Card>

          <Card title="Importance">
            <RadioCards
              name="importance"
              legend="Importance"
              value={form.importance}
              options={IMPORTANCE_OPTIONS}
              onChange={(value) => set("importance", value)}
            />
            <CheckboxField
              className="mt-4"
              label="Épingler en tête"
              hint="Reste en tête des annonces et s'affiche aussi en bandeau sur toutes les pages."
              checked={form.is_pinned}
              onChange={(event) => set("is_pinned", event.target.checked)}
            />
          </Card>

          <Card title="Période d'affichage">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Début"
                type="datetime-local"
                value={form.starts_at}
                onChange={(event) => set("starts_at", event.target.value)}
                error={fieldError("starts_at")}
                hint="Laissez vide pour afficher l'annonce dès maintenant."
              />
              <TextField
                label="Fin"
                type="datetime-local"
                value={form.ends_at}
                onChange={(event) => set("ends_at", event.target.value)}
                error={fieldError("ends_at")}
                hint="Obligatoire : l'annonce disparaît d'elle-même du site à cette date."
                required
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <Card title="Publication">
            {!isNew && (
              <div className="mb-4 flex items-center gap-2 text-sm text-ink-soft">
                Actuellement :
                <StatusBadge tone={DISPLAY_STATUS[announcement.display_status].tone}>
                  {DISPLAY_STATUS[announcement.display_status].label}
                </StatusBadge>
              </div>
            )}
            <RadioCards name="status" legend="Statut" value={form.status} options={STATUS_OPTIONS} onChange={(value) => set("status", value)} />

            <Button type="submit" variant="primary" pending={save.isPending} className="mt-5 w-full">
              {save.isPending ? "Enregistrement…" : saveLabel(form, announcement)}
            </Button>

            {!isNew && (
              <div className="mt-4 border-t border-border-soft pt-4 text-xs leading-relaxed text-ink-soft">
                <p>
                  Créée le {formatDateTime(announcement.created_at)}
                  {announcement.author && ` par ${announcement.author.name}`}.
                </p>
                <p>Modifiée le {formatDateTime(announcement.updated_at)}.</p>
                {announcement.can.delete ? (
                  <Button variant="danger" onClick={() => setConfirmDelete(true)} className="mt-4 w-full">
                    <Trash2 size={16} aria-hidden="true" />
                    Supprimer
                  </Button>
                ) : (
                  <p className="mt-3">Pour retirer cette annonce du site, choisissez « Archivée ».</p>
                )}
              </div>
            )}
          </Card>

          <Card title="Section concernée">
            <SelectField
              label="Section"
              value={form.section_id}
              onChange={(event) => set("section_id", event.target.value)}
              error={fieldError("section_id")}
              hint="Une annonce pour une section apparaît aussi sur la page de cette section."
            >
              <option value="">Toute l'école</option>
              {sections.data?.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name.fr}
                </option>
              ))}
            </SelectField>
          </Card>
        </div>
      </div>

      {!isNew && (
        <ConfirmDialog
          open={confirmDelete}
          title="Supprimer cette annonce ?"
          message={
            announcement.can.restore
              ? "Elle sera retirée du site et placée dans la corbeille, d'où vous pourrez la restaurer."
              : "Ce brouillon sera supprimé."
          }
          confirmLabel="Supprimer"
          pending={remove.isPending}
          onConfirm={() => remove.mutate()}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </form>
  );
}

export function AnnouncementEditorPage() {
  const { id } = useParams();
  const announcementId = id ? Number(id) : null;
  const announcement = useQuery({
    queryKey: [...ANNOUNCEMENTS_QUERY_KEY, "detail", announcementId],
    queryFn: async () => (await api<{ data: AdminAnnouncement }>(`/admin/announcements/${announcementId}`)).data,
    enabled: announcementId !== null,
  });

  usePageMeta(
    `${announcementId === null ? "Nouvelle annonce" : "Annonce"} | Administration La Pépinière`,
    "Rédaction d'une annonce.",
  );

  if (announcementId === null) return <AnnouncementForm />;
  if (announcement.isPending) {
    return (
      <p role="status" className="flex items-center gap-2 py-10 text-sm text-ink-soft">
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        Chargement de l'annonce…
      </p>
    );
  }
  if (announcement.isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Annonce" back={{ to: PATHS.announcements, label: "Annonces" }} />
        <FormAlert tone="error">
          {announcement.error instanceof ApiError && announcement.error.status === 404
            ? "Cette annonce n'existe pas ou a été supprimée."
            : announcement.error.message}
        </FormAlert>
      </div>
    );
  }
  return <AnnouncementForm key={announcement.data.id} announcement={announcement.data} />;
}
