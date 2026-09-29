const imageModules = import.meta.glob("../assets/*.{jpg,jpeg,png}", {
  eager: true,
  query: "?url",
  import: "default",
});

const excludedFiles = new Set(["hero.png", "logo-transparent.png"]);

export const schoolImages = Object.entries(imageModules)
  .map(([path, src]) => {
    const fileName = path.split("/").pop() ?? path;

    if (excludedFiles.has(fileName)) {
      return null;
    }

    return { src, name: fileName };
  })
  .filter((photo): photo is { src: string; name: string } => Boolean(photo))
  .sort((a, b) => a.name.localeCompare(b.name));

const GALLERY_IMAGE_PREFIXES = [
  ["school-building"],
  ["teacher-in-classroom", "teacher-on-the-board", "teacher-onthe-board", "teacher-in-class", "child-in-class"],
  ["teacher-teaching-little-children-in-class", "teacher-in-class-with-little-children", "teacher-with-little-children-in-class", "teacher-teaching-little-children", "little-children-in-class", "little-child-in-class"],
  ["little-children-on-ballansoir", "children-playing-outside", "little-children-outside", "little-child-in-class-playing"],
  [],
  [],
  [],
  [],
  ["children-infront-school", "children-pointing-at-schoool", "children-poiting-at-school"],
  ["school-panel-with-children", "teacher-photo-group-with-little-children", "teachers-outside-class-seated", "teacher-photo-with-children"],
];

const usedImageSources = new Set<string>();

function reserveImage(image?: { src: string; name: string }) {
  if (!image) return undefined;

  if (usedImageSources.has(image.src)) {
    const replacement = schoolImages.find((candidate) => !usedImageSources.has(candidate.src));
    if (!replacement) {
      usedImageSources.clear();
      usedImageSources.add(image.src);
      return image;
    }
    usedImageSources.add(replacement.src);
    return replacement;
  }

  usedImageSources.add(image.src);
  return image;
}

function findByPrefix(prefixes: string[], variant = 0) {
  const candidates = schoolImages.filter((image) =>
    prefixes.some((prefix) => image.name.toLowerCase().includes(prefix)),
  );

  if (candidates.length === 0) {
    return undefined;
  }

  const rotated = [...candidates.slice(variant % candidates.length), ...candidates.slice(0, variant % candidates.length)];
  const firstAvailable = rotated.find((image) => !usedImageSources.has(image.src));
  if (firstAvailable) {
    return reserveImage(firstAvailable);
  }

  const fallback = schoolImages.find((image) => !usedImageSources.has(image.src));
  if (fallback) {
    return reserveImage(fallback);
  }

  usedImageSources.clear();
  return reserveImage(candidates[0]);
}

export function getGalleryImage(categoryIndex: number, variant = 0) {
  return findByPrefix(GALLERY_IMAGE_PREFIXES[categoryIndex] ?? [], variant);
}

const GENERIC_FALLBACKS = [
  "school-panel-with-children",
  "teacher-photo-with-children",
  "teacher-in-classroom",
  "teacher-on-the-board",
  "teacher-onthe-board",
  "little-children-in-class",
  "little-child-in-class",
  "children-playing-outise",
  "children-outside",
  "children-infront-school-intrance",
];

export function getImageForTitle(title?: string) {
  if (!title) return undefined;

  const normalizedTitle = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const has = (...terms: string[]) =>
    terms.some((term) => normalizedTitle.includes(term));

  if (has("direction", "management", "administrator", "office")) {
    return findByPrefix(["administrator-in-office"]);
  }

  const isNursery = has("maternelle", "nursery", "little child", "little-children", "tout-petit", "petite enfance");
  if (isNursery) {
    if (has("sleep", "bed", "sieste", "dormir", "rest")) {
      return findByPrefix(["little-children-sleeping-on-bed", "bed-for-little-children"]);
    }
    if (has("eat", "repas", "lunch", "food", "manger")) {
      return findByPrefix(["little-child-eating-in-class"]);
    }
    if (has("play", "jeu", "jouer", "outside", "outdoor", "dehors", "balan")) {
      return findByPrefix(["little-children-on-ballansoir", "little-children-outside", "little-child-in-class-playing"]);
    }
    if (has("class", "classe", "salle", "teacher", "enseignant", "apprentissage", "learning")) {
      return findByPrefix(["teacher-teaching-little-children-in-class", "teacher-in-class-with-little-children", "teacher-with-little-children-in-class", "teacher-teaching-little-children", "little-children-in-class", "little-child-in-class"]);
    }
    return findByPrefix(["teacher-photo-group-with-little-children", "teacher-photo-with-children", "little-children-in-class", "little-child-in-class"]);
  }

  if (has("school building", "building", "batiment", "facade", "entrance", "intrance", "ecole", "campus")) {
    return findByPrefix(["school-building", "school-panel-with-children"]);
  }

  if (has("computer", "informatique", "numerique", "digital", "screen", "reading", "lecture")) {
    return findByPrefix(["teacher-in-classroom", "teacher-on-the-board", "school-panel-with-children", "child-in-class"]);
  }

  if (has("sport", "athlet", "physique", "fitness", "gym", "football", "basket", "foot", "swim", "run")) {
    return findByPrefix(["children-playing-outise", "children-outside", "little-children-outside", "little-children-on-ballansoir"]);
  }

  if (has("culture", "artistique", "creative", "art", "music", "festival", "celebration", "fete", "event")) {
    return findByPrefix(["teacher-photo-with-children", "school-panel-with-children", "teachers-outside-class-seated"]);
  }

  if (has("excursion", "trip", "sortie", "visit", "outing", "field", "travel")) {
    return findByPrefix(["children-infront-school-intrance", "children-pointing-at-schoool-intrance", "children-poiting-at-school-intrance", "teacher-photo-with-children"]);
  }

  if (has("class", "classe", "classroom", "salle", "board", "teacher", "enseignant", "apprentissage", "learning")) {
    return findByPrefix(["teacher-in-classroom", "teacher-on-the-board", "teacher-onthe-board", "teacher-in-class", "child-in-class", "children-outside-class"]);
  }

  if (has("play", "jeu", "jouer", "outside", "outdoor", "dehors", "balan")) {
    return findByPrefix(["children-playing-outise", "children-outside", "little-children-outside", "little-children-on-ballansoir"]);
  }

  if (has("school event", "evenement", "celebration", "fete", "group", "team", "school life", "vie scolaire")) {
    return findByPrefix(["school-panel-with-children", "teacher-photo-with-children", "teachers-outside-class-seated"]);
  }

  if (has("child", "children", "enfant", "eleve", "student", "pupil")) {
    if (has("child", "enfant") && !has("children", "enfants", "students", "eleves", "pupils")) {
      return findByPrefix(["child-in-class", "a-child-seated", "child-giving-a-tump-up"]);
    }
    return findByPrefix(["teacher-photo-with-children", "children-outside", "children-infront-school-intrance", "childre-outside-class"]);
  }

  return findByPrefix(GENERIC_FALLBACKS);
}
