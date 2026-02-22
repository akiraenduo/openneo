'use client'

import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  ShieldCheck,
  KeyRound,
  FileWarning,
  ScrollText,
  Bot,
  ListTodo,
  Cpu,
  Globe,
  Battery,
} from 'lucide-react'
import {
  usePolicies,
  useCredentials,
  useAccessRequests,
  useAuditLogs,
  useAgents,
  useJobs,
} from '@/lib/store'
import { useStaticSystemInfo, useDynamicSystemInfo } from '@/hooks/use-system-info'
import { useBattery } from '@/hooks/use-battery'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { policies } = usePolicies()
  const { credentials } = useCredentials()
  const { requests } = useAccessRequests()
  const { logs } = useAuditLogs()
  const { agents } = useAgents()
  const { jobs } = useJobs()
  const { data: staticInfo } = useStaticSystemInfo()
  const { data: dynamicInfo } = useDynamicSystemInfo(3000)
  const { data: battery } = useBattery(10000)

  const enabledPolicies = policies.filter((p) => p.enabled).length
  const pendingRequests = requests.filter((r) => r.status === 'pending').length
  const runningAgents = agents.filter((a) => a.status === 'running').length
  const runningJobs = jobs.filter((j) => j.status === 'running').length
  const totalCpu = agents.reduce((s, a) => s + a.cpuPercent, 0)
  const totalRam = agents.reduce((s, a) => s + a.ramMB, 0)

  const totalRAMBytes = staticInfo?.totalRAMBytes || 36 * 1024 * 1024 * 1024
  const freeRAMBytes = dynamicInfo?.freeRAMBytes
  const usedRAMBytes = freeRAMBytes != null ? totalRAMBytes - freeRAMBytes : totalRam * 1024 * 1024
  const memUsedPercent = Math.min(Math.round((usedRAMBytes / totalRAMBytes) * 100), 100)

  const monitorStats = [
    {
      title: t('dashboard.agents'),
      value: `${runningAgents} / ${agents.length}`,
      description: t('dashboard.agentsDesc'),
      icon: Bot,
      href: '/dashboard/agents',
      color: 'text-foreground',
    },
    {
      title: t('dashboard.jobs'),
      value: runningJobs,
      description: t('dashboard.jobsDesc'),
      icon: ListTodo,
      href: '/dashboard/jobs',
      color: 'text-foreground',
    },
    {
      title: t('dashboard.totalCpu'),
      value: dynamicInfo ? `${dynamicInfo.cpuLoadPercent.toFixed(1)}%` : `${totalCpu.toFixed(1)}%`,
      description: t('dashboard.totalCpuDesc'),
      icon: Cpu,
      href: '/dashboard/system',
      color: 'text-foreground',
    },
    {
      title: t('dashboard.ramUsage'),
      value: freeRAMBytes != null ? formatBytes(usedRAMBytes) : `${totalRam} MB`,
      description: t('dashboard.ramUsageDesc'),
      icon: Globe,
      href: '/dashboard/system',
      color: 'text-foreground',
    },
  ]

  const securityStats = [
    {
      title: t('dashboard.policies'),
      value: `${enabledPolicies} / ${policies.length}`,
      description: t('dashboard.policiesDesc'),
      icon: ShieldCheck,
      href: '/dashboard/policies',
      color: 'text-foreground',
    },
    {
      title: t('dashboard.credentials'),
      value: credentials.length,
      description: t('dashboard.credentialsDesc'),
      icon: KeyRound,
      href: '/dashboard/credentials',
      color: 'text-foreground',
    },
    {
      title: t('dashboard.requests'),
      value: pendingRequests,
      description: t('dashboard.requestsDesc'),
      icon: FileWarning,
      href: '/dashboard/requests',
      color: pendingRequests > 0 ? 'text-destructive' : 'text-foreground',
    },
    {
      title: t('dashboard.auditLogs'),
      value: logs.length,
      description: t('dashboard.auditLogsDesc'),
      icon: ScrollText,
      href: '/dashboard/audit',
      color: 'text-foreground',
    },
  ]

  return (
    <>
      <DashboardHeader title={t('dashboard.title')} />
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          {/* Monitor section */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('dashboard.monitor')}
            </h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {monitorStats.map((stat) => (
                <Link key={stat.href + stat.title} href={stat.href}>
                  <Card className="transition-colors hover:bg-accent/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-xs font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{stat.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Memory pressure - real data when available */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{t('dashboard.memoryPressure')}</CardTitle>
              <CardDescription>
                {dynamicInfo ? t('dashboard.memoryPressureDescLive') : t('dashboard.memoryPressureDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('dashboard.inUse')}</span>
                <span className="font-mono">
                  {formatBytes(usedRAMBytes)} / {formatBytes(totalRAMBytes)}
                </span>
              </div>
              <Progress value={memUsedPercent} className="h-2" />
              <div className="flex gap-4 text-xs text-muted-foreground">
                {dynamicInfo && (
                  <span>
                    {t('dashboard.pressure')}: <Badge variant="outline" className="text-[9px]">{dynamicInfo.memoryPressure}</Badge>
                  </span>
                )}
                <span>{`${t('agents.title')}: ${totalRam} MB`}</span>
                {battery && battery.percent >= 0 && (
                  <span className="flex items-center gap-1">
                    <Battery className="size-3" />
                    {battery.percent}%
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security section */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('dashboard.security')}
            </h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {securityStats.map((stat) => (
                <Link key={stat.href} href={stat.href}>
                  <Card className="transition-colors hover:bg-accent/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-xs font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <p className="text-[10px] text-muted-foreground">{stat.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent audit logs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('dashboard.recentAuditLogs')}</CardTitle>
              <CardDescription>{t('dashboard.latestEvents')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {logs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col gap-1 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                      <Badge variant="outline" className="w-fit text-[10px]">
                        {log.eventType}
                      </Badge>
                      <span className="text-sm">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString('ja-JP')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
