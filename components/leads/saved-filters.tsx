'use client'

import { Button } from '@/components/ui/button'

type Preset = { label: string; status?: string; thisMonth?: boolean }

const PRESETS: Preset[] = [
  { label: 'לידים פעילים', status: 'active' },
  { label: 'חדשים החודש', thisMonth: true },
]

type Props = {
  activePreset: string | null
  onPreset: (preset: Preset | null) => void
}

export function SavedFilters({ activePreset, onPreset }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {PRESETS.map(preset => (
        <Button
          key={preset.label}
          variant={activePreset === preset.label ? 'default' : 'outline'}
          size="sm"
          className="h-7 text-xs"
          onClick={() => onPreset(activePreset === preset.label ? null : preset)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  )
}
