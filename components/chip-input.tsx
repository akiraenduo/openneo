'use client'

import { useState, type KeyboardEvent } from 'react'
import { useTranslation } from '@/lib/i18n'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface ChipInputProps {
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export function ChipInput({ values, onChange, placeholder, disabled }: ChipInputProps) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      const trimmed = input.trim()
      if (!values.includes(trimmed)) {
        onChange([...values, trimmed])
      }
      setInput('')
    }
    if (e.key === 'Backspace' && !input && values.length > 0) {
      onChange(values.slice(0, -1))
    }
  }

  function remove(val: string) {
    if (disabled) return
    onChange(values.filter((v) => v !== val))
  }

  return (
    <div className="flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5 focus-within:ring-1 focus-within:ring-ring">
      {values.map((val) => (
        <Badge key={val} variant="secondary" className="gap-1 text-xs">
          <span className="max-w-[200px] truncate font-mono text-[11px]">{val}</span>
          {!disabled && (
            <button
              type="button"
              onClick={() => remove(val)}
              className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
              aria-label={t('chipInput.removeLabel').replace('{value}', val)}
            >
              <X className="size-3" />
            </button>
          )}
        </Badge>
      ))}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={values.length === 0 ? placeholder : ''}
        disabled={disabled}
        className="h-7 min-w-[120px] flex-1 border-0 p-0 shadow-none focus-visible:ring-0"
      />
    </div>
  )
}
