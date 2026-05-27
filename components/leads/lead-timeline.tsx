'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { STATUS_MAP } from '@/lib/constants'
import type { LeadActivity } from '@/lib/types'

const TYPE_LABELS: Record<string, string> = {
  lead_created: 'ליד נוצר',
  status_change: 'שינוי סטטוס',
  field_updated: 'עדכון שדה',
  note_added: 'הערה נוספה',
}

const FIELD_LABELS: Record<string, string> = {
  name: 'שם',
  phone: 'טלפון',
  email: 'אימייל',
  role_title: 'תפקיד',
  organization: 'מוסד',
  status: 'סטטוס',
  source: 'מקור',
  notes: 'הערות',
}

export function LeadTimeline({ leadId }: { leadId: string }) {
  const [activities, setActivities] = useState<LeadActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('lead_activities')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setActivities(data ?? [])
        setLoading(false)
      })
  }, [leadId])

  if (loading) return <p className="text-sm text-muted-foreground">טוען...</p>
  if (activities.length === 0) return <p className="text-sm text-muted-foreground">אין פעילות עדיין</p>

  return (
    <ol className="relative border-r border-border space-y-4 pr-4">
      {activities.map((a) => (
        <li key={a.id} className="relative">
          <div className="absolute -right-2 top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
          <p className="text-xs text-muted-foreground">
            {new Date(a.created_at).toLocaleString('he-IL')}
          </p>
          <p className="text-sm font-medium">
            {TYPE_LABELS[a.type] ?? a.type}
          </p>
          {a.type === 'status_change' && (
            <p className="text-xs text-muted-foreground">
              {STATUS_MAP[a.payload.old_value as keyof typeof STATUS_MAP]?.label ?? a.payload.old_value}
              {' → '}
              {STATUS_MAP[a.payload.new_value as keyof typeof STATUS_MAP]?.label ?? a.payload.new_value}
            </p>
          )}
          {a.type === 'field_updated' && a.payload.field !== 'status' && (
            <p className="text-xs text-muted-foreground">
              {FIELD_LABELS[a.payload.field!] ?? a.payload.field}:
              {' '}
              {a.payload.old_value || '—'} → {a.payload.new_value || '—'}
            </p>
          )}
        </li>
      ))}
    </ol>
  )
}
