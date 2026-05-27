'use client'

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createLead } from '@/actions/leads'
import { toast } from 'sonner'
import type { Lead } from '@/lib/types'

const COLUMN_MAP: Record<string, keyof Lead> = {
  'שם': 'name', 'name': 'name',
  'טלפון': 'phone', 'phone': 'phone',
  'אימייל': 'email', 'email': 'email',
  'תפקיד': 'role_title', 'role_title': 'role_title',
  'מוסד': 'organization', 'organization': 'organization',
  'הערות': 'notes', 'notes': 'notes',
}

type PreviewRow = Record<string, string>

type Props = {
  open: boolean
  onClose: () => void
  onImported: (leads: Lead[]) => void
}

export function ImportModal({ open, onClose, onImported }: Props) {
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target!.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<PreviewRow>(ws, { defval: '' })
      setHeaders(rows.length > 0 ? Object.keys(rows[0]) : [])
      setPreview(rows.slice(0, 5))
    }
    reader.readAsArrayBuffer(file)
  }

  async function handleImport() {
    if (preview.length === 0) return
    setLoading(true)

    const allRows: PreviewRow[] = []
    const file = inputRef.current?.files?.[0]
    if (!file) return

    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<PreviewRow>(ws, { defval: '' })

    const created: Lead[] = []
    for (const row of rows) {
      const mapped: any = { status: 'new' }
      for (const [col, val] of Object.entries(row)) {
        const field = COLUMN_MAP[col]
        if (field) mapped[field] = val
      }
      if (!mapped.name) continue
      try {
        const lead = await createLead(mapped)
        created.push(lead)
      } catch {}
    }

    toast.success(`יובאו ${created.length} לידים בהצלחה`)
    onImported(created)
    setPreview([])
    setHeaders([])
    setLoading(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>ייבוא לידים מ-Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            העלה קובץ CSV או XLSX. עמודות מזוהות: שם, טלפון, אימייל, תפקיד, מוסד, הערות.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFile}
            className="text-sm text-muted-foreground"
          />

          {preview.length > 0 && (
            <div className="rounded-md border border-border overflow-auto max-h-52">
              <table className="text-xs w-full">
                <thead>
                  <tr className="bg-muted/40">
                    {headers.map(h => (
                      <th key={h} className="text-right px-2 py-1 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      {headers.map(h => <td key={h} className="px-2 py-1 text-muted-foreground">{row[h]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button onClick={handleImport} disabled={preview.length === 0 || loading}>
            {loading ? 'מייבא...' : `ייבא לידים`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
