'use client'

import { useState, useMemo } from 'react'
import {
  DndContext, DragEndEvent, DragOverlay,
  PointerSensor, KeyboardSensor, useSensor, useSensors,
  useDroppable, useDraggable,
} from '@dnd-kit/core'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from './status-badge'
import { STATUS_OPTIONS, SOURCE_MAP } from '@/lib/constants'
import { updateLeadStatus } from '@/actions/leads'
import { toast } from 'sonner'
import type { Lead, Status } from '@/lib/types'

function KanbanCard({ lead, onEdit }: { lead: Lead; onEdit: (l: Lead) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id })
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <Card
        className={`cursor-grab active:cursor-grabbing mb-2 ${isDragging ? 'opacity-50' : 'cursor-pointer'}`}
        onClick={() => !isDragging && onEdit(lead)}
      >
        <CardContent className="p-3 space-y-1">
          <p className="font-medium text-sm">{lead.name}</p>
          {lead.organization && <p className="text-xs text-muted-foreground">{lead.organization}</p>}
          {lead.source && (
            <Badge variant="outline" className="text-xs">
              {SOURCE_MAP[lead.source]?.label ?? lead.source}
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function KanbanColumn({
  status, label, leads, onEdit,
}: { status: Status; label: string; leads: Lead[]; onEdit: (l: Lead) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  return (
    <div className="flex-1 min-w-44">
      <div className="flex items-center justify-between mb-2">
        <StatusBadge status={status} />
        <span className="text-xs text-muted-foreground" aria-label={`${leads.length} leads`}>{leads.length}</span>
      </div>
      <div
        ref={setNodeRef}
        role="region"
        aria-label={`${label} column`}
        className={`min-h-24 rounded-md p-2 transition-colors ${isOver ? 'bg-muted/40' : 'bg-muted/10'}`}
      >
        {leads.map(lead => <KanbanCard key={lead.id} lead={lead} onEdit={onEdit} />)}
      </div>
    </div>
  )
}

type Props = {
  leads: Lead[]
  onEdit: (lead: Lead) => void
  onLeadsChange: (leads: Lead[]) => void
}

export function LeadsKanban({ leads, onEdit, onLeadsChange }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  )

  const columns = useMemo(() =>
    STATUS_OPTIONS.map(s => ({
      ...s,
      leads: leads.filter(l => l.status === s.value),
    })),
    [leads]
  )

  async function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over) return
    const leadId = active.id as string
    const newStatus = over.id as Status
    const lead = leads.find(l => l.id === leadId)
    if (!lead || lead.status === newStatus) return

    const oldStatus = lead.status
    const currentLeads = leads // Capture current state
    const updatedLeads = currentLeads.map(l => l.id === leadId ? { ...l, status: newStatus } : l)
    onLeadsChange(updatedLeads)

    try {
      await updateLeadStatus(leadId, newStatus, oldStatus)
    } catch {
      onLeadsChange(currentLeads) // Rollback to captured state
      toast.error('שגיאה בעדכון סטטוס')
    }
    setActiveId(null)
  }

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null

  return (
    <DndContext sensors={sensors} onDragStart={({ active }) => setActiveId(active.id as string)} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {columns.map(col => (
          <KanbanColumn key={col.value} status={col.value} label={col.label} leads={col.leads} onEdit={onEdit} />
        ))}
      </div>
      <DragOverlay>
        {activeLead && <KanbanCard lead={activeLead} onEdit={() => undefined} />}
      </DragOverlay>
    </DndContext>
  )
}
