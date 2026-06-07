// lib/constants.ts
import type { Status, Source, InterestLevel, AssignedRep, InstitutionType } from './types'

export const STATUS_OPTIONS: { value: Status; label: string; color: string }[] = [
  { value: 'new',          label: 'ליד חדש',       color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300' },
  { value: 'in_progress',  label: 'בטיפול',         color: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400' },
  { value: 'details_sent', label: 'נשלחו פרטים',   color: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-400' },
  { value: 'closed',       label: 'נסגרה עסקה',    color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400' },
  { value: 'not_relevant', label: 'לא רלוונטי',    color: 'bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-400' },
]

export const SOURCE_OPTIONS: { value: Source; label: string }[] = [
  { value: 'facebook',    label: 'פייסבוק' },
  { value: 'referral',    label: 'המלצה' },
  { value: 'outbound',    label: 'פנייה יזומה' },
  { value: 'whatsapp',    label: 'וואטסאפ' },
  { value: 'field_agent', label: 'סוכנת שטח' },
  { value: 'other',       label: 'אחר' },
]

export const INTEREST_LEVEL_OPTIONS: { value: InterestLevel; label: string; color: string }[] = [
  { value: 'high',   label: 'גבוהה',   color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400' },
  { value: 'medium', label: 'בינונית', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400' },
  { value: 'low',    label: 'נמוכה',   color: 'bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-400' },
]

export const ASSIGNED_REP_OPTIONS: { value: AssignedRep; label: string }[] = [
  { value: 'yuval', label: 'יובל' },
  { value: 'Effi', label: 'אפי' },
  { value: 'keren', label: 'קרן' },
  { value: 'alona', label: 'אלונה' },
]

export const INSTITUTION_TYPE_OPTIONS: { value: InstitutionType; label: string }[] = [
  { value: 'elementary', label: 'יסודי' },
  { value: 'middle',     label: 'חטיבה' },
  { value: 'high',       label: 'תיכון' },
]

export const STATUS_MAP = Object.fromEntries(
  STATUS_OPTIONS.map(s => [s.value, s])
) as Record<Status, typeof STATUS_OPTIONS[0]>

export const SOURCE_MAP = Object.fromEntries(
  SOURCE_OPTIONS.map(s => [s.value, s])
) as Record<Source, { value: Source; label: string }>

export const INTEREST_LEVEL_MAP = Object.fromEntries(
  INTEREST_LEVEL_OPTIONS.map(o => [o.value, o])
) as Record<InterestLevel, typeof INTEREST_LEVEL_OPTIONS[0]>

export const ASSIGNED_REP_MAP = Object.fromEntries(
  ASSIGNED_REP_OPTIONS.map(o => [o.value, o])
) as Record<AssignedRep, typeof ASSIGNED_REP_OPTIONS[0]>

export const INSTITUTION_TYPE_MAP = Object.fromEntries(
  INSTITUTION_TYPE_OPTIONS.map(o => [o.value, o])
) as Record<InstitutionType, typeof INSTITUTION_TYPE_OPTIONS[0]>
