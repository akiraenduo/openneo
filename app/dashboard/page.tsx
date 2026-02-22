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
} from 'lucide-react'
import {
  usePolicies,
  useCredentials,
  useAccessRequests,
  useAuditLogs,
  useAgents,
  useJobs,
} from '@/lib/store'
import Link from 'next/link'

export default function DashboardPage() {
  const { policies } = usePolicies()
  const { credentials } = useCredentials()
  const { requests } = useAccessRequests()
  const { logs } = useAuditLogs()
  const { agents } = useAgents()
  const { jobs } = useJobs()

  const enabledPolicies = policies.filter((p) => p.enabled).length
  const pendingRequests = requests.filter((r) => r.status === 'pending').length
  const runningAgents = agents.filter((a) => a.status === 'running').length
  const runningJobs = jobs.filter((j) => j.status === 'running').length
  const totalCpu = agents.reduce((s, a) => s + a.cpuPercent, 0)
  const totalRam = agents.reduce((s, a) => s + a.ramMB, 0)

  const monitorStats = [
    {
      title: 'エージェント',
      titleEn: 'Agents',
      value: `${runningAgents} / ${agents.length}`,
      description: '実行中 / 合計',
      icon: Bot,
      href: '/dashboard/agents',
      color: 'text-foreground',
    },
    {
      title: 'ジョブ',
      titleEn: 'Jobs',
      value: runningJobs,
      description: '実行中',
      icon: ListTodo,
      href: '/dashboard/jobs',
      color: 'text-foreground',
    },
    {
      title: 'CPU 合計',
      titleEn: 'Total CPU',
      value: `${totalCpu.toFixed(1)}%`,
      description: '全エージェント',
      icon: Cpu,
      href: '/dashboard/agents',
      color: 'text-foreground',
    },
    {
      title: 'RAM 使用量',
      titleEn: 'RAM Usage',
      value: `${totalRam} MB`,
      description: '全エージェント',
      icon: Globe,
      href: '/dashboard/agents',
      color: 'text-foreground',
    },
  ]

  const securityStats = [
    {
      title: 'ポリシー',
      titleEn: 'Policies',
      value: `${enabledPolicies} / ${policies.length}`,
      description: '有効 / 合計',
      icon: ShieldCheck,
      href: '/dashboard/policies',
      color: 'text-foreground',
    },
    {
      title: 'クレデンシャル',
      titleEn: 'Credentials',
      value: credentials.length,
      description: '登録済み',
      icon: KeyRound,
      href: '/dashboard/credentials',
      color: 'text-foreground',
    },
    {
      title: 'アクセス要求',
      titleEn: 'Requests',
      value: pendingRequests,
      description: '承認待ち',
      icon: FileWarning,
      href: '/dashboard/requests',
      color: pendingRequests > 0 ? 'text-destructive' : 'text-foreground',
    },
    {
      title: '監査ログ',
      titleEn: 'Audit Logs',
      value: logs.length,
      description: '記録数',
      icon: ScrollText,
      href: '/dashboard/audit',
      color: 'text-foreground',
    },
  ]

  return (
    <>
      <DashboardHeader title="ダッシュボード" titleEn="Dashboard" />
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          {/* Monitor section */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              モニター (Monitor)
            </h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {monitorStats.map((stat) => (
                <Link key={stat.href + stat.titleEn} href={stat.href}>
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

          {/* Memory pressure mock */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">メモリプレッシャー (Memory Pressure)</CardTitle>
              <CardDescription>システム全体のメモリ使用状況 (Mock)</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">使用中</span>
                <span className="font-mono">{totalRam} MB / 36,864 MB</span>
              </div>
              <Progress value={Math.min((totalRam / 36864) * 100, 100)} className="h-2" />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>ローカル LLM: 4,200 MB</span>
                <span>エージェント: {totalRam} MB</span>
                <span>システム: 8,400 MB</span>
              </div>
            </CardContent>
          </Card>

          {/* Security section */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              セキュリティ (Security)
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
              <CardTitle className="text-sm">最近の監査ログ (Recent Audit Logs)</CardTitle>
              <CardDescription>最新5件のイベント</CardDescription>
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
