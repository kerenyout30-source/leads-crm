'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  STATUS_OPTIONS,
  SOURCE_OPTIONS,
  ASSIGNED_REP_OPTIONS,
  INTEREST_LEVEL_OPTIONS,
  INSTITUTION_TYPE_OPTIONS,
} from '@/lib/constants'

const schema = z.object({
  // Required fields
  name: z.string().trim().min(1, 'שם הוא שדה חובה'),
  phone: z.string().trim().min(1, 'טלפון הוא שדה חובה'),
  // Status has a default 'new', so always valid
  status: z.enum(['new', 'in_progress', 'details_sent', 'closed', 'not_relevant']),
  // Everything below is optional - accepts empty string or undefined
  email: z.string().optional().or(z.literal('')),
  role_title: z.string().optional().or(z.literal('')),
  organization: z.string().optional().or(z.literal('')),
  source: z
    .enum(['facebook', 'referral', 'outbound', 'whatsapp', 'field_agent', 'other'])
    .optional()
    .or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  assigned_rep: z
    .enum(['yuval', 'Effi', 'keren', 'alona'])
    .optional()
    .or(z.literal('')),
  interest_level: z
    .enum(['high', 'medium', 'low'])
    .optional()
    .or(z.literal('')),
  follow_up_date: z.string().optional().or(z.literal('')),
  institution_size: z.string().optional().or(z.literal('')),
  institution_type: z
    .enum(['elementary', 'middle', 'high'])
    .optional()
    .or(z.literal('')),
})

export type LeadFormValues = z.infer<typeof schema>

type Props = {
  defaultValues?: Partial<LeadFormValues>
  onSubmit: (values: LeadFormValues) => Promise<void>
  loading: boolean
}

export function LeadForm({ defaultValues, onSubmit, loading }: Props) {
  // Convert null/undefined from DB to empty strings (form expects strings, not nulls)
  const d = defaultValues ?? {}
  const merged: LeadFormValues = {
    name: (d.name as string | null | undefined) ?? '',
    phone: (d.phone as string | null | undefined) ?? '',
    email: (d.email as string | null | undefined) ?? '',
    role_title: (d.role_title as string | null | undefined) ?? '',
    organization: (d.organization as string | null | undefined) ?? '',
    status: (d.status as LeadFormValues['status']) ?? 'new',
    source: (d.source as LeadFormValues['source']) ?? '',
    notes: (d.notes as string | null | undefined) ?? '',
    city: (d.city as string | null | undefined) ?? '',
    assigned_rep: (d.assigned_rep as LeadFormValues['assigned_rep']) ?? '',
    interest_level: (d.interest_level as LeadFormValues['interest_level']) ?? '',
    follow_up_date: (d.follow_up_date as string | null | undefined) ?? '',
    institution_size:
      d.institution_size != null && d.institution_size !== ''
        ? String(d.institution_size)
        : '',
    institution_type: (d.institution_type as LeadFormValues['institution_type']) ?? '',
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LeadFormValues>({
    resolver: zodResolver(schema),
    defaultValues: merged,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name */}
      <FormItem>
        <FormLabel>שם *</FormLabel>
        <FormControl>
          <Input {...register('name')} />
        </FormControl>
        {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
      </FormItem>

      {/* Phone and Email */}
      <div className="grid grid-cols-2 gap-3">
        <FormItem>
          <FormLabel>טלפון *</FormLabel>
          <FormControl>
            <Input {...register('phone')} dir="ltr" />
          </FormControl>
          {errors.phone && <FormMessage>{errors.phone.message}</FormMessage>}
        </FormItem>
        <FormItem>
          <FormLabel>אימייל</FormLabel>
          <FormControl>
            <Input {...register('email')} dir="ltr" />
          </FormControl>
        </FormItem>
      </div>

      {/* Role and Organization */}
      <div className="grid grid-cols-2 gap-3">
        <FormItem>
          <FormLabel>תפקיד</FormLabel>
          <FormControl>
            <Input {...register('role_title')} />
          </FormControl>
        </FormItem>
        <FormItem>
          <FormLabel>מוסד</FormLabel>
          <FormControl>
            <Input {...register('organization')} />
          </FormControl>
        </FormItem>
      </div>

      {/* City and Institution Type */}
      <div className="grid grid-cols-2 gap-3">
        <FormItem>
          <FormLabel>עיר</FormLabel>
          <FormControl>
            <Input {...register('city')} />
          </FormControl>
        </FormItem>
        <FormItem>
          <FormLabel>סוג מוסד</FormLabel>
          <Select
            defaultValue={merged.institution_type || '__none__'}
            onValueChange={(value) =>
              setValue('institution_type', (value === '__none__' ? '' : value) as LeadFormValues['institution_type'])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__" className="text-muted-foreground italic">ללא</SelectItem>
              {INSTITUTION_TYPE_OPTIONS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      </div>

      {/* Status and Source */}
      <div className="grid grid-cols-2 gap-3">
        <FormItem>
          <FormLabel>סטטוס</FormLabel>
          <Select
            defaultValue={merged.status}
            onValueChange={(value) =>
              setValue('status', value as LeadFormValues['status'])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
        <FormItem>
          <FormLabel>מקור</FormLabel>
          <Select
            defaultValue={merged.source || '__none__'}
            onValueChange={(value) =>
              setValue('source', (value === '__none__' ? '' : value) as LeadFormValues['source'])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__" className="text-muted-foreground italic">ללא</SelectItem>
              {SOURCE_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      </div>

      {/* Assigned Rep and Interest Level */}
      <div className="grid grid-cols-2 gap-3">
        <FormItem>
          <FormLabel>נציג מטפל</FormLabel>
          <Select
            defaultValue={merged.assigned_rep || '__none__'}
            onValueChange={(value) =>
              setValue('assigned_rep', (value === '__none__' ? '' : value) as LeadFormValues['assigned_rep'])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__" className="text-muted-foreground italic">ללא</SelectItem>
              {ASSIGNED_REP_OPTIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
        <FormItem>
          <FormLabel>רמת עניין</FormLabel>
          <Select
            defaultValue={merged.interest_level || '__none__'}
            onValueChange={(value) =>
              setValue('interest_level', (value === '__none__' ? '' : value) as LeadFormValues['interest_level'])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__" className="text-muted-foreground italic">ללא</SelectItem>
              {INTEREST_LEVEL_OPTIONS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      </div>

      {/* Follow-up date and Institution size */}
      <div className="grid grid-cols-2 gap-3">
        <FormItem>
          <FormLabel>תאריך Follow Up</FormLabel>
          <FormControl>
            <Input {...register('follow_up_date')} type="date" dir="ltr" />
          </FormControl>
        </FormItem>
        <FormItem>
          <FormLabel>גודל המוסד / מס' תלמידים</FormLabel>
          <FormControl>
            <Input {...register('institution_size')} type="number" min="0" dir="ltr" />
          </FormControl>
        </FormItem>
      </div>

      {/* Notes */}
      <FormItem>
        <FormLabel>הערות</FormLabel>
        <FormControl>
          <Textarea {...register('notes')} rows={3} />
        </FormControl>
      </FormItem>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'שומר...' : 'שמור'}
      </Button>
    </form>
  )
}
