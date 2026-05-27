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
  | 'other'

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
