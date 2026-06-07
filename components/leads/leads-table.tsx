'use client'

import { useState } from 'react'
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, getSortedRowModel, flexRender,
  type ColumnDef, type SortingState, type Column,
} from '@tanstack/react-table'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './status-badge'
import { InterestBadge } from './interest-badge'
import type { Lead } from '@/lib/types'
import { SOURCE_MAP, ASSIGNED_REP_MAP } from '@/lib/constants'
import { Pencil, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatFollowUpDate(dateStr: string | null) {
  if (!dateStr) return { text: '—', overdue: false }
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const overdue = date < today
  return {
    text: date.toLocaleDateString('he-IL'),
    overdue,
  }
}

function SortableHeader({ column, title }: { column: Column<Lead, unknown>; title: string }) {
  const sorted = column.getIsSorted()
  return (
    <button
      type="button"
      className="flex items-center gap-1 hover:text-foreground transition-colors"
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      <span>{title}</span>
      {sorted === 'asc' && <ChevronUp className="h-3 w-3" />}
      {sorted === 'desc' && <ChevronDown className="h-3 w-3" />}
      {!sorted && <ChevronsUpDown className="h-3 w-3 opacity-40" />}
    </button>
  )
}

const columns: ColumnDef<Lead>[] = [
  { accessorKey: 'name',           header: ({ column }) => <SortableHeader column={column} title="שם" />,         cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
  { accessorKey: 'organization',   header: ({ column }) => <SortableHeader column={column} title="מוסד" />,        cell: ({ row }) => <span className="text-muted-foreground">{row.original.organization ?? '—'}</span> },
  { accessorKey: 'phone',          header: ({ column }) => <SortableHeader column={column} title="טלפון" />,       cell: ({ row }) => <span dir="ltr" className="text-muted-foreground">{row.original.phone ?? '—'}</span> },
  { accessorKey: 'source',         header: ({ column }) => <SortableHeader column={column} title="מקור" />,        cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.source ? (SOURCE_MAP[row.original.source]?.label ?? row.original.source) : '—'}</span> },
  { accessorKey: 'status',         header: ({ column }) => <SortableHeader column={column} title="סטטוס" />,       cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { accessorKey: 'assigned_rep',   header: ({ column }) => <SortableHeader column={column} title="נציג" />,        cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.assigned_rep ? (ASSIGNED_REP_MAP[row.original.assigned_rep]?.label ?? row.original.assigned_rep) : '—'}</span> },
  { accessorKey: 'interest_level', header: ({ column }) => <SortableHeader column={column} title="עניין" />,       cell: ({ row }) => row.original.interest_level ? <InterestBadge level={row.original.interest_level} /> : <span className="text-muted-foreground text-xs">—</span> },
  { accessorKey: 'follow_up_date', header: ({ column }) => <SortableHeader column={column} title="Follow Up" />,  cell: ({ row }) => {
      const { text, overdue } = formatFollowUpDate(row.original.follow_up_date)
      return <span className={cn('text-xs', overdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-muted-foreground')}>{text}</span>
    }
  },
  { accessorKey: 'created_at',     header: ({ column }) => <SortableHeader column={column} title="תאריך יצירה" />, cell: ({ row }) => <span className="text-muted-foreground text-xs">{new Date(row.original.created_at).toLocaleDateString('he-IL')}</span> },
  { id: 'actions', enableSorting: false, cell: () => null },
]

type Props = {
  leads: Lead[]
  onEdit: (lead: Lead) => void
}

export function LeadsTable({ leads, onEdit }: Props) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columnsWithClick = columns.map((col: any) =>
    col.accessorKey === 'name'
      ? {
          ...col,
          cell: ({ row }: any) => (
            <button
              type="button"
              onClick={() => onEdit(row.original)}
              className="font-medium hover:text-blue-600 hover:underline transition-colors text-left"
            >
              {row.original.name}
            </button>
          )
        }
      : col
  )

  const table = useReactTable({
    data: leads,
    columns: columnsWithClick,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  })

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="bg-muted/40 hover:bg-muted/40">
                {hg.headers.map(header => (
                  <TableHead key={header.id} className="text-right font-medium text-muted-foreground whitespace-nowrap">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-10">
                  לא נמצאו לידים
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="hover:bg-muted/20">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="text-right whitespace-nowrap">
                      {cell.column.id === 'actions'
                        ? <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(row.original)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        : flexRender(cell.column.columnDef.cell, cell.getContext())
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>מציג {table.getRowModel().rows.length} מתוך {leads.length} לידים</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>→</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>←</Button>
        </div>
      </div>
    </div>
  )
}
