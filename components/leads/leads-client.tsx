'use client'

import { useState, useMemo } from 'react'
import { LeadsToolbar } from './leads-toolbar'
import { LeadsTable } from './leads-table'
import { LeadsKanban } from './leads-kanban'
import { LeadDrawer } from './lead-drawer'
import { ImportModal } from './import-modal'
import type { Lead } from '@/lib/types'
import {
  STATUS_MAP,
  SOURCE_MAP,
  ASSIGNED_REP_MAP,
  INTEREST_LEVEL_MAP,
  INSTITUTION_TYPE_MAP,
} from '@/lib/constants'
import * as XLSX from 'xlsx'

type Props = { initialLeads: Lead[] }

export function LeadsClient({ initialLeads }: Props) {
  const [leads, setLeads] = useState(initialLeads)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [repFilter, setRepFilter] = useState('all')
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [view, setView] = useState<'table' | 'kanban'>('table')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const filtered = useMemo(() => {
    return leads.filter(l => {
      const matchSearch = !search ||
        l.name.includes(search) ||
        (l.organization ?? '').includes(search)

      let matchStatus = statusFilter === 'all' || l.status === statusFilter
      const matchSource = sourceFilter === 'all' || l.source === sourceFilter
      const matchRep = repFilter === 'all' || l.assigned_rep === repFilter

      if (activePreset === 'לידים פעילים') {
        matchStatus = ['new', 'in_progress', 'details_sent'].includes(l.status)
      }
      if (activePreset === 'חדשים החודש') {
        matchStatus = new Date(l.created_at) >= startOfMonth
      }

      return matchSearch && matchStatus && matchSource && matchRep
    })
  }, [leads, search, statusFilter, sourceFilter, repFilter, activePreset, startOfMonth])

  function handleEdit(lead: Lead) {
    setEditingLead(lead)
    setDrawerOpen(true)
  }

  function handleAddNew() {
    setEditingLead(null)
    setDrawerOpen(true)
  }

  function handleExport() {
    const rows = filtered.map(l => ({
      שם: l.name,
      טלפון: l.phone ?? '',
      אימייל: l.email ?? '',
      תפקיד: l.role_title ?? '',
      מוסד: l.organization ?? '',
      עיר: l.city ?? '',
      'סוג מוסד': l.institution_type ? (INSTITUTION_TYPE_MAP[l.institution_type]?.label ?? l.institution_type) : '',
      סטטוס: STATUS_MAP[l.status]?.label ?? l.status,
      מקור: l.source ? (SOURCE_MAP[l.source]?.label ?? l.source) : '',
      'נציג מטפל': l.assigned_rep ? (ASSIGNED_REP_MAP[l.assigned_rep]?.label ?? l.assigned_rep) : '',
      'רמת עניין': l.interest_level ? (INTEREST_LEVEL_MAP[l.interest_level]?.label ?? l.interest_level) : '',
      'תאריך לחזור': l.follow_up_date ?? '',
      'גודל המוסד': l.institution_size ?? '',
      הערות: l.notes ?? '',
      'תאריך יצירה': new Date(l.created_at).toLocaleDateString('he-IL'),
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'לידים')
    XLSX.writeFile(wb, `leads-${Date.now()}.xlsx`)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">לידים</h1>

      <LeadsToolbar
        search={search} onSearch={setSearch}
        statusFilter={statusFilter} onStatusFilter={setStatusFilter}
        sourceFilter={sourceFilter} onSourceFilter={setSourceFilter}
        repFilter={repFilter} onRepFilter={setRepFilter}
        activePreset={activePreset} onPreset={p => setActivePreset(p?.label ?? null)}
        view={view} onViewChange={setView}
        onAddNew={handleAddNew}
        onExport={handleExport}
        onImport={() => setImportOpen(true)}
      />

      {view === 'table'
        ? <LeadsTable leads={filtered} onEdit={handleEdit} />
        : <LeadsKanban
            leads={filtered}
            onEdit={handleEdit}
            onLeadsChange={setLeads}
          />
      }

      <LeadDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        lead={editingLead}
        onSaved={(updated) => {
          setLeads(prev =>
            editingLead
              ? prev.map(l => l.id === updated.id ? updated : l)
              : [updated, ...prev]
          )
          setDrawerOpen(false)
        }}
        onDeleted={(id) => {
          setLeads(prev => prev.filter(l => l.id !== id))
          setDrawerOpen(false)
        }}
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={(newLeads) => setLeads(prev => [...newLeads, ...prev])}
      />
    </div>
  )
}
