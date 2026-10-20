import type { BadgeTone } from "@/admin/components/StatusBadge";
import type { Paginated } from "@/admin/types";

export type AdmissionStatus = "new" | "in_progress" | "handled";

export interface AdminAdmissionRequest {
  id: number;
  parent_name: string;
  child_name: string;
  /** A plain date, "2021-03-14". */
  child_birth_date: string;
  child_age: number;
  /** The official level, or the level as the family wrote it. */
  level: string | null;
  phone: string;
  email: string;
  /** Only on a single request, not in the list. */
  message?: string | null;
  academic_year: string | null;
  status: AdmissionStatus;
  handled_at: string | null;
  handled_by: string | null;
  internal_note?: string | null;
  created_at: string;
  can: { delete: boolean };
}

export type AdmissionPage = Paginated<AdminAdmissionRequest> & { counts: Record<AdmissionStatus, number> };

export const ADMISSION_STATUS: Record<AdmissionStatus, { label: string; tone: BadgeTone }> = {
  new: { label: "Nouvelle", tone: "warning" },
  in_progress: { label: "En cours", tone: "neutral" },
  handled: { label: "Traitée", tone: "success" },
};

export const ADMISSIONS_QUERY_KEY = ["admin", "admission-requests"] as const;

const birthDateFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

/** "14 mars 2021 (5 ans)", read as a local date so it never shifts by a day. */
export function formatBirthDate(date: string, age: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return `${birthDateFormat.format(new Date(year, month - 1, day))} (${age} an${age > 1 ? "s" : ""})`;
}
