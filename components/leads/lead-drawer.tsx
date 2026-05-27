'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { Lead } from '@/lib/types'

type Props = {
  open: boolean
  onClose: () => void
  lead: Lead | null
  onSaved: (lead: Lead) => void
  onDeleted: (id: string) => void
}

export function LeadDrawer({ open, onClose }: Props) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-96">
        <SheetHeader>
          <SheetTitle>פרטי ליד</SheetTitle>
        </SheetHeader>
        <div className="text-muted-foreground text-sm p-4">
          תופס מקום — ראה Task 9
        </div>
      </SheetContent>
    </Sheet>
  )
}
