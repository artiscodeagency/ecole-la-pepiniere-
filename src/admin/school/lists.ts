export type ListName =
  | "school-fees"
  | "admission-fees"
  | "required-documents"
  | "transport-tariffs"
  | "faq"
  | "staff"
  | "school-levels";

export type ListItem = { id: number } & Record<string, string | number | boolean | null>;

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
  /** "amount" is whole FCFA; "section" is a choice of school section (required: no "whole school"). */
  kind: "text" | "textarea" | "amount" | "section" | "checkbox";
  required?: boolean;
  placeholder?: string;
  hint?: string;
  /** Takes the full width of the row. */
  wide?: boolean;
}

export interface ListDefinition {
  name: ListName;
  /** The tab of the school information page that shows this list. */
  tab: "frais" | "general";
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
    tab: "frais",
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
    tab: "frais",
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
    tab: "frais",
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
    tab: "frais",
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
  {
    name: "school-levels",
    tab: "general",
    title: "Niveaux (classes)",
    description:
      "Les classes proposées dans le formulaire d'inscription du site. Une section sans niveau n'en propose pas : la famille indique alors simplement la section.",
    itemLabel: "Niveau",
    addLabel: "Ajouter un niveau",
    columns: [
      { key: "section_id", label: "Section", kind: "section", required: true, wide: true },
      { key: "name_fr", label: "Nom du niveau", kind: "text", required: true, placeholder: "Class 1" },
      { key: "name_en", label: "Nom en anglais (facultatif)", kind: "text" },
      {
        key: "is_active",
        label: "Proposé dans le formulaire d'inscription",
        kind: "checkbox",
        hint: "Décochez pour ne plus le proposer sans le supprimer.",
        wide: true,
      },
    ],
  },
  {
    name: "staff",
    tab: "general",
    title: "Équipe de direction",
    description: "Les membres de la direction présentés sur le site.",
    itemLabel: "Membre",
    addLabel: "Ajouter un membre",
    columns: [
      { key: "name", label: "Nom", kind: "text", required: true, placeholder: "Madame …", wide: true },
      { key: "role_fr", label: "Fonction", kind: "text", required: true, placeholder: "Directrice section anglophone" },
      { key: "role_en", label: "Fonction en anglais (facultatif)", kind: "text" },
      { key: "is_visible", label: "Visible sur le site", kind: "checkbox", wide: true },
    ],
  },
  {
    name: "faq",
    tab: "general",
    title: "Questions fréquentes",
    description: "Les questions et réponses affichées sur le site.",
    itemLabel: "Question",
    addLabel: "Ajouter une question",
    columns: [
      { key: "question_fr", label: "Question", kind: "text", required: true, wide: true },
      { key: "answer_fr", label: "Réponse", kind: "textarea", required: true, wide: true },
      { key: "question_en", label: "Question en anglais (facultatif)", kind: "text", wide: true },
      {
        key: "answer_en",
        label: "Réponse en anglais (facultatif)",
        kind: "textarea",
        hint: "Sans traduction, le site en anglais affiche la version française.",
        wide: true,
      },
      { key: "is_visible", label: "Visible sur le site", kind: "checkbox", wide: true },
    ],
  },
];

const fcfa = new Intl.NumberFormat("fr-FR");

/** "50 000 FCFA" */
export function formatFcfa(amount: number): string {
  return `${fcfa.format(amount)} FCFA`;
}
