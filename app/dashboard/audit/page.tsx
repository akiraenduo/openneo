'use client'

import { useState, useMemo } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
import { useTranslation } from '@/lib/i18n'
import { useAuditLogs } from '@/lib/store'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Link2 } from 'lucide-react'

const eventTypeColors: Record<string, string> = {
  POLICY_CREATED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  POLICY_UPDATED: 'bg-blue-100 text-blue-800 border-blue-200',
  POLICY_DELETED: 'bg-red-100 text-red-800 border-red-200',
  CREDENTIAL_CREATED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CREDENTIAL_UPDATED: 'bg-blue-100 text-blue-800 border-blue-200',
  CREDENTIAL_DELETED: 'bg-red-100 text-red-800 border-red-200',
  ACCESS_APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  ACCESS_DENIED: 'bg-red-100 text-red-800 border-red-200',
}

export default function AuditPage() {
  const { t } = useTranslation()
  const { logs } = useAuditLogs()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const eventTypes = useMemo(() => {
    const types = new Set(logs.map((l) => l.eventType))
    return Array.from(types).sort()
  }, [logs])

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        l.details.toLowerCase().includes(search.toLowerCase()) ||
        l.eventType.toLowerCase().includes(search.toLowerCase()) ||
        l.target.toLowerCase().includes(search.toLowerCase())
      const matchType = typeFilter === 'all' || l.eventType === typeFilter
      return matchSearch && matchType
    })
  }, [logs, search, typeFilter])

  return (
    <>
      <DashboardHeader title={t('audit.title')} />
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('common.search')}
                className="pl-8"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('audit.allEvents')}</SelectItem>
                {eventTypes.map((et) => (
                  <SelectItem key={et} value={et}>
                    {et}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t('audit.dateTime')}</TableHead>
                  <TableHead className="text-xs">{t('audit.event')}</TableHead>
                  <TableHead className="text-xs">{t('audit.actor')}</TableHead>
                  <TableHead className="hidden text-xs sm:table-cell">{t('audit.details')}</TableHead>
                  <TableHead className="hidden text-xs md:table-cell">{t('audit.hashChain')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                      {t('audit.noLogs')}
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('ja-JP')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${eventTypeColors[log.eventType] ?? ''}`}
                      >
                        {log.eventType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{log.actor}</TableCell>
                    <TableCell className="hidden max-w-[300px] truncate text-sm sm:table-cell">
                      {log.details}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                        <Link2 className="size-3" />
                        {log.hashChainIndicator}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  )
}
