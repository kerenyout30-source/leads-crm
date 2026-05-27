'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { LeadForm, type LeadFormValues } from './lead-form'
import { LeadTimeline } from './lead-timeline'
import { createLead, updateLead, deleteLead } from '@/actions/leads'
import { toast } from 'sonner'
import type { Lead } from '@/lib/types'
import { Trash2 } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
  lead: Lead | null
  onSaved: (lead: Lead) => void
  onDeleted: (id: string) => void
}

export function LeadDrawer({ open, onClose, lead, onSaved, onDeleted }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(values: LeadFormValues) {
    setLoading(true)
    try {
      if (lead) {
        // Track changed fields
        const changedFields = (Object.keys(values) as (keyof LeadFormValues)[])
          .filter(
            (k) =>
              String(values[k] ?? '') !== String((lead as any)[k] ?? '')
          )
          .map((k) => ({
            field: k,
            old_value: String((lead as any)[k] ?? ''),
            new_value: String(values[k] ?? ''),
          }))

        await updateLead(lead.id, values as any, changedFields)
        onSaved({ ...lead, ...values } as Lead)
        toast.success('הליד עודכן בהצלחה')
      } else {
        const created = await createLead(values as any)
        onSaved(created)
        toast.success('ליד חדש נוצר בהצלחה')
      }
    } catch (e: any) {
      toast.error('שגיאה בשמירה: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!lead) return
    if (!confirm('למחוק את הליד לצמיתות?')) return
    setLoading(true)
    try {
      await deleteLead(lead.id)
      onDeleted(lead.id)
      toast.success('הליד נמחק')
      onClose()
    } catch (e: any) {
      toast.error('שגיאה במחיקה: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto"
      >
        <SheetHeader className="mb-4">
          <SheetTitle>
            {lead ? `עריכת ליד: ${lead.name}` : 'ליד חדש'}
          </SheetTitle>
        </SheetHeader>

        {lead ? (
          <Tabs defaultValue="details">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="details" className="flex-1">
                פרטים
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex-1">
                ציר זמן
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <LeadForm
                defaultValues={lead as any}
                onSubmit={handleSubmit}
                loading={loading}
              />
              <Button
                variant="destructive"
                size="sm"
                className="w-full mt-3 gap-1"
                onClick={handleDelete}
                disabled={loading}
              >
                <Trash2 className="h-3.5 w-3.5" /> מחק ליד
              </Button>
            </TabsContent>
            <TabsContent value="timeline">
              <LeadTimeline leadId={lead.id} />
            </TabsContent>
          </Tabs>
        ) : (
          <LeadForm onSubmit={handleSubmit} loading={loading} />
        )}
      </SheetContent>
    </Sheet>
  )
}
