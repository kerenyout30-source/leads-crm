// lib/constants.ts
import type { Status, Source } from './types'

export const STATUS_OPTIONS: { value: Status; label: string; color: string }[] = [
  { value: 'new',          label: 'ליד חדש',       color: 'bg-sky-900 text-sky-300' },
  { value: 'in_progress',  label: 'בטיפול',         color: 'bg-orange-950 text-orange-400' },
  { value: 'details_sent', label: 'נשלחו פרטים',   color: 'bg-violet-950 text-violet-400' },
  { value: 'closed',       label: 'נסגרה עסקה',    color: 'bg-green-950 text-green-400' },
  { value: 'not_relevant', label: 'לא רלוונטי',    color: 'bg-stone-900 text-stone-400' },
]

export const SOURCE_OPTIONS: { value: Source; label: string }[] = [
  { value: 'facebook',  label: 'פייסבוק' },
  { value: 'referral',  label: 'המלצה' },
  { value: 'outbound',  label: 'פנייה יזומה' },
  { value: 'whatsapp',  label: 'וואטסאפ' },
  { value: 'other',     label: 'אחר' },
]

export const STATUS_MAP = Object.fromEntries(
  STATUS_OPTIONS.map(s => [s.value, s])
) as Record<Status, typeof STATUS_OPTIONS[0]>

export const SOURCE_MAP = Object.fromEntries(
  SOURCE_OPTIONS.map(s => [s.value, s])
) as Record<Source, typeof SOURCE_OPTIONS[0]>
