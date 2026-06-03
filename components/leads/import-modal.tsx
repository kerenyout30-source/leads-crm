'use client'

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createLead } from '@/actions/leads'
import { toast } from 'sonner'
import { Download, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { Lead, InterestLevel, AssignedRep, InstitutionType } from '@/lib/types'
import { ASSIGNED_REP_OPTIONS, INTEREST_LEVEL_OPTIONS, INSTITUTION_TYPE_OPTIONS } from '@/lib/constants'

type LeadField =
  | 'name'
  | 'phone'
  | 'email'
  | 'role_title'
  | 'organization'
  | 'notes'
  | 'city'
  | 'assigned_rep'
  | 'interest_level'
  | 'follow_up_date'
  | 'institution_size'
  | 'institution_type'

const FIELD_LABELS: Record<LeadField, string> = {
  name: 'שם',
  phone: 'טלפון',
  email: 'אימייל',
  role_title: 'תפקיד',
  organization: 'מוסד',
  notes: 'הערות',
  city: 'עיר',
  assigned_rep: 'נציג מטפל',
  interest_level: 'רמת עניין',
  follow_up_date: 'תאריך לחזור',
  institution_size: 'גודל המוסד',
  institution_type: 'סוג מוסד',
}

const COLUMN_VARIATIONS: Record<LeadField, string[]> = {
  name: ['שם', 'שם מלא', 'שם הליד', 'שם פרטי', 'שם איש קשר', 'name', 'full name', 'fullname', 'contact name', 'lead name'],
  phone: ['טלפון', 'נייד', 'מספר טלפון', 'פלאפון', 'פל', "ט'", 'phone', 'mobile', 'telephone', 'tel', 'phone number'],
  email: ['אימייל', 'מייל', 'דוא"ל', 'דואל', 'דואר אלקטרוני', 'email', 'e-mail', 'mail', 'email address'],
  role_title: ['תפקיד', 'משרה', 'role', 'title', 'position', 'job', 'job title'],
  organization: ['מוסד', 'ארגון', 'חברה', 'מקום עבודה', 'בית ספר', 'עירייה', 'מועצה', 'organization', 'company', 'org', 'workplace', 'school'],
  notes: ['הערות', 'הערה', 'תיאור', 'הסבר', 'notes', 'note', 'description', 'comments', 'remarks'],
  city: ['עיר', 'יישוב', 'ישוב', 'city', 'town', 'location'],
  assigned_rep: ['נציג', 'נציג מטפל', 'מטפל', 'rep', 'assigned', 'representative', 'owner'],
  interest_level: ['רמת עניין', 'עניין', 'רמה', 'interest', 'interest level', 'priority', 'level'],
  follow_up_date: ['תאריך לחזור', 'תאריך מעקב', 'תאריך חזרה', 'חזרה', 'follow up', 'followup', 'follow_up_date', 'next contact'],
  institution_size: ['גודל המוסד', 'גודל', 'מספר תלמידים', 'תלמידים', 'size', 'institution size', 'students'],
  institution_type: ['סוג מוסד', 'סוג', 'רמת מוסד', 'סוג בית ספר', 'institution type', 'school type', 'type', 'level'],
}

function detectField(columnName: string): LeadField | null {
  const normalized = columnName.trim().toLowerCase()
  for (const [field, variations] of Object.entries(COLUMN_VARIATIONS) as [LeadField, string[]][]) {
    if (variations.some(v => v.toLowerCase() === normalized)) {
      return field
    }
  }
  return null
}

function parseInterestLevel(val: string): InterestLevel | null {
  const v = val.trim().toLowerCase()
  // Match by label
  for (const opt of INTEREST_LEVEL_OPTIONS) {
    if (opt.label === val.trim() || opt.value === v) return opt.value
  }
  // Also accept English variants
  if (['high', 'גבוהה', 'גבוה'].includes(v)) return 'high'
  if (['medium', 'med', 'בינונית', 'בינוני'].includes(v)) return 'medium'
  if (['low', 'נמוכה', 'נמוך'].includes(v)) return 'low'
  return null
}

function parseAssignedRep(val: string): AssignedRep | null {
  const v = val.trim().toLowerCase()
  for (const opt of ASSIGNED_REP_OPTIONS) {
    if (opt.label === val.trim() || opt.value === v) return opt.value
  }
  return null
}

function parseInstitutionType(val: string): InstitutionType | null {
  const v = val.trim().toLowerCase()
  for (const opt of INSTITUTION_TYPE_OPTIONS) {
    if (opt.label === val.trim() || opt.value === v) return opt.value
  }
  // Hebrew + English variants
  if (['elementary', 'יסודי', 'יסוד', 'primary'].includes(v)) return 'elementary'
  if (['middle', 'חטיבה', 'חט"ב', 'middle school'].includes(v)) return 'middle'
  if (['high', 'תיכון', 'high school'].includes(v)) return 'high'
  return null
}

function parseDate(val: string): string | null {
  const trimmed = val.trim()
  if (!trimmed) return null
  // Try Excel serial date numeric
  const num = Number(trimmed)
  if (!isNaN(num) && num > 10000 && num < 100000) {
    // Excel serial date (days since 1900-01-01)
    const date = new Date(Math.round((num - 25569) * 86400 * 1000))
    if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10)
  }
  // Try parsing as date string
  const date = new Date(trimmed)
  if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10)
  return null
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
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const detectedFields = headers.reduce<Record<string, LeadField | null>>((acc, h) => {
    acc[h] = detectField(h)
    return acc
  }, {})

  const hasNameColumn = Object.values(detectedFields).includes('name')

  function handleDownloadTemplate() {
    const sample = [
      {
        'שם': 'ישראל ישראלי',
        'טלפון': '0501234567',
        'אימייל': 'israel@example.com',
        'תפקיד': 'מנהל בית ספר',
        'מוסד': 'בית ספר אבן יהודה',
        'עיר': 'תל אביב',
        'סוג מוסד': 'יסודי',
        'נציג מטפל': 'יובל',
        'רמת עניין': 'גבוהה',
        'תאריך לחזור': '2026-06-15',
        'גודל המוסד': 450,
        'הערות': 'נציג פעיל',
      },
      {
        'שם': 'מירי כהן',
        'טלפון': '0509876543',
        'אימייל': 'miri@example.com',
        'תפקיד': 'רכזת',
        'מוסד': 'עיריית רמת גן',
        'עיר': 'רמת גן',
        'סוג מוסד': 'תיכון',
        'נציג מטפל': 'קרן',
        'רמת עניין': 'בינונית',
        'תאריך לחזור': '',
        'גודל המוסד': '',
        'הערות': '',
      },
    ]
    const ws = XLSX.utils.json_to_sheet(sample)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'תבנית לידים')
    XLSX.writeFile(wb, 'תבנית-ייבוא-לידים.xlsx')
  }

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
      setTotalRows(rows.length)
    }
    reader.readAsArrayBuffer(file)
  }

  async function handleImport() {
    if (preview.length === 0) return
    const file = inputRef.current?.files?.[0]
    if (!file) return

    setLoading(true)

    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<PreviewRow>(ws, { defval: '' })

    const created: Lead[] = []
    const skippedNoName: number[] = []
    const errored: number[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const leadData: Partial<Omit<Lead, 'id' | 'created_at' | 'user_id'>> = {
        status: 'new',
      }

      for (const [col, val] of Object.entries(row)) {
        const field = detectField(col)
        const strVal = String(val ?? '').trim()
        if (!field || !strVal) continue

        switch (field) {
          case 'assigned_rep': {
            const rep = parseAssignedRep(strVal)
            if (rep) leadData.assigned_rep = rep
            break
          }
          case 'interest_level': {
            const level = parseInterestLevel(strVal)
            if (level) leadData.interest_level = level
            break
          }
          case 'institution_size': {
            const num = Number(strVal)
            if (!isNaN(num) && num > 0) leadData.institution_size = num
            break
          }
          case 'follow_up_date': {
            const date = parseDate(strVal)
            if (date) leadData.follow_up_date = date
            break
          }
          case 'institution_type': {
            const t = parseInstitutionType(strVal)
            if (t) leadData.institution_type = t
            break
          }
          default:
            // string fields: name, phone, email, role_title, organization, notes, city
            ;(leadData as Record<string, string>)[field] = strVal
        }
      }

      if (!leadData.name) {
        skippedNoName.push(i + 2)
        continue
      }

      try {
        const lead = await createLead({
          name: leadData.name,
          phone: leadData.phone ?? null,
          email: leadData.email ?? null,
          role_title: leadData.role_title ?? null,
          organization: leadData.organization ?? null,
          notes: leadData.notes ?? null,
          status: 'new',
          source: leadData.source ?? null,
          city: leadData.city ?? null,
          assigned_rep: leadData.assigned_rep ?? null,
          interest_level: leadData.interest_level ?? null,
          follow_up_date: leadData.follow_up_date ?? null,
          institution_size: leadData.institution_size ?? null,
          institution_type: leadData.institution_type ?? null,
        })
        created.push(lead)
      } catch (e) {
        console.error('[Import] failed to create lead:', e, row)
        errored.push(i + 2)
      }
    }

    if (created.length > 0) {
      toast.success(`יובאו ${created.length} לידים בהצלחה`)
    }
    if (skippedNoName.length > 0) {
      toast.warning(`${skippedNoName.length} שורות דולגו - חסר שם (שורות: ${skippedNoName.slice(0, 5).join(', ')}${skippedNoName.length > 5 ? '...' : ''})`)
    }
    if (errored.length > 0) {
      toast.error(`${errored.length} שורות נכשלו בייבוא (שורות: ${errored.slice(0, 5).join(', ')}${errored.length > 5 ? '...' : ''})`)
    }
    if (created.length === 0 && skippedNoName.length === 0 && errored.length === 0) {
      toast.error('הקובץ ריק או לא נטען בהצלחה')
    }

    onImported(created)
    setPreview([])
    setHeaders([])
    setTotalRows(0)
    setLoading(false)
    if (inputRef.current) inputRef.current.value = ''
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>ייבוא לידים מקובץ Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-md border border-border bg-muted/20">
            <Download className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">לא בטוחה איך הקובץ צריך להראות?</p>
              <p className="text-xs text-muted-foreground">הורידי תבנית מוכנה עם דוגמאות</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              הורד תבנית
            </Button>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">
              העלי קובץ CSV או XLSX. עמודות מזוהות אוטומטית:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(FIELD_LABELS) as LeadField[]).map(f => (
                <Badge key={f} variant="outline" className="text-xs">
                  {FIELD_LABELS[f]}{f === 'name' && ' *'}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">* שדה חובה</p>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFile}
            className="text-sm text-muted-foreground block w-full file:ml-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />

          {headers.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs space-y-1">
                <p className="font-medium">זיהוי עמודות:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {headers.map(h => (
                    <div key={h} className="flex items-center gap-1.5">
                      {detectedFields[h] ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                          <span className="text-muted-foreground truncate">{h}</span>
                          <span className="text-foreground">→ {FIELD_LABELS[detectedFields[h]!]}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span className="text-muted-foreground truncate">{h}</span>
                          <span className="text-muted-foreground/70 text-xs">(לא מזוהה)</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {!hasNameColumn && (
                <div className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/30">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive">
                    לא זוהתה עמודת "שם" - הייבוא לא יעבוד. ודאי שיש עמודה בשם "שם" או "name" בקובץ.
                  </p>
                </div>
              )}
            </div>
          )}

          {preview.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1">תצוגה מקדימה ({preview.length} מתוך {totalRows} שורות):</p>
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
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button onClick={handleImport} disabled={preview.length === 0 || loading || !hasNameColumn}>
            {loading ? 'מייבא...' : `ייבא ${totalRows} לידים`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
