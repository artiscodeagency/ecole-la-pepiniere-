export interface SchoolStat {
  value: number
  suffix: string
  label: string
}

// Valeurs provisoires à remplacer par les chiffres réels de l'école.
export const SCHOOL_STATS: SchoolStat[] = [
  { value: 10, suffix: '+', label: "Années d'expérience" },
  { value: 300, suffix: '+', label: 'Élèves accueillis' },
  { value: 20, suffix: '+', label: 'Enseignants passionnés' },
  { value: 95, suffix: '%', label: 'Familles satisfaites' },
]
