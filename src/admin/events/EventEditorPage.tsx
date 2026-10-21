import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/admin/components/Button";
import { Card } from "@/admin/components/Card";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { FormAlert } from "@/admin/components/FormAlert";
import { SelectField, TextAreaField, TextField } from "@/admin/components/FormField";
import { ImageUploadField } from "@/admin/components/ImageUploadField";
import { type ContentLang, LanguageTabs } from "@/admin/components/LanguageTabs";
import { PageHeader } from "@/admin/components/PageHeader";
import { type RadioCardOption, RadioCards } from "@/admin/components/RadioCards";
import { StatusBadge } from "@/admin/components/StatusBadge";
import { type AdminEvent, DISPLAY_STATUS, type EventStatus, EVENTS_QUERY_KEY } from "@/admin/events/types";
import { formatDateTime } from "@/admin/lib/dates";
import { useSections } from "@/admin/lib/useSections";
import { useNewsCategories } from "@/admin/news/useNewsCategories";
import { eventEditPath, PATHS } from "@/admin/paths";
import type { Media } from "@/admin/types";
import { api, ApiError } from "@/lib/api/client";
import { usePageMeta } from "@/lib/usePageMeta";
import { deletedMessage, NOUNS, savedMessage } from "@/admin/toast/messages";

interface FormState {
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  location_fr: string;
  location_en: string;
  /** "YYYY-MM-DD" */
  event_date: string;
  end_date: string;
  /** "HH:MM" */
  start_time: string;
  end_time: string;
  section_id: string;
  category_id: string;
  image: Media | null;
  image_alt_fr: string;
  status: EventStatus;
}

function initialState(event: AdminEvent | undefined): FormState {
  return {
    title_fr: event?.title.fr ?? "",
    title_en: event?.title.en ?? "",
    description_fr: event?.description.fr ?? "",
    description_en: event?.description.en ?? "",
    location_fr: event?.location.fr ?? "",
    location_en: event?.location.en ?? "",
    event_date: event?.event_date ?? "",
    end_date: event?.end_date ?? "",
    start_time: event?.start_time ?? "",
    end_time: event?.end_time ?? "",
    section_id: event?.section ? String(event.section.id) : "",
    category_id: event?.category ? String(event.category.id) : "",
    image: event?.image ?? null,
    image_alt_fr: event?.image?.alt.fr ?? "",
    status: event?.status ?? "draft",
  };
}

const STATUS_OPTIONS: RadioCardOption<EventStatus>[] = [
  { value: "draft", label: "Brouillon", description: "Visible uniquement dans l'administration." },
  { value: "published", label: "Publié", description: "Affiché dans l'agenda du site." },
  { value: "cancelled", label: "Annulé", description: "Reste affiché avec la mention « Annulé », pour prévenir les familles." },
  { value: "archived", label: "Archivé", description: "Retiré du site, conservé ici." },
];

function saveLabel(form: FormState, event: AdminEvent | undefined) {
  if (form.status === "draft") return "Enregistrer le brouillon";
  if (form.status === "published" && event?.status !== "published") return "Publier";
  return "Enregistrer";
}

function EventForm({ event }: { event?: AdminEvent }) {
  const isNew = event === undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const sections = useSections();
  const categories = useNewsCategories();
  const [form, setForm] = useState(() => initialState(event));
  const [savedForm, setSavedForm] = useState(form);
  const [lang, setLang] = useState<ContentLang>("fr");
  const [error, setError] = useState<ApiError | null>(null);
  const [saved, setSaved] = useState(Boolean((location.state as { saved?: boolean } | null)?.saved));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(savedForm);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (beforeUnload: BeforeUnloadEvent) => beforeUnload.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const refreshLists = () => {
    void queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  };

  const save = useMutation({
    meta: { success: (_data, values) => savedMessage(NOUNS.event, (values as FormState).status, isNew) },
    mutationFn: async (values: FormState) => {
      const image = values.image;
      if (image && values.image_alt_fr !== (image.alt.fr ?? "")) {
        await api(`/admin/media/${image.id}`, { method: "PATCH", body: { alt_fr: values.image_alt_fr || null } });
      }
      const payload = {
        title_fr: values.title_fr,
        title_en: values.title_en || null,
        description_fr: values.description_fr,
        description_en: values.description_en || null,
        location_fr: values.location_fr || null,
        location_en: values.location_en || null,
        event_date: values.event_date || null,
        end_date: values.end_date || null,
        start_time: values.start_time || null,
        end_time: values.end_time || null,
        section_id: values.section_id ? Number(values.section_id) : null,
        category_id: values.category_id ? Number(values.category_id) : null,
        image_media_id: image?.id ?? null,
        status: values.status,
      };
      return isNew
        ? api<{ data: AdminEvent }>("/admin/events", { method: "POST", body: payload })
        : api<{ data: AdminEvent }>(`/admin/events/${event.id}`, { method: "PUT", body: payload });
    },
    onSuccess: ({ data }) => {
      refreshLists();
      queryClient.setQueryData([...EVENTS_QUERY_KEY, "detail", data.id], data);
      if (isNew) {
        navigate(eventEditPath(data.id), { replace: true, state: { saved: true } });
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
    meta: { success: deletedMessage(NOUNS.event) },
    mutationFn: () => api(`/admin/events/${event!.id}`, { method: "DELETE" }),
    onSuccess: () => {
      refreshLists();
      navigate(PATHS.events, { replace: true });
    },
    onError: (caught) => {
      setConfirmDelete(false);
      setError(caught instanceof ApiError ? caught : new ApiError(0, "La suppression a échoué."));
    },
  });

  const handleSubmit = (submit: FormEvent<HTMLFormElement>) => {
    submit.preventDefault();
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
          onChange={(change) => set(french ? "title_fr" : "title_en", change.target.value)}
          error={fieldError(french ? "title_fr" : "title_en")}
          required={french}
          maxLength={255}
        />
        <TextAreaField
          label={french ? "Description" : "Description"}
          value={french ? form.description_fr : form.description_en}
          onChange={(change) => set(french ? "description_fr" : "description_en", change.target.value)}
          error={fieldError(french ? "description_fr" : "description_en")}
          hint={french ? "Ce que les familles doivent savoir : programme, tenue, ce qu'il faut apporter…" : undefined}
          required={french}
          maxLength={2000}
          rows={5}
        />
        <TextField
          label={french ? "Lieu" : "Location"}
          value={french ? form.location_fr : form.location_en}
          onChange={(change) => set(french ? "location_fr" : "location_en", change.target.value)}
          error={fieldError(french ? "location_fr" : "location_en")}
          placeholder={french ? "Par exemple : cour de l'école" : form.location_fr}
          maxLength={255}
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <PageHeader title={isNew ? "Nouvel événement" : form.title_fr || "Événement"} back={{ to: PATHS.events, label: "Événements" }} />

      <div className="mb-6 space-y-3" aria-live="polite">
        {saved && !dirty && <FormAlert tone="success">Événement enregistré.</FormAlert>}
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

          <Card title="Date et horaires">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Date"
                type="date"
                value={form.event_date}
                onChange={(change) => set("event_date", change.target.value)}
                error={fieldError("event_date")}
                required
              />
              <TextField
                label="Dernier jour"
                type="date"
                value={form.end_date}
                min={form.event_date || undefined}
                onChange={(change) => set("end_date", change.target.value)}
                error={fieldError("end_date")}
                hint="Seulement pour un événement sur plusieurs jours."
              />
              <TextField
                label="Heure de début"
                type="time"
                value={form.start_time}
                onChange={(change) => set("start_time", change.target.value)}
                error={fieldError("start_time")}
              />
              <TextField
                label="Heure de fin"
                type="time"
                value={form.end_time}
                onChange={(change) => set("end_time", change.target.value)}
                error={fieldError("end_time")}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <Card title="Publication">
            {!isNew && (
              <div className="mb-4 flex items-center gap-2 text-sm text-ink-soft">
                Actuellement :
                <StatusBadge tone={DISPLAY_STATUS[event.display_status].tone}>{DISPLAY_STATUS[event.display_status].label}</StatusBadge>
              </div>
            )}
            <RadioCards name="status" legend="Statut" value={form.status} options={STATUS_OPTIONS} onChange={(value) => set("status", value)} />

            <Button type="submit" variant="primary" pending={save.isPending} className="mt-5 w-full">
              {save.isPending ? "Enregistrement…" : saveLabel(form, event)}
            </Button>

            {!isNew && (
              <div className="mt-4 border-t border-border-soft pt-4 text-xs leading-relaxed text-ink-soft">
                <p>
                  Créé le {formatDateTime(event.created_at)}
                  {event.author && ` par ${event.author.name}`}.
                </p>
                <p>Modifié le {formatDateTime(event.updated_at)}.</p>
                {event.can.delete ? (
                  <Button variant="danger" onClick={() => setConfirmDelete(true)} className="mt-4 w-full">
                    <Trash2 size={16} aria-hidden="true" />
                    Supprimer
                  </Button>
                ) : (
                  <p className="mt-3">Pour retirer cet événement, choisissez « Annulé » ou « Archivé ».</p>
                )}
              </div>
            )}
          </Card>

          <Card title="Classement">
            <div className="space-y-5">
              <SelectField
                label="Section concernée"
                value={form.section_id}
                onChange={(change) => set("section_id", change.target.value)}
                error={fieldError("section_id")}
              >
                <option value="">Toute l'école</option>
                {sections.data?.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name.fr}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Catégorie"
                value={form.category_id}
                onChange={(change) => set("category_id", change.target.value)}
                error={fieldError("category_id")}
              >
                <option value="">Aucune</option>
                {categories.data?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name.fr}
                  </option>
                ))}
              </SelectField>
            </div>
          </Card>

          <Card title="Photo">
            <ImageUploadField
              label="Photo de l'événement"
              value={form.image}
              onChange={(media) => {
                set("image", media);
                set("image_alt_fr", media?.alt.fr ?? "");
              }}
              error={fieldError("image_media_id")}
              hint="Facultative. Les photos de téléphone sont réduites automatiquement avant l'envoi."
            />
            {form.image && (
              <TextField
                className="mt-4"
                label="Description de la photo"
                value={form.image_alt_fr}
                onChange={(change) => set("image_alt_fr", change.target.value)}
                hint="Lue aux personnes malvoyantes. Laissez vide pour utiliser le titre."
                maxLength={255}
              />
            )}
          </Card>
        </div>
      </div>

      {!isNew && (
        <ConfirmDialog
          open={confirmDelete}
          title="Supprimer cet événement ?"
          message={
            event.can.restore
              ? "Il sera retiré du site et placé dans la corbeille, d'où vous pourrez le restaurer."
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

export function EventEditorPage() {
  const { id } = useParams();
  const eventId = id ? Number(id) : null;
  const event = useQuery({
    queryKey: [...EVENTS_QUERY_KEY, "detail", eventId],
    queryFn: async () => (await api<{ data: AdminEvent }>(`/admin/events/${eventId}`)).data,
    enabled: eventId !== null,
  });

  usePageMeta(`${eventId === null ? "Nouvel événement" : "Événement"} | Administration La Pépinière`, "Agenda de l'école.");

  if (eventId === null) return <EventForm />;
  if (event.isPending) {
    return (
      <p role="status" className="flex items-center gap-2 py-10 text-sm text-ink-soft">
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        Chargement de l'événement…
      </p>
    );
  }
  if (event.isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Événement" back={{ to: PATHS.events, label: "Événements" }} />
        <FormAlert tone="error">
          {event.error instanceof ApiError && event.error.status === 404
            ? "Cet événement n'existe pas ou a été supprimé."
            : event.error.message}
        </FormAlert>
      </div>
    );
  }
  return <EventForm key={event.data.id} event={event.data} />;
}
