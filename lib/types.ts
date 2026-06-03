// lib/types.ts
export type Status =
  | 'new'
  | 'in_progress'
  | 'details_sent'
  | 'closed'
  | 'not_relevant'

export type Source =
  | 'facebook'
  | 'referral'
  | 'outbound'
  | 'whatsapp'
  | 'field_agent'
  | 'other'

export type InterestLevel = 'high' | 'medium' | 'low'

export type AssignedRep = 'yuval' | 'efi' | 'keren' | 'alona'

export type InstitutionType = 'elementary' | 'middle' | 'high'

export type Lead = {
  id: string
  created_at: string
  name: string
  phone: string | null
  email: string | null
  role_title: string | null
  organization: string | null
  status: Status
  source: Source | null
  notes: string | null
  user_id: string
  city: string | null
  assigned_rep: AssignedRep | null
  interest_level: InterestLevel | null
  follow_up_date: string | null
  institution_size: number | null
  institution_type: InstitutionType | null
}

export type LeadActivity = {
  id: string
  created_at: string
  lead_id: string
  user_id: string
  type: 'status_change' | 'note_added' | 'field_updated' | 'lead_created'
  payload: {
    field?: string
    old_value?: string
    new_value?: string
    note?: string
  }
}
