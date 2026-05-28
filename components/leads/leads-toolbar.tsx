'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { SavedFilters } from './saved-filters'
import { STATUS_OPTIONS, SOURCE_OPTIONS, ASSIGNED_REP_OPTIONS } from '@/lib/constants'
import { Download, Upload, LayoutGrid, List, Plus } from 'lucide-react'

type Props = {
  search: string
  onSearch: (v: string) => void
  statusFilter: string
  onStatusFilter: (v: string) => void
  sourceFilter: string
  onSourceFilter: (v: string) => void
  repFilter: string
  onRepFilter: (v: string) => void
  activePreset: string | null
  onPreset: (p: { label: string; status?: string; thisMonth?: boolean } | null) => void
  view: 'table' | 'kanban'
  onViewChange: (v: 'table' | 'kanban') => void
  onAddNew: () => void
  onExport: () => void
  onImport: () => void
}

export function LeadsToolbar(props: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center flex-1">
          <Input
            placeholder="חיפוש לפי שם, מוסד..."
            value={props.search}
            onChange={e => props.onSearch(e.target.value)}
            className="w-52 h-8 text-sm"
          />
          <Select value={props.statusFilter} onValueChange={v => props.onStatusFilter(v ?? '')}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="סטטוס" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              {STATUS_OPTIONS.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={props.sourceFilter} onValueChange={v => props.onSourceFilter(v ?? '')}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="מקור" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל המקורות</SelectItem>
              {SOURCE_OPTIONS.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={props.repFilter} onValueChange={v => props.onRepFilter(v ?? '')}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="נציג" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הנציגים</SelectItem>
              {ASSIGNED_REP_OPTIONS.map(r => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 items-center">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={props.onExport}>
            <Download className="h-3 w-3" /> ייצוא
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={props.onImport}>
            <Upload className="h-3 w-3" /> ייבוא
          </Button>
          <Button
            variant="outline" size="sm" className="h-8 px-2"
            onClick={() => props.onViewChange(props.view === 'table' ? 'kanban' : 'table')}
          >
            {props.view === 'table'
              ? <LayoutGrid className="h-4 w-4" />
              : <List className="h-4 w-4" />}
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1" onClick={props.onAddNew}>
            <Plus className="h-3 w-3" /> ליד חדש
          </Button>
        </div>
      </div>

      <SavedFilters activePreset={props.activePreset} onPreset={props.onPreset} />
    </div>
  )
}
