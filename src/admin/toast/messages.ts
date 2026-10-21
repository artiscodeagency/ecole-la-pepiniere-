/** A kind of content, to word its notices ("Actualité publiée", "Événement annulé"). */
export interface ContentNoun {
  /** "Actualité" */
  name: string;
  feminine: boolean;
}

export const NOUNS = {
  news: { name: "Actualité", feminine: true },
  announcement: { name: "Annonce", feminine: true },
  event: { name: "Événement", feminine: false },
  document: { name: "Document", feminine: false },
} satisfies Record<string, ContentNoun>;

const agree = (noun: ContentNoun, word: string) => `${noun.name} ${word}${noun.feminine ? "e" : ""}`;

/** Notice after saving content, from the status chosen in the form. */
export function savedMessage(noun: ContentNoun, status: string | undefined, isNew: boolean) {
  switch (status) {
    case "published":
      return agree(noun, "publié");
    case "draft":
      return isNew ? "Brouillon créé" : "Brouillon enregistré";
    case "archived":
      return agree(noun, "archivé");
    case "cancelled":
      return agree(noun, "annulé");
    default:
      return agree(noun, isNew ? "créé" : "enregistré");
  }
}

export const deletedMessage = (noun: ContentNoun) => `${agree(noun, "supprimé")} (récupérable dans la corbeille)`;

export const restoredMessage = (noun: ContentNoun) => agree(noun, "restauré");
