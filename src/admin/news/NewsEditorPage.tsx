import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/admin/components/Button";
import { Card } from "@/admin/components/Card";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { FormAlert } from "@/admin/components/FormAlert";
import { CheckboxField, SelectField, TextAreaField, TextField } from "@/admin/components/FormField";
import { ImageUploadField } from "@/admin/components/ImageUploadField";
import { type ContentLang, LanguageTabs } from "@/admin/components/LanguageTabs";
import { PageHeader } from "@/admin/components/PageHeader";
import { type RadioCardOption, RadioCards } from "@/admin/components/RadioCards";
import { RichTextEditor } from "@/admin/components/RichTextEditor";
import { formatDateTime, fromDateTimeInput, toDateTimeInput } from "@/admin/lib/dates";
import { NewsStatusBadge } from "@/admin/news/NewsStatusBadge";
import { type AdminNews, NEWS_QUERY_KEY, type NewsStatus } from "@/admin/news/types";
import { useNewsCategories } from "@/admin/news/useNewsCategories";
import { newsEditPath, PATHS } from "@/admin/paths";
import type { Media } from "@/admin/types";
import { api, ApiError } from "@/lib/api/client";
import { usePageMeta } from "@/lib/usePageMeta";
import { deletedMessage, NOUNS, savedMessage } from "@/admin/toast/messages";

interface FormState {
  title_fr: string;
  title_en: string;
  excerpt_fr: string;
  excerpt_en: string;
  body_fr: string;
  body_en: string;
  category_id: string;
  cover: Media | null;
  cover_alt_fr: string;
  cover_alt_en: string;
  status: NewsStatus;
  /** Value of the datetime-local input; empty publishes now. */
  published_at: string;
  is_featured: boolean;
  slug: string;
  seo_title_fr: string;
  seo_title_en: string;
  seo_description_fr: string;
  seo_description_en: string;
}

function initialState(news: AdminNews | undefined): FormState {
  return {
    title_fr: news?.title.fr ?? "",
    title_en: news?.title.en ?? "",
    excerpt_fr: news?.excerpt.fr ?? "",
    excerpt_en: news?.excerpt.en ?? "",
    body_fr: news?.body?.fr ?? "",
    body_en: news?.body?.en ?? "",
    category_id: news?.category ? String(news.category.id) : "",
    cover: news?.cover ?? null,
    cover_alt_fr: news?.cover?.alt.fr ?? "",
    cover_alt_en: news?.cover?.alt.en ?? "",
    status: news?.status ?? "draft",
    published_at: toDateTimeInput(news?.published_at ?? null),
    is_featured: news?.is_featured ?? false,
    slug: news?.slug ?? "",
    seo_title_fr: news?.seo?.title.fr ?? "",
    seo_title_en: news?.seo?.title.en ?? "",
    seo_description_fr: news?.seo?.description.fr ?? "",
    seo_description_en: news?.seo?.description.en ?? "",
  };
}

const STATUS_OPTIONS: RadioCardOption<NewsStatus>[] = [
  { value: "draft", label: "Brouillon", description: "Visible uniquement dans l'administration." },
  { value: "published", label: "Publiée", description: "Visible sur le site, à la date choisie." },
  { value: "archived", label: "Archivée", description: "Retirée du site, conservée ici." },
];

function saveLabel(form: FormState, news: AdminNews | undefined) {
  if (form.status === "draft") return "Enregistrer le brouillon";
  if (form.status === "archived") return "Enregistrer";
  const wasOnline = news?.status === "published";
  const date = fromDateTimeInput(form.published_at);
  if (date && new Date(date) > new Date()) return wasOnline ? "Enregistrer" : "Programmer la publication";
  return wasOnline ? "Enregistrer les modifications" : "Publier";
}

function NewsForm({ news }: { news?: AdminNews }) {
  const isNew = news === undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const categories = useNewsCategories();
  const [form, setForm] = useState(() => initialState(news));
  const [savedForm, setSavedForm] = useState(form);
  const [lang, setLang] = useState<ContentLang>("fr");
  const [error, setError] = useState<ApiError | null>(null);
  const [saved, setSaved] = useState(Boolean((location.state as { saved?: boolean } | null)?.saved));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(savedForm);

  // Warns before closing the tab with unsaved changes.
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
    void queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  };

  const save = useMutation({
    meta: { success: (_data, values) => savedMessage(NOUNS.news, (values as FormState).status, isNew) },
    mutationFn: async (values: FormState) => {
      const cover = values.cover;
      if (cover && (values.cover_alt_fr !== (cover.alt.fr ?? "") || values.cover_alt_en !== (cover.alt.en ?? ""))) {
        await api(`/admin/media/${cover.id}`, {
          method: "PATCH",
          body: { alt_fr: values.cover_alt_fr || null, alt_en: values.cover_alt_en || null },
        });
      }
      const payload = {
        title_fr: values.title_fr,
        title_en: values.title_en || null,
        excerpt_fr: values.excerpt_fr,
        excerpt_en: values.excerpt_en || null,
        body_fr: values.body_fr,
        body_en: values.body_en || null,
        category_id: values.category_id ? Number(values.category_id) : null,
        cover_media_id: cover?.id ?? null,
        status: values.status,
        published_at: fromDateTimeInput(values.published_at),
        is_featured: values.is_featured,
        slug: values.slug || null,
        seo_title_fr: values.seo_title_fr || null,
        seo_title_en: values.seo_title_en || null,
        seo_description_fr: values.seo_description_fr || null,
        seo_description_en: values.seo_description_en || null,
      };
      return isNew
        ? api<{ data: AdminNews }>("/admin/news", { method: "POST", body: payload })
        : api<{ data: AdminNews }>(`/admin/news/${news.id}`, { method: "PUT", body: payload });
    },
    onSuccess: ({ data }) => {
      refreshLists();
      queryClient.setQueryData([...NEWS_QUERY_KEY, "detail", data.id], data);
      if (isNew) {
        navigate(newsEditPath(data.id), { replace: true, state: { saved: true } });
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
    meta: { success: deletedMessage(NOUNS.news) },
    mutationFn: () => api(`/admin/news/${news!.id}`, { method: "DELETE" }),
    onSuccess: () => {
      refreshLists();
      navigate(PATHS.news, { replace: true });
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
  const hasErrors = (suffix: ContentLang) =>
    Object.keys(error?.errors ?? {}).some((key) => key.endsWith(`_${suffix}`) && !key.startsWith("seo_"));

  const languageFields = (code: ContentLang) => {
    const french = code === "fr";
    return (
      <div className="space-y-5">
        {!french && (
          <p className="rounded-btn bg-surface-alt px-4 py-3 text-sm text-ink-soft">
            Facultatif. Si un texte n'est pas traduit, les visiteurs qui lisent le site en anglais voient la version
            française.
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
          label={french ? "Résumé" : "Summary"}
          value={french ? form.excerpt_fr : form.excerpt_en}
          onChange={(event) => set(french ? "excerpt_fr" : "excerpt_en", event.target.value)}
          error={fieldError(french ? "excerpt_fr" : "excerpt_en")}
          hint={french ? "Deux ou trois phrases, affichées dans la liste des actualités et sur l'accueil." : undefined}
          required={french}
          maxLength={500}
          rows={3}
        />
        <RichTextEditor
          label={french ? "Contenu" : "Content"}
          initialValue={french ? form.body_fr : form.body_en}
          onChange={(html) => set(french ? "body_fr" : "body_en", html)}
          error={fieldError(french ? "body_fr" : "body_en")}
          required={french}
        />
      </div>
    );
  };

  const otherErrors = error && Object.keys(error.errors).length === 0 ? error.message : null;
  const hasFieldErrors = error && Object.keys(error.errors).length > 0;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <PageHeader
        title={isNew ? "Nouvelle actualité" : form.title_fr || "Actualité"}
        back={{ to: PATHS.news, label: "Actualités" }}
      />

      <div className="mb-6 space-y-3" aria-live="polite">
        {saved && !dirty && <FormAlert tone="success">Actualité enregistrée.</FormAlert>}
        {hasFieldErrors && (
          <FormAlert tone="error">Certains champs sont à corriger : ils sont indiqués en rouge ci-dessous.</FormAlert>
        )}
        {otherErrors && <FormAlert tone="error">{otherErrors}</FormAlert>}
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

          <Card>
            <details className="group">
              <summary className="cursor-pointer list-none text-base font-semibold text-ink marker:hidden">
                <span className="flex items-center justify-between gap-3">
                  Adresse et partage sur les réseaux
                  <span className="text-sm font-normal text-primary-dark group-open:hidden">Afficher</span>
                  <span className="hidden text-sm font-normal text-primary-dark group-open:inline">Masquer</span>
                </span>
              </summary>
              <div className="mt-5 space-y-5">
                <TextField
                  label="Adresse de l'article"
                  value={form.slug}
                  onChange={(event) => set("slug", event.target.value.toLowerCase())}
                  placeholder={isNew ? "Créée automatiquement à partir du titre" : undefined}
                  disabled={!isNew && !news.can.change_slug}
                  error={fieldError("slug")}
                  hint={
                    !isNew && !news.can.change_slug
                      ? "Cette actualité a déjà été publiée : seul le Directeur peut changer son adresse, pour ne pas casser les liens déjà partagés."
                      : `Adresse : /actualites/${form.slug || "…"} — lettres minuscules sans accent, chiffres et tirets.`
                  }
                  maxLength={255}
                />
                <p className="text-sm text-ink-soft">
                  Textes affichés quand l'article est partagé sur WhatsApp ou Facebook. Laissez vide pour reprendre le
                  titre et le résumé.
                </p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    label="Titre de partage (français)"
                    value={form.seo_title_fr}
                    onChange={(event) => set("seo_title_fr", event.target.value)}
                    placeholder={form.title_fr}
                    error={fieldError("seo_title_fr")}
                    maxLength={255}
                  />
                  <TextField
                    label="Titre de partage (anglais)"
                    value={form.seo_title_en}
                    onChange={(event) => set("seo_title_en", event.target.value)}
                    placeholder={form.title_en}
                    error={fieldError("seo_title_en")}
                    maxLength={255}
                  />
                  <TextAreaField
                    label="Description de partage (français)"
                    value={form.seo_description_fr}
                    onChange={(event) => set("seo_description_fr", event.target.value)}
                    placeholder={form.excerpt_fr}
                    error={fieldError("seo_description_fr")}
                    maxLength={300}
                    rows={3}
                  />
                  <TextAreaField
                    label="Description de partage (anglais)"
                    value={form.seo_description_en}
                    onChange={(event) => set("seo_description_en", event.target.value)}
                    placeholder={form.excerpt_en}
                    error={fieldError("seo_description_en")}
                    maxLength={300}
                    rows={3}
                  />
                </div>
              </div>
            </details>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <Card title="Publication">
            {!isNew && (
              <div className="mb-4 flex items-center gap-2 text-sm text-ink-soft">
                Actuellement : <NewsStatusBadge news={news} />
              </div>
            )}
            <RadioCards name="status" legend="Statut" value={form.status} options={STATUS_OPTIONS} onChange={(value) => set("status", value)} />

            {form.status === "published" && (
              <TextField
                className="mt-4"
                label="Date de publication"
                type="datetime-local"
                value={form.published_at}
                onChange={(event) => set("published_at", event.target.value)}
                error={fieldError("published_at")}
                hint="Laissez vide pour publier maintenant. Une date à venir programme la publication."
              />
            )}

            <CheckboxField
              className="mt-4"
              label="Mettre en avant sur l'accueil"
              hint="Les actualités mises en avant apparaissent sur la page d'accueil du site."
              checked={form.is_featured}
              onChange={(event) => set("is_featured", event.target.checked)}
            />

            <Button type="submit" variant="primary" pending={save.isPending} className="mt-5 w-full">
              {save.isPending ? "Enregistrement…" : saveLabel(form, news)}
            </Button>

            {!isNew && (
              <div className="mt-4 border-t border-border-soft pt-4 text-xs leading-relaxed text-ink-soft">
                <p>
                  Créée le {formatDateTime(news.created_at)}
                  {news.author && ` par ${news.author.name}`}.
                </p>
                <p>Modifiée le {formatDateTime(news.updated_at)}.</p>
                {news.can.delete ? (
                  <Button variant="danger" onClick={() => setConfirmDelete(true)} className="mt-4 w-full">
                    <Trash2 size={16} aria-hidden="true" />
                    Supprimer
                  </Button>
                ) : (
                  <p className="mt-3">Pour retirer cette actualité du site, choisissez « Archivée ».</p>
                )}
              </div>
            )}
          </Card>

          <Card title="Catégorie">
            <SelectField
              label="Catégorie"
              value={form.category_id}
              onChange={(event) => set("category_id", event.target.value)}
              error={fieldError("category_id")}
              required
            >
              <option value="">Choisir une catégorie</option>
              {categories.data?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name.fr}
                </option>
              ))}
            </SelectField>
          </Card>

          <Card title="Image de couverture">
            <ImageUploadField
              label="Photo"
              value={form.cover}
              onChange={(media) => {
                set("cover", media);
                set("cover_alt_fr", media?.alt.fr ?? "");
                set("cover_alt_en", media?.alt.en ?? "");
              }}
              error={fieldError("cover_media_id")}
              hint="JPEG, PNG ou WebP. Les photos de téléphone sont réduites automatiquement avant l'envoi."
            />
            {form.cover && (
              <div className="mt-4 space-y-4">
                <TextField
                  label="Description de la photo (français)"
                  value={form.cover_alt_fr}
                  onChange={(event) => set("cover_alt_fr", event.target.value)}
                  hint="Lue aux personnes malvoyantes. Laissez vide pour utiliser le titre."
                  maxLength={255}
                />
                <TextField
                  label="Description de la photo (anglais)"
                  value={form.cover_alt_en}
                  onChange={(event) => set("cover_alt_en", event.target.value)}
                  maxLength={255}
                />
              </div>
            )}
          </Card>
        </div>
      </div>

      {!isNew && (
        <ConfirmDialog
          open={confirmDelete}
          title="Supprimer cette actualité ?"
          message={
            news.status === "draft" && !news.can.restore
              ? "Ce brouillon sera supprimé."
              : "Elle sera retirée du site et placée dans la corbeille, d'où le Directeur peut la restaurer."
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

export function NewsEditorPage() {
  const { id } = useParams();
  const newsId = id ? Number(id) : null;
  const news = useQuery({
    queryKey: [...NEWS_QUERY_KEY, "detail", newsId],
    queryFn: async () => (await api<{ data: AdminNews }>(`/admin/news/${newsId}`)).data,
    enabled: newsId !== null,
  });

  usePageMeta(
    `${newsId === null ? "Nouvelle actualité" : "Actualité"} | Administration La Pépinière`,
    "Rédaction d'une actualité.",
  );

  if (newsId === null) return <NewsForm />;
  if (news.isPending) {
    return (
      <p role="status" className="flex items-center gap-2 py-10 text-sm text-ink-soft">
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        Chargement de l'actualité…
      </p>
    );
  }
  if (news.isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Actualité" back={{ to: PATHS.news, label: "Actualités" }} />
        <FormAlert tone="error">
          {news.error instanceof ApiError && news.error.status === 404
            ? "Cette actualité n'existe pas ou a été supprimée."
            : news.error.message}
        </FormAlert>
      </div>
    );
  }
  // Remounted for each article, so the form starts from its saved values.
  return <NewsForm key={news.data.id} news={news.data} />;
}
