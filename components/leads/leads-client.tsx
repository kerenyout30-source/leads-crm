'use client'

import { useState, useMemo } from 'react'
import { LeadsToolbar } from './leads-toolbar'
import { LeadsTable } from './leads-table'
import { LeadDrawer } from './lead-drawer'
import type { Lead } from '@/lib/types'
import * as XLSX from 'xlsx'

type Props = { initialLeads: Lead[] }

export function LeadsClient({ initialLeads }: Props) {
  const [leads, setLeads] = useState(initialLeads)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [view, setView] = useState<'table' | 'kanban'>('table')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const filtered = useMemo(() => {
    return leads.filter(l => {
      const matchSearch = !search ||
        l.name.includes(search) ||
        (l.organization ?? '').includes(search)

      let matchStatus = statusFilter === 'all' || l.status === statusFilter
      let matchSource = sourceFilter === 'all' || l.source === sourceFilter

      if (activePreset === 'לידים פעילים') {
        matchStatus = ['new', 'in_progress', 'details_sent'].includes(l.status)
      }
      if (activePreset === 'חדשים החודש') {
        matchStatus = new Date(l.created_at) >= startOfMonth
      }

      return matchSearch && matchStatus && matchSource
    })
  }, [leads, search, statusFilter, sourceFilter, activePreset])

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
      סטטוס: l.status,
      מקור: l.source ?? '',
      הערות: l.notes ?? '',
      תאריך: new Date(l.created_at).toLocaleDateString('he-IL'),
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
        activePreset={activePreset} onPreset={p => setActivePreset(p?.label ?? null)}
        view={view} onViewChange={setView}
        onAddNew={handleAddNew}
        onExport={handleExport}
        onImport={() => {}}
      />

      {view === 'table'
        ? <LeadsTable leads={filtered} onEdit={handleEdit} />
        : <div className="text-muted-foreground text-sm p-4">קנבן — ראה Task 9</div>
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
    </div>
  )
}
