import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/admin/components/Button";
import { Card } from "@/admin/components/Card";
import { FormAlert } from "@/admin/components/FormAlert";
import { SelectField, TextField } from "@/admin/components/FormField";
import { formatDateTime } from "@/admin/lib/dates";
import { SCHOOL_INFO_QUERY_KEY, type SchoolSettingsResponse, type SectionHours } from "@/admin/school/types";
import { api, ApiError } from "@/lib/api/client";

type Days = "mon_thu" | "friday";
type HoursSection = "kindergarten" | "primary";
type HoursState = Record<HoursSection, Record<Days, { start: string; end: string }>>;

interface FormState {
  phones: string[];
  whatsapp: string[];
  whatsapp_primary: string;
  email: string;
  address_fr: string;
  address_en: string;
  city: string;
  hours: HoursState;
  facebook: string;
  instagram: string;
  academic_year: string;
}

const MAX_NUMBERS = 4;

const HOURS_SECTIONS: { key: HoursSection; label: string }[] = [
  { key: "kindergarten", label: "Maternelle" },
  { key: "primary", label: "Primaire" },
];

const DAYS: { key: Days; label: string }[] = [
  { key: "mon_thu", label: "Lundi au jeudi" },
  { key: "friday", label: "Vendredi" },
];

function sectionHours(hours: SectionHours | null): Record<Days, { start: string; end: string }> {
  return {
    mon_thu: { start: hours?.mon_thu?.start ?? "", end: hours?.mon_thu?.end ?? "" },
    friday: { start: hours?.friday?.start ?? "", end: hours?.friday?.end ?? "" },
  };
}

function initialState({ values }: SchoolSettingsResponse): FormState {
  return {
    phones: values.contact.phones ?? [],
    whatsapp: values.contact.whatsapp ?? [],
    whatsapp_primary: values.contact.whatsapp_primary ?? "",
    email: values.contact.email ?? "",
    address_fr: values.location.address_fr ?? "",
    address_en: values.location.address_en ?? "",
    city: values.location.city ?? "",
    hours: { kindergarten: sectionHours(values.hours.kindergarten), primary: sectionHours(values.hours.primary) },
    facebook: values.social.facebook ?? "",
    instagram: values.social.instagram ?? "",
    academic_year: values.admissions.academic_year ?? "",
  };
}

function toPayload(form: FormState) {
  const orNull = (value: string) => value.trim() || null;
  const numbers = (list: string[]) => list.map((number) => number.trim()).filter(Boolean);
  return {
    contact: {
      phones: numbers(form.phones),
      whatsapp: numbers(form.whatsapp),
      whatsapp_primary: orNull(form.whatsapp_primary),
      email: orNull(form.email),
    },
    location: { address_fr: orNull(form.address_fr), address_en: orNull(form.address_en), city: orNull(form.city) },
    hours: form.hours,
    social: { facebook: orNull(form.facebook), instagram: orNull(form.instagram) },
    admissions: { academic_year: orNull(form.academic_year) },
  };
}

interface NumberListProps {
  legend: string;
  hint: string;
  numbers: string[];
  errorFor: (index: number) => string | undefined;
  error?: string;
  onChange: (numbers: string[]) => void;
}

/** A short list of phone numbers: add, edit, remove. */
function NumberList({ legend, hint, numbers, errorFor, error, onChange }: NumberListProps) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">{legend}</legend>
      <p className="mt-1 text-xs leading-relaxed text-ink-soft">{hint}</p>
      <div className="mt-2 space-y-3">
        {numbers.map((number, index) => (
          <div key={index} className="flex items-start gap-2">
            <TextField
              className="flex-1"
              label={`${legend} ${index + 1}`}
              hideLabel
              type="tel"
              inputMode="tel"
              value={number}
              onChange={(event) => onChange(numbers.map((item, i) => (i === index ? event.target.value : item)))}
              error={errorFor(index)}
              placeholder="694 000 000"
              maxLength={30}
            />
            <Button
              className="shrink-0 px-3"
              aria-label={`Retirer le numéro ${index + 1}`}
              onClick={() => onChange(numbers.filter((_, i) => i !== index))}
            >
              <X size={16} aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>
      {numbers.length < MAX_NUMBERS && (
        <Button className="mt-3" onClick={() => onChange([...numbers, ""])}>
          <Plus size={16} aria-hidden="true" />
          Ajouter un numéro
        </Button>
      )}
      {error && <p className="mt-1.5 text-sm text-red-700">{error}</p>}
    </fieldset>
  );
}

export function SchoolSettingsForm({ settings }: { settings: SchoolSettingsResponse }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(() => initialState(settings));
  const [savedForm, setSavedForm] = useState(form);
  const [error, setError] = useState<ApiError | null>(null);
  const [saved, setSaved] = useState(false);
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

  const setTime = (section: HoursSection, days: Days, edge: "start" | "end", value: string) =>
    set("hours", { ...form.hours, [section]: { ...form.hours[section], [days]: { ...form.hours[section][days], [edge]: value } } });

  const save = useMutation({
    mutationFn: (values: FormState) =>
      api<{ data: SchoolSettingsResponse }>("/admin/school-info/settings", { method: "PUT", body: toPayload(values) }),
    onSuccess: ({ data }) => {
      queryClient.setQueryData([...SCHOOL_INFO_QUERY_KEY, "settings"], data);
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaved(false);
    save.mutate(form);
  };

  const fieldError = (name: string) => error?.field(name);
  const hasFieldErrors = error && Object.keys(error.errors).length > 0;
  const otherError = error && !hasFieldErrors ? error.message : null;
  const whatsappChoices = form.whatsapp.map((number) => number.trim()).filter(Boolean);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-6 space-y-3" aria-live="polite">
        {saved && !dirty && <FormAlert tone="success">Informations enregistrées.</FormAlert>}
        {hasFieldErrors && (
          <FormAlert tone="error">Certains champs sont à corriger : ils sont indiqués en rouge ci-dessous.</FormAlert>
        )}
        {otherError && <FormAlert tone="error">{otherError}</FormAlert>}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Card title="Téléphone et email">
            <div className="space-y-6">
              <NumberList
                legend="Téléphone"
                hint="Les numéros à appeler, affichés sur le site."
                numbers={form.phones}
                errorFor={(index) => fieldError(`contact.phones.${index}`)}
                error={fieldError("contact.phones")}
                onChange={(numbers) => set("phones", numbers)}
              />
              <NumberList
                legend="WhatsApp"
                hint="Les numéros joignables sur WhatsApp."
                numbers={form.whatsapp}
                errorFor={(index) => fieldError(`contact.whatsapp.${index}`)}
                error={fieldError("contact.whatsapp")}
                onChange={(numbers) => {
                  set("whatsapp", numbers);
                  // The chosen number must stay in the list.
                  if (!numbers.map((number) => number.trim()).includes(form.whatsapp_primary)) {
                    setForm((current) => ({ ...current, whatsapp: numbers, whatsapp_primary: "" }));
                  }
                }}
              />
              <SelectField
                label="Numéro WhatsApp principal"
                value={form.whatsapp_primary}
                onChange={(event) => set("whatsapp_primary", event.target.value)}
                error={fieldError("contact.whatsapp_primary")}
                hint="Le numéro mis en avant pour écrire à l'école sur WhatsApp."
                disabled={whatsappChoices.length === 0}
              >
                <option value="">{whatsappChoices.length === 0 ? "Ajoutez d'abord un numéro WhatsApp" : "Choisir…"}</option>
                {whatsappChoices.map((number) => (
                  <option key={number} value={number}>
                    {number}
                  </option>
                ))}
              </SelectField>
              <TextField
                label="Adresse email"
                type="email"
                inputMode="email"
                value={form.email}
                onChange={(event) => set("email", event.target.value)}
                error={fieldError("contact.email")}
                maxLength={190}
              />
            </div>
          </Card>

          <Card title="Adresse">
            <div className="space-y-5">
              <TextField
                label="Adresse"
                value={form.address_fr}
                onChange={(event) => set("address_fr", event.target.value)}
                error={fieldError("location.address_fr")}
                hint="Telle qu'elle s'affiche sur le site, par exemple la boîte postale, le quartier et un repère."
                maxLength={255}
              />
              <TextField
                label="Adresse en anglais (facultatif)"
                value={form.address_en}
                onChange={(event) => set("address_en", event.target.value)}
                error={fieldError("location.address_en")}
                hint="Sans traduction, les visiteurs qui lisent le site en anglais voient l'adresse en français."
                maxLength={255}
              />
              <TextField
                label="Ville"
                value={form.city}
                onChange={(event) => set("city", event.target.value)}
                error={fieldError("location.city")}
                maxLength={100}
              />
            </div>
          </Card>

          <Card title="Horaires">
            <p className="-mt-1 mb-5 text-sm text-ink-soft">
              Heure d'arrivée et heure de sortie. Le site les affiche au format de chaque langue (7h30 en français, 7:30 AM en
              anglais).
            </p>
            <div className="space-y-6">
              {HOURS_SECTIONS.map((section) => (
                <fieldset key={section.key}>
                  <legend className="text-sm font-semibold text-ink">{section.label}</legend>
                  <div className="mt-2 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs font-medium text-ink-soft sm:grid-cols-[9rem_1fr_1fr]" aria-hidden="true">
                      <span className="hidden sm:block" />
                      <span>Arrivée</span>
                      <span>Sortie</span>
                    </div>
                    {DAYS.map((days) => {
                      const path = `hours.${section.key}.${days.key}`;
                      return (
                        <div key={days.key} className="grid grid-cols-2 gap-3 sm:grid-cols-[9rem_1fr_1fr] sm:items-start">
                          <p className="col-span-2 text-sm text-ink-soft sm:col-span-1 sm:pt-3">{days.label}</p>
                          <TextField
                            className="min-w-0"
                            label={`${section.label}, ${days.label.toLowerCase()} : arrivée`}
                            hideLabel
                            type="time"
                            value={form.hours[section.key][days.key].start}
                            onChange={(event) => setTime(section.key, days.key, "start", event.target.value)}
                            error={fieldError(`${path}.start`)}
                          />
                          <TextField
                            className="min-w-0"
                            label={`${section.label}, ${days.label.toLowerCase()} : sortie`}
                            hideLabel
                            type="time"
                            value={form.hours[section.key][days.key].end}
                            onChange={(event) => setTime(section.key, days.key, "end", event.target.value)}
                            error={fieldError(`${path}.end`)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          </Card>

          <Card title="Réseaux sociaux">
            <p className="-mt-1 mb-5 text-sm text-ink-soft">
              Les icônes n'apparaissent sur le site que pour les réseaux dont le lien est renseigné.
            </p>
            <div className="space-y-5">
              <TextField
                label="Page Facebook"
                type="url"
                inputMode="url"
                value={form.facebook}
                onChange={(event) => set("facebook", event.target.value)}
                error={fieldError("social.facebook")}
                placeholder="https://www.facebook.com/…"
                maxLength={255}
              />
              <TextField
                label="Compte Instagram"
                type="url"
                inputMode="url"
                value={form.instagram}
                onChange={(event) => set("instagram", event.target.value)}
                error={fieldError("social.instagram")}
                placeholder="https://www.instagram.com/…"
                maxLength={255}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <Card title="Année scolaire">
            <TextField
              label="Année scolaire des inscriptions"
              value={form.academic_year}
              onChange={(event) => set("academic_year", event.target.value)}
              error={fieldError("admissions.academic_year")}
              hint="Par exemple 2026-2027. Enregistrée avec chaque demande d'inscription reçue."
              placeholder="2026-2027"
              maxLength={9}
            />
          </Card>

          <Card>
            <Button type="submit" variant="primary" pending={save.isPending} disabled={!dirty} className="w-full">
              {save.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
            {settings.updated_at && (
              <p className="mt-3 text-xs leading-relaxed text-ink-soft">
                Modifié le {formatDateTime(settings.updated_at)}
                {settings.updated_by && ` par ${settings.updated_by}`}.
              </p>
            )}
          </Card>
        </div>
      </div>
    </form>
  );
}
