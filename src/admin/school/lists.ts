export type ListName = "school-fees" | "admission-fees" | "required-documents" | "transport-tariffs";

export type ListItem = { id: number } & Record<string, string | number | null>;

export interface DueDates {
  first: string | null;
  second: string | null;
}

export interface ListData {
  items: ListItem[];
  updated_at: string | null;
  /** Only for the school fees: when each installment is due. */
  due_dates?: DueDates;
}

export type ListsResponse = Record<ListName, ListData>;

export interface ListColumn {
  key: string;
  label: string;
  /** "amount" is whole FCFA; "section" is a choice of school section. */
  kind: "text" | "amount" | "section";
  required?: boolean;
  placeholder?: string;
  hint?: string;
  /** Takes the full width of the row. */
  wide?: boolean;
}

export interface ListDefinition {
  name: ListName;
  title: string;
  description: string;
  itemLabel: string;
  addLabel: string;
  columns: ListColumn[];
}

const LABEL_EN: ListColumn = {
  key: "label_en",
  label: "Libellé en anglais (facultatif)",
  kind: "text",
  hint: "Sans traduction, le site en anglais affiche le libellé français.",
  wide: true,
};

const SECTION: ListColumn = {
  key: "section_id",
  label: "Section",
  kind: "section",
  hint: "Laissez « Toute l'école » si cela concerne tout le monde.",
  wide: true,
};

export const LISTS: ListDefinition[] = [
  {
    name: "school-fees",
    title: "Frais de scolarité",
    description: "Les frais payés en deux tranches. Le total est calculé automatiquement.",
    itemLabel: "Ligne",
    addLabel: "Ajouter une ligne",
    columns: [
      { key: "label_fr", label: "Libellé", kind: "text", required: true, placeholder: "Primaire francophone", wide: true },
      LABEL_EN,
      SECTION,
      { key: "first_installment", label: "1re tranche", kind: "amount", required: true },
      { key: "second_installment", label: "2e tranche", kind: "amount", required: true },
    ],
  },
  {
    name: "admission-fees",
    title: "Frais et fournitures d'inscription",
    description: "Ce qui est demandé à l'inscription : un montant, ou un texte pour ce qui n'est pas de l'argent.",
    itemLabel: "Élément",
    addLabel: "Ajouter un élément",
    columns: [
      { key: "label_fr", label: "Libellé", kind: "text", required: true, placeholder: "Frais d'inscription", wide: true },
      LABEL_EN,
      SECTION,
      { key: "amount", label: "Montant", kind: "amount", hint: "Ou laissez vide et remplissez le texte ci-dessous." },
      { key: "amount_text_fr", label: "Texte à la place du montant", kind: "text", placeholder: "Deux (02) rouleaux" },
      { key: "amount_text_en", label: "Texte en anglais (facultatif)", kind: "text" },
    ],
  },
  {
    name: "required-documents",
    title: "Pièces à fournir",
    description: "Les documents demandés pour constituer le dossier d'inscription.",
    itemLabel: "Pièce",
    addLabel: "Ajouter une pièce",
    columns: [
      { key: "label_fr", label: "Pièce", kind: "text", required: true, placeholder: "Photocopie de l'acte de naissance", wide: true },
      LABEL_EN,
      SECTION,
    ],
  },
  {
    name: "transport-tariffs",
    title: "Transport scolaire",
    description: "Les tarifs du transport, selon la distance.",
    itemLabel: "Tarif",
    addLabel: "Ajouter un tarif",
    columns: [
      { key: "amount", label: "Tarif", kind: "amount", required: true },
      { key: "label_fr", label: "Description (facultatif)", kind: "text", placeholder: "Moins de 2 km" },
      { key: "label_en", label: "Description en anglais (facultatif)", kind: "text" },
    ],
  },
];

const fcfa = new Intl.NumberFormat("fr-FR");

/** "50 000 FCFA" */
export function formatFcfa(amount: number): string {
  return `${fcfa.format(amount)} FCFA`;
}
