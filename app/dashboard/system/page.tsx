'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Cpu,
  HardDrive,
  MemoryStick,
  Battery,
  Monitor,
  Skull,
  ArrowUpDown,
} from 'lucide-react'
import { useStaticSystemInfo, useDynamicSystemInfo } from '@/hooks/use-system-info'
import { useProcesses } from '@/hooks/use-processes'
import { useBattery } from '@/hooks/use-battery'
import { useLoginItem } from '@/hooks/use-login-item'
import { useTranslation } from '@/lib/i18n'
import { DEV_STATIC_INFO, DEV_DYNAMIC_INFO, DEV_PROCESSES, DEV_BATTERY } from '@/lib/dev-fallback'

type SortKey = 'cpuPercent' | 'ramBytes' | 'pid' | 'command'
type SortDir = 'asc' | 'desc'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

const pressureColors: Record<string, string> = {
  nominal: 'text-green-600',
  warning: 'text-yellow-600',
  critical: 'text-red-600',
}

export default function SystemPage() {
  const { t } = useTranslation()
  const { data: staticInfo } = useStaticSystemInfo()
  const { data: dynamicInfo } = useDynamicSystemInfo(3000)
  const { processes, killProcess } = useProcesses(3000)
  const { data: battery } = useBattery(10000)
  const { settings: loginItem, toggle: toggleLoginItem } = useLoginItem()

  const displayProcesses = processes.length > 0 ? processes : DEV_PROCESSES
  const displayBattery = battery ?? DEV_BATTERY

  const [sortKey, setSortKey] = useState<SortKey>('cpuPercent')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [killingPid, setKillingPid] = useState<number | null>(null)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sortedProcesses = [...displayProcesses].sort((a, b) => {
    const va = a[sortKey]
    const vb = b[sortKey]
    if (typeof va === 'string' && typeof vb === 'string') {
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    }
    return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number)
  })

  const handleKill = async (pid: number) => {
    setKillingPid(pid)
    await killProcess(pid)
    setKillingPid(null)
  }

  const effectiveTotalRAM = staticInfo?.totalRAMBytes ?? DEV_STATIC_INFO.totalRAMBytes
  const effectiveFreeRAM = dynamicInfo?.freeRAMBytes ?? DEV_DYNAMIC_INFO.freeRAMBytes
  const memoryUsedPercent = Math.round(((effectiveTotalRAM - effectiveFreeRAM) / effectiveTotalRAM) * 100)

  return (
    <>
      <DashboardHeader title={t('system.title')} titleEn="System" />
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          {/* Mac Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                  <Monitor className="size-5 text-foreground" />
                </div>
                <div>
                  <CardTitle className="text-sm">{t('system.macInfo')}</CardTitle>
                  <CardDescription className="text-xs">
                    {staticInfo?.chipGeneration ?? DEV_STATIC_INFO.chipGeneration}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">{t('system.cpu')}</span>
                  <span className="text-sm font-semibold">
                    {staticInfo?.cpuModel ?? DEV_STATIC_INFO.cpuModel}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">{t('system.chip')}</span>
                  <span className="text-sm font-semibold">
                    {staticInfo?.chipGeneration ?? DEV_STATIC_INFO.chipGeneration}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">{t('system.gpuCores')}</span>
                  <span className="text-sm font-semibold">
                    {staticInfo?.gpuCores ?? DEV_STATIC_INFO.gpuCores}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">{t('system.totalRam')}</span>
                  <span className="text-sm font-semibold">
                    {formatBytes(staticInfo?.totalRAMBytes ?? DEV_STATIC_INFO.totalRAMBytes)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">{t('system.disk')}</span>
                  <span className="text-sm font-semibold">
                    {`${formatBytes(staticInfo?.diskFreeBytes ?? DEV_STATIC_INFO.diskFreeBytes)} / ${formatBytes(staticInfo?.diskTotalBytes ?? DEV_STATIC_INFO.diskTotalBytes)}`}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">{t('system.osVersion')}</span>
                  <span className="text-sm font-semibold">
                    macOS {staticInfo?.osVersion ?? DEV_STATIC_INFO.osVersion}
                  </span>
                </div>
                {displayBattery && displayBattery.percent >= 0 && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">{t('system.battery')}</span>
                    <span className="text-sm font-semibold flex items-center gap-1">
                      <Battery className="size-3" />
                      {displayBattery.percent}%
                      {displayBattery.charging && <Badge variant="outline" className="text-[9px] px-1 py-0">Charging</Badge>}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Real-time Metrics */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <MemoryStick className="size-4" />
                  {t('system.memoryPressure')}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('system.inUse')}</span>
                  <span className="font-mono">
                    {`${formatBytes(effectiveTotalRAM - effectiveFreeRAM)} / ${formatBytes(effectiveTotalRAM)}`}
                  </span>
                </div>
                <Progress value={memoryUsedPercent} className="h-2" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t('system.pressure')}</span>
                  <Badge
                    variant="outline"
                    className={pressureColors[dynamicInfo?.memoryPressure || 'nominal']}
                  >
                    {dynamicInfo?.memoryPressure || 'nominal'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Cpu className="size-4" />
                  {t('system.cpuLoad')}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('system.loadAverage')}</span>
                  <span className="font-mono text-lg font-bold">
                    {(dynamicInfo?.cpuLoadPercent ?? DEV_DYNAMIC_INFO.cpuLoadPercent).toFixed(1)}%
                  </span>
                </div>
                <Progress value={dynamicInfo?.cpuLoadPercent ?? DEV_DYNAMIC_INFO.cpuLoadPercent} className="h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Process List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('system.processes')}</CardTitle>
              <CardDescription>{t('system.processesDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="cursor-pointer px-2 py-2 text-left" onClick={() => toggleSort('pid')}>
                        <span className="flex items-center gap-1">PID <ArrowUpDown className="size-3" /></span>
                      </th>
                      <th className="cursor-pointer px-2 py-2 text-right" onClick={() => toggleSort('cpuPercent')}>
                        <span className="flex items-center justify-end gap-1">CPU% <ArrowUpDown className="size-3" /></span>
                      </th>
                      <th className="cursor-pointer px-2 py-2 text-right" onClick={() => toggleSort('ramBytes')}>
                        <span className="flex items-center justify-end gap-1">RAM <ArrowUpDown className="size-3" /></span>
                      </th>
                      <th className="cursor-pointer px-2 py-2 text-left" onClick={() => toggleSort('command')}>
                        <span className="flex items-center gap-1">Command <ArrowUpDown className="size-3" /></span>
                      </th>
                      <th className="px-2 py-2 text-right">{t('system.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProcesses.map((proc) => (
                      <tr key={proc.pid} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="px-2 py-1.5 font-mono text-xs">{proc.pid}</td>
                        <td className="px-2 py-1.5 text-right font-mono text-xs">
                          {proc.cpuPercent.toFixed(1)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono text-xs">
                          {formatBytes(proc.ramBytes)}
                        </td>
                        <td className="max-w-[200px] truncate px-2 py-1.5 text-xs" title={proc.command}>
                          {proc.command.split('/').pop()}
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-destructive hover:text-destructive"
                            onClick={() => handleKill(proc.pid)}
                            disabled={killingPid === proc.pid}
                          >
                            <Skull className="size-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {sortedProcesses.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-2 py-4 text-center text-xs text-muted-foreground">
                          {t('system.noProcesses')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Open at Login */}
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex flex-col gap-0.5">
                <Label className="text-sm font-medium">{t('system.openAtLogin')}</Label>
                <span className="text-xs text-muted-foreground">{t('system.openAtLoginDesc')}</span>
              </div>
              <Switch
                checked={loginItem?.openAtLogin || false}
                onCheckedChange={toggleLoginItem}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
