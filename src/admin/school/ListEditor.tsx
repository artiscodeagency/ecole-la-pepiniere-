import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/admin/components/Button";
import { Card } from "@/admin/components/Card";
import { FormAlert } from "@/admin/components/FormAlert";
import { CheckboxField, SelectField, TextAreaField, TextField } from "@/admin/components/FormField";
import { formatDateTime } from "@/admin/lib/dates";
import { useSections } from "@/admin/lib/useSections";
import { formatFcfa, type ListColumn, type ListData, type ListDefinition, type ListItem } from "@/admin/school/lists";
import { SCHOOL_INFO_QUERY_KEY } from "@/admin/school/types";
import { api, ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

/** A row as edited: every value is the text of its field. */
interface Row {
  /** Stable React key, also for rows not saved yet. */
  key: number;
  id: number | null;
  values: Record<string, string>;
}

interface FormState {
  rows: Row[];
  dueDates: { first: string; second: string };
}

let nextKey = 1;

/** A checkbox is "1" when checked, "" otherwise; a new row starts checked (visible, offered). */
function toValue(column: ListColumn, item?: ListItem): string {
  if (column.kind === "checkbox") return (item ? item[column.key] : true) ? "1" : "";
  const value = item?.[column.key];
  return value == null ? "" : String(value);
}

function toRow(columns: ListColumn[], item?: ListItem): Row {
  const values = Object.fromEntries(columns.map((column) => [column.key, toValue(column, item)]));
  return { key: nextKey++, id: item?.id ?? null, values };
}

function initialState(definition: ListDefinition, data: ListData): FormState {
  return {
    rows: data.items.map((item) => toRow(definition.columns, item)),
    dueDates: { first: data.due_dates?.first ?? "", second: data.due_dates?.second ?? "" },
  };
}

/** What the form shows, without the React keys: to know if something changed. */
function snapshot(form: FormState) {
  return JSON.stringify({ rows: form.rows.map(({ id, values }) => ({ id, values })), dueDates: form.dueDates });
}

function toPayload(definition: ListDefinition, form: FormState) {
  const items = form.rows.map((row) => {
    const item: Record<string, string | number | boolean | null> = row.id ? { id: row.id } : {};
    for (const column of definition.columns) {
      const value = row.values[column.key].trim();
      if (column.kind === "checkbox") item[column.key] = value === "1";
      else if (column.kind === "text" || column.kind === "textarea") item[column.key] = value || null;
      else item[column.key] = value === "" ? null : Number(value);
    }
    return item;
  });
  return definition.name === "school-fees"
    ? { items, due_dates: { first: form.dueDates.first || null, second: form.dueDates.second || null } }
    : { items };
}

export function ListEditor({ definition, data }: { definition: ListDefinition; data: ListData }) {
  const queryClient = useQueryClient();
  const sections = useSections();
  const [form, setForm] = useState(() => initialState(definition, data));
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshot(form));
  const [updatedAt, setUpdatedAt] = useState(data.updated_at);
  const [error, setError] = useState<ApiError | null>(null);
  const [saved, setSaved] = useState(false);
  const cardRef = useRef<HTMLFormElement>(null);
  const dirty = snapshot(form) !== savedSnapshot;
  const withDueDates = definition.name === "school-fees";

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const update = (change: (current: FormState) => FormState) => {
    setForm(change);
    setSaved(false);
  };

  const setValue = (rowKey: number, column: string, value: string) =>
    update((current) => ({
      ...current,
      rows: current.rows.map((row) => (row.key === rowKey ? { ...row, values: { ...row.values, [column]: value } } : row)),
    }));

  const move = (index: number, offset: -1 | 1) =>
    update((current) => {
      const rows = [...current.rows];
      [rows[index], rows[index + offset]] = [rows[index + offset], rows[index]];
      return { ...current, rows };
    });

  const save = useMutation({
    meta: { success: "Modifications enregistrées" },
    mutationFn: (values: FormState) =>
      api<{ data: ListData }>(`/admin/school-info/lists/${definition.name}`, { method: "PUT", body: toPayload(definition, values) }),
    onSuccess: ({ data: next }) => {
      queryClient.setQueryData<Record<string, ListData>>([...SCHOOL_INFO_QUERY_KEY, "lists"], (current) =>
        current ? { ...current, [definition.name]: next } : current,
      );
      const state = initialState(definition, next);
      setForm(state);
      setSavedSnapshot(snapshot(state));
      setUpdatedAt(next.updated_at);
      setSaved(true);
    },
    onError: (caught) => {
      setError(caught instanceof ApiError ? caught : new ApiError(0, "Une erreur inattendue est survenue."));
      cardRef.current?.scrollIntoView({ block: "start" });
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

  const field = (row: Row, index: number, column: ListColumn) => {
    const common = {
      label: column.label,
      value: row.values[column.key],
      error: fieldError(`items.${index}.${column.key}`),
      hint: column.hint,
      required: column.required,
      className: cn(column.wide && "sm:col-span-2"),
    };
    if (column.kind === "section") {
      return (
        <SelectField key={column.key} {...common} onChange={(event) => setValue(row.key, column.key, event.target.value)}>
          <option value="">{column.required ? "Choisir…" : "Toute l'école"}</option>
          {sections.data?.map((section) => (
            <option key={section.id} value={section.id}>
              {section.name.fr}
            </option>
          ))}
        </SelectField>
      );
    }
    if (column.kind === "amount") {
      const amount = row.values[column.key];
      return (
        <TextField
          key={column.key}
          {...common}
          inputMode="numeric"
          // Digits only: "50 000" or "50.000" become 50000.
          onChange={(event) => setValue(row.key, column.key, event.target.value.replace(/\D/g, "").slice(0, 8))}
          hint={amount ? formatFcfa(Number(amount)) : (column.hint ?? "En FCFA, chiffres uniquement.")}
          placeholder="0"
        />
      );
    }
    if (column.kind === "checkbox") {
      return (
        <CheckboxField
          key={column.key}
          label={column.label}
          hint={column.hint}
          className={common.className}
          checked={row.values[column.key] === "1"}
          onChange={(event) => setValue(row.key, column.key, event.target.checked ? "1" : "")}
        />
      );
    }
    if (column.kind === "textarea") {
      return (
        <TextAreaField
          key={column.key}
          {...common}
          onChange={(event) => setValue(row.key, column.key, event.target.value)}
          maxLength={3000}
          rows={3}
        />
      );
    }
    return (
      <TextField
        key={column.key}
        {...common}
        onChange={(event) => setValue(row.key, column.key, event.target.value)}
        placeholder={column.placeholder}
        maxLength={255}
      />
    );
  };

  return (
    <form ref={cardRef} onSubmit={handleSubmit} noValidate className="scroll-mt-6">
      <Card title={definition.title}>
        <p className="-mt-1 mb-5 text-sm text-ink-soft">{definition.description}</p>

        <div className="mb-5 space-y-3 empty:hidden" aria-live="polite">
          {saved && !dirty && <FormAlert tone="success">Modifications enregistrées.</FormAlert>}
          {hasFieldErrors && <FormAlert tone="error">Certains champs sont à corriger : ils sont indiqués en rouge.</FormAlert>}
          {otherError && <FormAlert tone="error">{otherError}</FormAlert>}
        </div>

        {form.rows.length === 0 ? (
          <p className="rounded-btn border border-dashed border-border-soft px-4 py-6 text-center text-sm text-ink-soft">
            Aucun élément pour le moment.
          </p>
        ) : (
          <ol className="space-y-4">
            {form.rows.map((row, index) => (
              <li key={row.key} className="rounded-btn border border-border-soft p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">
                    {definition.itemLabel} {index + 1}
                  </p>
                  <div className="flex gap-1">
                    <Button variant="ghost" className="px-2.5" aria-label="Monter" disabled={index === 0} onClick={() => move(index, -1)}>
                      <ArrowUp size={16} aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="px-2.5"
                      aria-label="Descendre"
                      disabled={index === form.rows.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown size={16} aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="px-2.5 text-red-700 hover:text-red-700"
                      aria-label={`Retirer : ${definition.itemLabel.toLowerCase()} ${index + 1}`}
                      onClick={() => update((current) => ({ ...current, rows: current.rows.filter((item) => item.key !== row.key) }))}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">{definition.columns.map((column) => field(row, index, column))}</div>
                {definition.name === "school-fees" && row.values.first_installment && row.values.second_installment && (
                  <p className="mt-3 text-sm font-semibold text-ink">
                    Total : {formatFcfa(Number(row.values.first_installment) + Number(row.values.second_installment))}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}

        <Button
          className="mt-4"
          onClick={() => update((current) => ({ ...current, rows: [...current.rows, toRow(definition.columns)] }))}
        >
          <Plus size={16} aria-hidden="true" />
          {definition.addLabel}
        </Button>

        {withDueDates && (
          <fieldset className="mt-6 border-t border-border-soft pt-5">
            <legend className="sr-only">Échéances</legend>
            <p className="text-sm font-semibold text-ink">Échéances</p>
            <p className="mt-1 text-xs text-ink-soft">La date limite de paiement de chaque tranche.</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <TextField
                label="1re tranche"
                type="date"
                value={form.dueDates.first}
                onChange={(event) => {
                  const first = event.target.value;
                  update((current) => ({ ...current, dueDates: { ...current.dueDates, first } }));
                }}
                error={fieldError("due_dates.first")}
              />
              <TextField
                label="2e tranche"
                type="date"
                value={form.dueDates.second}
                onChange={(event) => {
                  const second = event.target.value;
                  update((current) => ({ ...current, dueDates: { ...current.dueDates, second } }));
                }}
                error={fieldError("due_dates.second")}
              />
            </div>
          </fieldset>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border-soft pt-5">
          <Button type="submit" variant="primary" pending={save.isPending} disabled={!dirty}>
            {save.isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
          {dirty && <p className="text-xs text-ink-soft">Modifications non enregistrées.</p>}
          {!dirty && updatedAt && <p className="text-xs text-ink-soft">Modifié le {formatDateTime(updatedAt)}.</p>}
        </div>
      </Card>
    </form>
  );
}
