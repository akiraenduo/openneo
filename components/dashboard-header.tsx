'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages } from 'lucide-react'
import { useReadOnlyMode } from '@/lib/store'
import { useLocale, allLocales, localeNames } from '@/lib/i18n'

export function DashboardHeader({ title }: { title: string; titleEn?: string }) {
  const { readOnly, setReadOnly } = useReadOnlyMode()
  const { locale, setLocale, t } = useLocale()

  return (
    <header className="flex h-14 items-center gap-3 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />
      <div className="flex flex-1 items-center gap-2">
        <h1 className="text-sm font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {readOnly && (
          <Badge variant="outline" className="text-[10px] border-amber-300 bg-amber-50 text-amber-700">
            {t('header.readOnlyBadge')}
          </Badge>
        )}
        <Label htmlFor="readonly-toggle" className="text-xs text-muted-foreground cursor-pointer">
          {t('header.readOnly')}
        </Label>
        <Switch
          id="readonly-toggle"
          checked={readOnly}
          onCheckedChange={setReadOnly}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <Languages className="size-3.5" />
              {locale.toUpperCase()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {allLocales.map((l) => (
              <DropdownMenuItem key={l} onClick={() => setLocale(l)} className={locale === l ? 'bg-accent' : ''}>
                {localeNames[l]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
