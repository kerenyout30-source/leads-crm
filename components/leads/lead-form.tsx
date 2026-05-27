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
import { STATUS_OPTIONS, SOURCE_OPTIONS } from '@/lib/constants'
import type { Lead } from '@/lib/types'

const schema = z.object({
  name: z.string().min(1, 'שם הוא שדה חובה'),
  phone: z.string().optional().or(z.literal('')),
  email: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (v) => !v || z.string().email().safeParse(v).success,
      'אימייל לא תקין'
    ),
  role_title: z.string().optional().or(z.literal('')),
  organization: z.string().optional().or(z.literal('')),
  status: z.enum(['new', 'in_progress', 'details_sent', 'closed', 'not_relevant']),
  source: z
    .enum(['facebook', 'referral', 'outbound', 'whatsapp', 'other'])
    .optional()
    .or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export type LeadFormValues = z.infer<typeof schema>

type Props = {
  defaultValues?: Partial<LeadFormValues>
  onSubmit: (values: LeadFormValues) => Promise<void>
  loading: boolean
}

export function LeadForm({ defaultValues, onSubmit, loading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LeadFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      role_title: '',
      organization: '',
      status: 'new',
      source: '',
      notes: '',
      ...defaultValues,
    },
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
          <FormLabel>טלפון</FormLabel>
          <FormControl>
            <Input {...register('phone')} dir="ltr" />
          </FormControl>
        </FormItem>
        <FormItem>
          <FormLabel>אימייל</FormLabel>
          <FormControl>
            <Input {...register('email')} dir="ltr" />
          </FormControl>
          {errors.email && <FormMessage>{errors.email.message}</FormMessage>}
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

      {/* Status and Source */}
      <div className="grid grid-cols-2 gap-3">
        <FormItem>
          <FormLabel>סטטוס</FormLabel>
          <Select
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
            onValueChange={(value) =>
              setValue('source', value === '' ? '' : (value as LeadFormValues['source']))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="בחר מקור" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">ללא</SelectItem>
              {SOURCE_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
