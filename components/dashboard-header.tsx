'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useReadOnlyMode } from '@/lib/store'

export function DashboardHeader({ title, titleEn }: { title: string; titleEn?: string }) {
  const { readOnly, setReadOnly } = useReadOnlyMode()

  return (
    <header className="flex h-14 items-center gap-3 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />
      <div className="flex flex-1 items-center gap-2">
        <h1 className="text-sm font-semibold">{title}</h1>
        {titleEn && (
          <span className="hidden text-xs text-muted-foreground sm:inline">
            ({titleEn})
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {readOnly && (
          <Badge variant="outline" className="text-[10px] border-amber-300 bg-amber-50 text-amber-700">
            読み取り専用
          </Badge>
        )}
        <Label htmlFor="readonly-toggle" className="text-xs text-muted-foreground cursor-pointer">
          Read-only
        </Label>
        <Switch
          id="readonly-toggle"
          checked={readOnly}
          onCheckedChange={setReadOnly}
        />
      </div>
    </header>
  )
}
