import { type Localized, tr } from '@/i18n/types'

export interface SchoolStat {
  value: number
  suffix: string
  label: Localized
}

// Valeurs provisoires à remplacer par les chiffres réels de l'école.
export const SCHOOL_STATS: SchoolStat[] = [
  { value: 10, suffix: '+', label: tr("Années d'expérience", 'Years of experience') },
  { value: 300, suffix: '+', label: tr('Élèves accueillis', 'Students enrolled') },
  { value: 20, suffix: '+', label: tr('Enseignants passionnés', 'Passionate teachers') },
  { value: 95, suffix: '%', label: tr('Familles satisfaites', 'Satisfied families') },
]
