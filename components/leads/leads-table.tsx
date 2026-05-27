'use client'

import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getPaginationRowModel, flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './status-badge'
import type { Lead } from '@/lib/types'
import { SOURCE_MAP } from '@/lib/constants'
import { Pencil } from 'lucide-react'

const columns: ColumnDef<Lead>[] = [
  { accessorKey: 'name',         header: 'שם',     cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
  { accessorKey: 'organization', header: 'מוסד',   cell: ({ row }) => <span className="text-muted-foreground">{row.original.organization ?? '—'}</span> },
  { accessorKey: 'phone',        header: 'טלפון',  cell: ({ row }) => <span dir="ltr" className="text-muted-foreground">{row.original.phone ?? '—'}</span> },
  { accessorKey: 'source',       header: 'מקור',   cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.original.source ? (SOURCE_MAP[row.original.source]?.label ?? row.original.source) : '—'}</span> },
  { accessorKey: 'status',       header: 'סטטוס',  cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  { accessorKey: 'created_at',   header: 'תאריך',  cell: ({ row }) => <span className="text-muted-foreground text-xs">{new Date(row.original.created_at).toLocaleDateString('he-IL')}</span> },
  { id: 'actions', cell: () => null }, // filled per-row below
]

type Props = {
  leads: Lead[]
  onEdit: (lead: Lead) => void
}

export function LeadsTable({ leads, onEdit }: Props) {
  const table = useReactTable({
    data: leads,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  })

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="bg-muted/40 hover:bg-muted/40">
                {hg.headers.map(header => (
                  <TableHead key={header.id} className="text-right font-medium text-muted-foreground">
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
                    <TableCell key={cell.id} className="text-right">
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
