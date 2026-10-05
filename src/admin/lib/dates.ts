const pad = (value: number) => String(value).padStart(2, "0");

/** ISO date from the API → value of an <input type="datetime-local">, in local time. */
export function toDateTimeInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Value of an <input type="datetime-local"> → ISO date (UTC) for the API. */
export function fromDateTimeInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

const dateTimeFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });
const dateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

/** "5 oct. 2026, 08:30" */
export function formatDateTime(iso: string | null): string {
  return iso ? dateTimeFormat.format(new Date(iso)) : "";
}

/** "5 oct. 2026" */
export function formatDate(iso: string | null): string {
  return iso ? dateFormat.format(new Date(iso)) : "";
}
