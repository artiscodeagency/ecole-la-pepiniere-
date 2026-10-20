import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/admin/components/Button";
import { Card } from "@/admin/components/Card";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { FormAlert } from "@/admin/components/FormAlert";
import { CheckboxField, TextAreaField, TextField } from "@/admin/components/FormField";
import { type ContentLang, LanguageTabs } from "@/admin/components/LanguageTabs";
import { PageHeader } from "@/admin/components/PageHeader";
import { type RadioCardOption, RadioCards } from "@/admin/components/RadioCards";
import {
  type AdminDocument,
  type DocumentType,
  DOCUMENT_TYPES,
  DOCUMENTS_QUERY_KEY,
  formatFileSize,
} from "@/admin/documents/types";
import { formatDateTime } from "@/admin/lib/dates";
import { documentEditPath, PATHS } from "@/admin/paths";
import { api, ApiError } from "@/lib/api/client";
import { usePageMeta } from "@/lib/usePageMeta";

/** Same limit as the server: refused here first, without a long upload. */
const MAX_BYTES = 20 * 1024 * 1024;

interface FormState {
  type: DocumentType;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  is_public: boolean;
}

const TYPE_OPTIONS: RadioCardOption<DocumentType>[] = (Object.keys(DOCUMENT_TYPES) as DocumentType[]).map((value) => ({
  value,
  label: DOCUMENT_TYPES[value].fr,
  description: DOCUMENT_TYPES[value].description,
}));

function initialState(document: AdminDocument | undefined): FormState {
  return {
    type: document?.type ?? "internal_rules",
    title_fr: document?.title.fr ?? DOCUMENT_TYPES.internal_rules.fr,
    title_en: document?.title.en ?? (document ? "" : DOCUMENT_TYPES.internal_rules.en),
    description_fr: document?.description.fr ?? "",
    description_en: document?.description.en ?? "",
    is_public: document?.is_public ?? true,
  };
}

function DocumentForm({ document }: { document?: AdminDocument }) {
  const isNew = document === undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(() => initialState(document));
  const [savedForm, setSavedForm] = useState(form);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [lang, setLang] = useState<ContentLang>("fr");
  const [error, setError] = useState<ApiError | null>(null);
  const [saved, setSaved] = useState(Boolean((location.state as { saved?: boolean } | null)?.saved));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dirty = file !== null || JSON.stringify(form) !== JSON.stringify(savedForm);

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

  /** A new document gets the type's name as title, as long as it was not typed by hand. */
  const chooseType = (type: DocumentType) => {
    setForm((current) => {
      const previous = DOCUMENT_TYPES[current.type];
      const untouched = isNew && current.title_fr === previous.fr && current.title_en === previous.en;
      return untouched ? { ...current, type, title_fr: DOCUMENT_TYPES[type].fr, title_en: DOCUMENT_TYPES[type].en } : { ...current, type };
    });
    setSaved(false);
  };

  const chooseFile = (chosen: File | undefined) => {
    setFileError(null);
    if (!chosen) return;
    if (chosen.type !== "application/pdf" && !chosen.name.toLowerCase().endsWith(".pdf")) {
      setFileError("Format non pris en charge : choisissez un fichier PDF.");
      return;
    }
    if (chosen.size > MAX_BYTES) {
      setFileError(`Ce fichier est trop lourd (${formatFileSize(chosen.size)}) : 20 Mo au maximum.`);
      return;
    }
    setFile(chosen);
    setSaved(false);
  };

  const save = useMutation({
    mutationFn: (values: FormState) => {
      const body = new FormData();
      body.set("type", values.type);
      body.set("title_fr", values.title_fr);
      body.set("title_en", values.title_en);
      body.set("description_fr", values.description_fr);
      body.set("description_en", values.description_en);
      body.set("is_public", values.is_public ? "1" : "0");
      if (file) body.set("file", file);
      if (isNew) return api<{ data: AdminDocument }>("/admin/documents", { method: "POST", body });
      // Files only travel in a POST: Laravel reads it as a PUT.
      body.set("_method", "PUT");
      return api<{ data: AdminDocument }>(`/admin/documents/${document.id}`, { method: "POST", body });
    },
    onSuccess: ({ data }) => {
      void queryClient.invalidateQueries({ queryKey: [...DOCUMENTS_QUERY_KEY, "list"] });
      if (isNew) {
        navigate(documentEditPath(data.id), { replace: true, state: { saved: true } });
        return;
      }
      const next = initialState(data);
      setForm(next);
      setSavedForm(next);
      setFile(null);
      setSaved(true);
      window.scrollTo({ top: 0 });
    },
    onError: (caught) => {
      setError(caught instanceof ApiError ? caught : new ApiError(0, "Une erreur inattendue est survenue."));
      window.scrollTo({ top: 0 });
    },
  });

  const remove = useMutation({
    mutationFn: () => api(`/admin/documents/${document!.id}`, { method: "DELETE" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
      navigate(PATHS.documents, { replace: true });
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
    if (isNew && !file) {
      setFileError("Choisissez le fichier PDF du document.");
      return;
    }
    save.mutate(form);
  };

  const fieldError = (name: string) => error?.field(name);
  const hasErrors = (suffix: ContentLang) => Object.keys(error?.errors ?? {}).some((key) => key.endsWith(`_${suffix}`));
  const hasFieldErrors = error && Object.keys(error.errors).length > 0;
  const otherError = error && !hasFieldErrors ? error.message : null;
  const shownFileError = fileError ?? fieldError("file");

  const languageFields = (code: ContentLang) => {
    const french = code === "fr";
    return (
      <div className="space-y-5">
        {!french && (
          <p className="rounded-btn bg-surface-alt px-4 py-3 text-sm text-ink-soft">
            Facultatif. Sans traduction, les visiteurs qui lisent le site en anglais voient le titre français.
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
          label={french ? "Description (facultatif)" : "Description (optional)"}
          value={french ? form.description_fr : form.description_en}
          onChange={(event) => set(french ? "description_fr" : "description_en", event.target.value)}
          error={fieldError(french ? "description_fr" : "description_en")}
          hint={french ? "Par exemple : « Année scolaire 2026-2027 ». Affichée sous le titre." : undefined}
          maxLength={1000}
          rows={3}
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <PageHeader title={isNew ? "Nouveau document" : form.title_fr || "Document"} back={{ to: PATHS.documents, label: "Documents" }} />

      <div className="mb-6 space-y-3" aria-live="polite">
        {saved && !dirty && <FormAlert tone="success">Document enregistré.</FormAlert>}
        {hasFieldErrors && <FormAlert tone="error">Certains champs sont à corriger : ils sont indiqués en rouge ci-dessous.</FormAlert>}
        {otherError && <FormAlert tone="error">{otherError}</FormAlert>}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Card title="Fichier PDF">
            {document && !file && (
              <div className="mb-4 flex flex-wrap items-center gap-3 rounded-btn bg-surface-alt px-4 py-3 text-sm">
                <FileText size={18} className="shrink-0 text-primary-dark" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-ink">
                  {document.file.name ?? "Document.pdf"} · {formatFileSize(document.file.size_bytes)}
                </span>
                <a
                  href={document.file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-primary-dark hover:underline"
                >
                  <ExternalLink size={15} aria-hidden="true" />
                  Ouvrir
                </a>
              </div>
            )}
            {file && (
              <div className="mb-4 flex flex-wrap items-center gap-3 rounded-btn border border-primary/40 bg-white px-4 py-3 text-sm">
                <FileText size={18} className="shrink-0 text-primary-dark" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-ink">
                  {file.name} · {formatFileSize(file.size)}
                </span>
                <Button variant="ghost" className="px-2.5 py-1.5" onClick={() => setFile(null)}>
                  Annuler
                </Button>
              </div>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              id="document-file"
              aria-describedby="document-file-hint"
              onChange={(event) => {
                chooseFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <Button onClick={() => fileInput.current?.click()}>
              <Upload size={16} aria-hidden="true" />
              {document || file ? "Remplacer le fichier" : "Choisir le fichier PDF"}
            </Button>
            <p id="document-file-hint" className="mt-2 text-xs text-ink-soft">
              Un fichier PDF de 20 Mo au maximum. {document && "En le remplaçant, l'ancien fichier est supprimé."}
            </p>
            {shownFileError && <p className="mt-1.5 text-sm text-red-700">{shownFileError}</p>}
          </Card>

          <Card>
            <LanguageTabs
              active={lang}
              onChange={setLang}
              withErrors={{ fr: hasErrors("fr"), en: hasErrors("en") }}
              fr={languageFields("fr")}
              en={languageFields("en")}
            />
          </Card>

          <Card title="Type de document">
            <RadioCards name="type" legend="Type de document" value={form.type} options={TYPE_OPTIONS} onChange={chooseType} />
            {fieldError("type") && <p className="mt-1.5 text-sm text-red-700">{fieldError("type")}</p>}
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <Card title="Publication">
            <CheckboxField
              label="Visible sur le site"
              hint="Décochez pour préparer un document sans le montrer aux familles."
              checked={form.is_public}
              onChange={(event) => set("is_public", event.target.checked)}
            />
            <Button type="submit" variant="primary" pending={save.isPending} disabled={!isNew && !dirty} className="mt-5 w-full">
              {save.isPending ? (file ? "Envoi du fichier…" : "Enregistrement…") : "Enregistrer"}
            </Button>

            {!isNew && (
              <div className="mt-4 border-t border-border-soft pt-4 text-xs leading-relaxed text-ink-soft">
                <p>Ajouté le {formatDateTime(document.created_at)}.</p>
                <p>Modifié le {formatDateTime(document.updated_at)}.</p>
                {document.can.delete && (
                  <Button variant="danger" onClick={() => setConfirmDelete(true)} className="mt-4 w-full">
                    <Trash2 size={16} aria-hidden="true" />
                    Supprimer
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {!isNew && (
        <ConfirmDialog
          open={confirmDelete}
          title="Supprimer ce document ?"
          message="Il sera retiré du site et placé dans la corbeille, d'où le Directeur pourra le restaurer."
          confirmLabel="Supprimer"
          pending={remove.isPending}
          onConfirm={() => remove.mutate()}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </form>
  );
}

export function DocumentEditorPage() {
  const { id } = useParams();
  const documentId = id ? Number(id) : null;
  // The list already holds every document: no single-document endpoint is needed.
  const documents = useQuery({
    queryKey: [...DOCUMENTS_QUERY_KEY, "list", false],
    queryFn: () => api<{ data: AdminDocument[] }>("/admin/documents"),
    enabled: documentId !== null,
  });

  usePageMeta(`${documentId === null ? "Nouveau document" : "Document"} | Administration La Pépinière`, "Ajout d'un document PDF.");

  if (documentId === null) return <DocumentForm />;
  if (documents.isPending) {
    return (
      <p role="status" className="flex items-center gap-2 py-10 text-sm text-ink-soft">
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        Chargement du document…
      </p>
    );
  }
  const document = documents.data?.data.find((item) => item.id === documentId);
  if (documents.isError || !document) {
    return (
      <div className="space-y-4">
        <PageHeader title="Document" back={{ to: PATHS.documents, label: "Documents" }} />
        <FormAlert tone="error">{documents.isError ? documents.error.message : "Ce document n'existe pas ou a été supprimé."}</FormAlert>
      </div>
    );
  }
  return <DocumentForm key={document.id} document={document} />;
}
