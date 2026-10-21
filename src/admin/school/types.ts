export interface OpeningTimes {
  start: string;
  end: string;
}

export type SectionHours = Partial<Record<"mon_thu" | "friday", OpeningTimes>>;

/** The school information edited as single values; null when not filled in yet. */
export interface SchoolSettingsValues {
  contact: {
    phones: string[] | null;
    whatsapp: string[] | null;
    whatsapp_primary: string | null;
    email: string | null;
  };
  location: {
    address_fr: string | null;
    address_en: string | null;
    city: string | null;
  };
  hours: {
    kindergarten: SectionHours | null;
    primary: SectionHours | null;
  };
  social: {
    facebook: string | null;
    instagram: string | null;
  };
  admissions: {
    academic_year: string | null;
  };
}

export interface SchoolSettingsResponse {
  values: SchoolSettingsValues;
  updated_at: string | null;
  updated_by: string | null;
}

export const SCHOOL_INFO_QUERY_KEY = ["admin", "school-info"] as const;
