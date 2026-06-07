'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  async function handleSubmit(values: LeadFormValues) {
    setLoading(true)
    try {
      // Normalize form values to match Lead type (empty string -> null)
      const normalizedValues = {
        ...values,
        phone: values.phone || null,
        email: values.email || null,
        role_title: values.role_title || null,
        organization: values.organization || null,
        source: values.source || null,
        notes: values.notes || null,
        city: values.city || null,
        assigned_rep: values.assigned_rep || null,
        interest_level: values.interest_level || null,
        follow_up_date: values.follow_up_date || null,
        institution_size: values.institution_size
          ? Number(values.institution_size)
          : null,
        institution_type: values.institution_type || null,
      }

      if (lead) {
        // Track changed fields
        const changedFields = (Object.keys(values) as (keyof LeadFormValues)[])
          .filter(
            (k) =>
              String(values[k] ?? '') !== String(lead[k] ?? '')
          )
          .map((k) => ({
            field: k,
            old_value: String(lead[k] ?? ''),
            new_value: String(values[k] ?? ''),
          }))

        await updateLead(lead.id, normalizedValues, changedFields)
        onSaved({ ...lead, ...normalizedValues } as Lead)
        toast.success('הליד עודכן בהצלחה')
      } else {
        const created = await createLead(normalizedValues)
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
      setDeleteConfirmOpen(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-y-auto pr-6"
      >
        <SheetHeader className="mb-4 pr-4">
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
                disabled={loading}
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" /> מחק ליד
              </Button>
              <AlertDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>למחוק את הליד?</AlertDialogTitle>
                    <AlertDialogDescription>
                      פעולה זו לא ניתנת לביטול. הליד יימחק לצמיתות.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex gap-2 justify-end">
                    <AlertDialogCancel>בטל</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      מחק
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
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
