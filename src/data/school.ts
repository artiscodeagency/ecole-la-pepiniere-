import type { Lang } from "@/i18n/types";

const SCHOOL_FR = {
  name: "Groupe Scolaire Privé Bilingue « LA PÉPINIÈRE »",
  shortName: "La Pépinière",
  type: "Établissement scolaire privé bilingue",
  motto: "Discipline – Travail – Succès",
  slogan: "LA PÉPINIÈRE, UNE AUTRE VISION DE L'ÉDUCATION BILINGUE",
  logoPath: "/logo.png",
  location: {
    address: "BP 319, Bertoua Mokolo I (Sembé), à côté de Talma Hôtel",
    city: "Bertoua",
    country: "Cameroun",
  },
  history: {
    foundedOn: "13 janvier 2012",
    openedIn: "2012",
  },
  vision:
    "Offrir aux enfants une éducation bilingue de qualité, dans un environnement propice à leur épanouissement, à leur discipline et à leur réussite.",
  mission: [
    "Développer les connaissances des enfants dès le bas âge.",
    "Développer leur autonomie.",
    "Développer leur créativité.",
    "Développer leur sens des responsabilités.",
    "Favoriser leur maîtrise du français et de l'anglais.",
  ],
  values: [
    "Discipline",
    "Travail",
    "Succès",
    "Respect",
    "Responsabilité",
    "Excellence",
  ],
  sections: ["Maternelle", "Primaire francophone", "Primaire anglophone"],
  hours: {
    kindergarten: {
      mondayToThursday: "7h30 – 13h30",
      friday: "7h30 – 12h00",
    },
    primary: {
      mondayToThursday: "7h30 – 15h30",
      friday: "7h30 – 12h30",
    },
  },
  kindergarten: {
    activities: [
      "Activités d'éveil",
      "Activités artistiques et manuelles",
      "Activités sportives",
      "Jeux éducatifs",
      "Activités de découverte",
    ],
  },
  primary: {
    pathways: [
      {
        title: "Primaire francophone",
        language: "Enseignement en français",
        description: "Selon le programme scolaire applicable.",
      },
      {
        title: "Primaire anglophone",
        language: "Teaching in English",
        description: "According to the applicable school curriculum.",
      },
    ],
  },
  schoolLife: {
    facilities: [
      "Salles de classe",
      "Salle informatique",
      "Petite infirmerie",
      "Aire de jeux",
      "Piscine gonflable",
      "Espace d'activités",
      "Transport scolaire",
    ],
    activities: [
      "Club cuisine",
      "Club agriculture",
      "Activités musicales",
      "Activités sportives",
      "Excursions",
      "Journées portes ouvertes",
      "Activités culturelles",
      "Activités de découverte",
    ],
  },
  gallery: {
    categories: [
      "Bâtiments",
      "Salles de classe",
      "Maternelle",
      "Espaces de jeux",
      "Salle informatique",
      "Activités sportives",
      "Activités culturelles",
      "Excursions",
      "Journées portes ouvertes",
      "Événements de l'école",
    ],
  },
  news: {
    categories: [
      "Informations de rentrée",
      "Communiqués de la direction",
      "Journées portes ouvertes",
      "Excursions",
      "Activités sportives",
      "Activités culturelles",
      "Activités musicales",
      "Activités agricoles",
      "Activités culinaires",
      "Événements scolaires",
      "Informations destinées aux parents",
      "Fêtes scolaires et remises des prix",
    ],
  },
  contacts: {
    // Two official lists were supplied and must be confirmed before publication.
    phoneListA: ["694 797 162", "694 090 919", "696 205 041"],
    phoneListB: ["694 510 312", "694 090 919", "694 707 162", "678 010 480"],
    whatsapp: ["694 090 919", "696 205 041"],
    // Number shown on the home page (present in both official lists and WhatsApp).
    mainPhone: "694 090 919",
    email: "[Adresse email à confirmer]",
  },
  transport: {
    description: "Transport scolaire selon la distance.",
    tariffs: ["7 000 FCFA", "9 000 FCFA", "12 000 FCFA"],
  },
  admissions: {
    academicYear: "2026–2027",
    documents: [
      "Photocopie de l'acte de naissance",
      "Deux (02) photos 4 × 4",
      "Bulletin ou travaux (maternelle) pour l'année scolaire écoulée",
      "Certificat médical (maternelle)",
    ],
    fees: {
      registration: "10 000 FCFA",
      reportBook: "1 500 FCFA",
      kindergartenBadge: "1 500 FCFA",
      kindergartenSupplies: "12 000 FCFA",
      toiletPaper: "Deux (02) rouleaux",
    },
    schoolFees: [
      {
        section: "Primaire francophone",
        firstInstallment: "50 000 FCFA",
        secondInstallment: "30 000 FCFA",
        total: "80 000 FCFA",
      },
      {
        section: "Primaire anglophone",
        firstInstallment: "50 000 FCFA",
        secondInstallment: "35 000 FCFA",
        total: "85 000 FCFA",
      },
      {
        section: "Maternelles",
        firstInstallment: "50 000 FCFA",
        secondInstallment: "40 000 FCFA",
        total: "90 000 FCFA",
      },
      {
        section: "Pré-maternelle",
        firstInstallment: "70 000 FCFA",
        secondInstallment: "40 000 FCFA",
        total: "110 000 FCFA",
      },
    ],
    installmentDates: {
      first: "04 septembre 2026",
      second: "01 novembre 2026",
    },
    uniforms: [
      "Tenue de classe",
      "Tenue de cérémonie",
      "Tenue de sport",
      "Pull-over",
    ],
    uniformNote: "Modèle disponible à l'école.",
    withdrawalCondition:
      "La démission ne donne droit à aucun remboursement ou quelconque transaction.",
    payment: {
      bank: "Afriland First Bank",
      account: "06130831001 – 42",
    },
    faq: [
      [
        "À partir de quel âge peut-on inscrire un enfant ?",
        "L'âge d'admission et les conditions associées seront confirmés par l'administration selon la classe demandée.",
      ],
      [
        "Quelles classes sont proposées ?",
        "La Pépinière accueille les enfants de la maternelle au primaire. Les niveaux disponibles sont à confirmer pour chaque rentrée.",
      ],
      [
        "Quels documents faut-il fournir ?",
        "La liste officielle pour la rentrée 2026–2027 est affichée sur cette page.",
      ],
      [
        "Peut-on visiter l'école avant l'inscription ?",
        "Une visite peut être organisée selon les disponibilités de l'équipe. Contactez l'école pour préparer ce rendez-vous.",
      ],
      [
        "Quels sont les horaires ?",
        "Les horaires de la maternelle et du primaire sont disponibles sur les pages de chaque section.",
      ],
      [
        "Comment connaître les frais de scolarité ?",
        "Les frais communiqués pour la rentrée 2026–2027 sont affichés sur la page Admissions.",
      ],
    ],
  },
  administration: [
    { role: "Fondateur", name: "Monsieur Simon Pierre NGUEPIE" },
    { role: "Directrice maternelle", name: "Madame FOKENG SORELLE ASTRIDE" },
    { role: "Directeur section francophone", name: "Monsieur SANDA VICTOR" },
    { role: "Directrice section anglophone", name: "Madame NDI FAITH YEYO" },
    { role: "Coordinatrice", name: "Madame MEGUEU KAMDEM BRIGITTE FLOR" },
    { role: "Conseillère", name: "Madame MELEUDJIE HENRIETTE" },
  ],
  documents: {
    internalRules:
      "Règlement intérieur officiel — document fourni, contenu à intégrer dans Vie scolaire.",
    schoolCalendar: "Calendrier scolaire officiel — document à intégrer.",
  },
};

export type School = typeof SCHOOL_FR;

const SCHOOL_EN: School = {
  name: "“LA PÉPINIÈRE” Bilingual Private School Group",
  shortName: "La Pépinière",
  type: "Bilingual private school",
  motto: "Discipline – Hard Work – Success",
  slogan: "LA PÉPINIÈRE, A DIFFERENT VISION OF BILINGUAL EDUCATION",
  logoPath: SCHOOL_FR.logoPath,
  location: {
    address: "PO Box 319, Bertoua Mokolo I (Sembé), next to Talma Hôtel",
    city: "Bertoua",
    country: "Cameroon",
  },
  history: {
    foundedOn: "13 January 2012",
    openedIn: "2012",
  },
  vision:
    "To offer children a quality bilingual education in an environment that supports their personal growth, discipline and success.",
  mission: [
    "Develop children's knowledge from an early age.",
    "Develop their independence.",
    "Develop their creativity.",
    "Develop their sense of responsibility.",
    "Foster their command of French and English.",
  ],
  values: [
    "Discipline",
    "Hard work",
    "Success",
    "Respect",
    "Responsibility",
    "Excellence",
  ],
  sections: ["Nursery", "French-speaking primary", "English-speaking primary"],
  hours: {
    kindergarten: {
      mondayToThursday: "7:30 AM – 1:30 PM",
      friday: "7:30 AM – 12:00 PM",
    },
    primary: {
      mondayToThursday: "7:30 AM – 3:30 PM",
      friday: "7:30 AM – 12:30 PM",
    },
  },
  kindergarten: {
    activities: [
      "Early-learning activities",
      "Arts and crafts",
      "Sports activities",
      "Educational games",
      "Discovery activities",
    ],
  },
  primary: {
    pathways: [
      {
        title: "French-speaking primary",
        language: "Teaching in French",
        description: "According to the applicable school curriculum.",
      },
      {
        title: "English-speaking primary",
        language: "Teaching in English",
        description: "According to the applicable school curriculum.",
      },
    ],
  },
  schoolLife: {
    facilities: [
      "Classrooms",
      "Computer room",
      "Small infirmary",
      "Playground",
      "Inflatable pool",
      "Activity area",
      "School transport",
    ],
    activities: [
      "Cooking club",
      "Agriculture club",
      "Music activities",
      "Sports activities",
      "Excursions",
      "Open days",
      "Cultural activities",
      "Discovery activities",
    ],
  },
  gallery: {
    categories: [
      "Buildings",
      "Classrooms",
      "Nursery",
      "Play areas",
      "Computer room",
      "Sports activities",
      "Cultural activities",
      "Excursions",
      "Open days",
      "School events",
    ],
  },
  news: {
    categories: [
      "Back-to-school information",
      "Announcements from the management",
      "Open days",
      "Excursions",
      "Sports activities",
      "Cultural activities",
      "Music activities",
      "Agricultural activities",
      "Cooking activities",
      "School events",
      "Information for parents",
      "School celebrations and prize-giving ceremonies",
    ],
  },
  contacts: {
    phoneListA: SCHOOL_FR.contacts.phoneListA,
    phoneListB: SCHOOL_FR.contacts.phoneListB,
    whatsapp: SCHOOL_FR.contacts.whatsapp,
    mainPhone: SCHOOL_FR.contacts.mainPhone,
    email: "[Email address to be confirmed]",
  },
  transport: {
    description: "School transport, priced according to distance.",
    tariffs: ["7,000 FCFA", "9,000 FCFA", "12,000 FCFA"],
  },
  admissions: {
    academicYear: "2026–2027",
    documents: [
      "Photocopy of the birth certificate",
      "Two (02) 4 × 4 photos",
      "Report card or work samples (nursery) from the previous school year",
      "Medical certificate (nursery)",
    ],
    fees: {
      registration: "10,000 FCFA",
      reportBook: "1,500 FCFA",
      kindergartenBadge: "1,500 FCFA",
      kindergartenSupplies: "12,000 FCFA",
      toiletPaper: "Two (02) rolls",
    },
    schoolFees: [
      {
        section: "French-speaking primary",
        firstInstallment: "50,000 FCFA",
        secondInstallment: "30,000 FCFA",
        total: "80,000 FCFA",
      },
      {
        section: "English-speaking primary",
        firstInstallment: "50,000 FCFA",
        secondInstallment: "35,000 FCFA",
        total: "85,000 FCFA",
      },
      {
        section: "Nursery classes",
        firstInstallment: "50,000 FCFA",
        secondInstallment: "40,000 FCFA",
        total: "90,000 FCFA",
      },
      {
        section: "Pre-nursery",
        firstInstallment: "70,000 FCFA",
        secondInstallment: "40,000 FCFA",
        total: "110,000 FCFA",
      },
    ],
    installmentDates: {
      first: "4 September 2026",
      second: "1 November 2026",
    },
    uniforms: [
      "Class uniform",
      "Ceremonial uniform",
      "Sports uniform",
      "Pullover",
    ],
    uniformNote: "A sample is available at the school.",
    withdrawalCondition:
      "Withdrawal does not entitle the family to any refund or transaction of any kind.",
    payment: SCHOOL_FR.admissions.payment,
    faq: [
      [
        "From what age can a child be enrolled?",
        "The admission age and related conditions will be confirmed by the administration depending on the class requested.",
      ],
      [
        "Which classes are offered?",
        "La Pépinière welcomes children from nursery to primary school. The available levels are to be confirmed for each new school year.",
      ],
      [
        "Which documents must be provided?",
        "The official list for the 2026–2027 school year is shown on this page.",
      ],
      [
        "Can we visit the school before enrolling?",
        "A visit can be arranged depending on the team's availability. Contact the school to plan this appointment.",
      ],
      [
        "What are the school hours?",
        "Nursery and primary school hours are available on the page of each section.",
      ],
      [
        "How can I find out about the school fees?",
        "The fees announced for the 2026–2027 school year are shown on the Admissions page.",
      ],
    ],
  },
  administration: [
    { role: "Founder", name: "Monsieur Simon Pierre NGUEPIE" },
    { role: "Head of Nursery", name: "Madame FOKENG SORELLE ASTRIDE" },
    { role: "Head of the French-speaking section", name: "Monsieur SANDA VICTOR" },
    { role: "Head of the English-speaking section", name: "Madame NDI FAITH YEYO" },
    { role: "Coordinator", name: "Madame MEGUEU KAMDEM BRIGITTE FLOR" },
    { role: "Counsellor", name: "Madame MELEUDJIE HENRIETTE" },
  ],
  documents: {
    internalRules:
      "Official internal regulations — document provided, content to be added to School life.",
    schoolCalendar: "Official school calendar — document to be added.",
  },
};

/** School content in every supported language. Read it with `useSchool()`. */
export const SCHOOL: Record<Lang, School> = {
  fr: SCHOOL_FR,
  en: SCHOOL_EN,
};
