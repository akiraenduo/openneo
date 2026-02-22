'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
import { useAgents } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import {
  Bot,
  Cpu,
  HardDrive,
  Globe,
  Eye,
  Activity,
} from 'lucide-react'
import type { Agent } from '@/lib/mockData'
import { useTranslation } from '@/lib/i18n'

export default function AgentsPage() {
  const { t } = useTranslation()
  const { agents } = useAgents()
  const [viewAgent, setViewAgent] = useState<Agent | null>(null)

  const running = agents.filter((a) => a.status === 'running').length
  const totalCpu = agents.reduce((sum, a) => sum + a.cpuPercent, 0)
  const totalRam = agents.reduce((sum, a) => sum + a.ramMB, 0)

  const statusConfig: Record<Agent['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
    running: { label: t('agents.running'), variant: 'default' },
    idle: { label: t('agents.idle'), variant: 'secondary' },
    blocked: { label: t('agents.blocked'), variant: 'destructive' },
  }

  const networkConfig: Record<Agent['network'], { label: string; color: string }> = {
    local: { label: t('agents.networkLocal'), color: 'text-muted-foreground' },
    approved: { label: t('agents.networkApproved'), color: 'text-foreground' },
    blocked: { label: t('agents.networkBlocked'), color: 'text-destructive' },
  }

  return (
    <>
      <DashboardHeader title={t('agents.title')} />
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-xs text-muted-foreground">{t('agents.totalAgents')}</span>
                <span className="text-2xl font-bold">{agents.length}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-xs text-muted-foreground">{t('agents.running')}</span>
                <span className="text-2xl font-bold">{running}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-xs text-muted-foreground">{t('agents.totalCpu')}</span>
                <span className="text-2xl font-bold">{totalCpu.toFixed(1)}%</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-xs text-muted-foreground">{t('agents.totalRam')}</span>
                <span className="text-2xl font-bold">{totalRam} MB</span>
              </CardContent>
            </Card>
          </div>

          {/* Agent cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {agents.map((agent) => {
              const status = statusConfig[agent.status]
              const net = networkConfig[agent.network]
              return (
                <Card key={agent.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                        <Bot className="size-5 text-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{agent.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{agent.okr}</p>
                      </div>
                    </div>
                    <Badge variant={status.variant} className="text-[10px]">
                      {status.label}
                    </Badge>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {/* Resource usage */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Cpu className="size-3" />
                            CPU
                          </span>
                          <span>{agent.cpuPercent}%</span>
                        </div>
                        <Progress value={agent.cpuPercent} className="h-1.5" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <HardDrive className="size-3" />
                            RAM
                          </span>
                          <span>{agent.ramMB} MB</span>
                        </div>
                        <Progress value={Math.min((agent.ramMB / 512) * 100, 100)} className="h-1.5" />
                      </div>
                    </div>

                    {/* Network & action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Globe className="size-3.5 text-muted-foreground" />
                        <span className={`text-xs ${net.color}`}>{net.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{agent.lastAction}</span>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1">
                      {agent.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-[10px]">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 w-full"
                      onClick={() => setViewAgent(agent)}
                    >
                      <Eye className="mr-1.5 size-3.5" />
                      {t('agents.viewDetails')}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Agent detail drawer */}
      <Sheet open={!!viewAgent} onOpenChange={() => setViewAgent(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Bot className="size-5" />
              {viewAgent?.name}
            </SheetTitle>
            <SheetDescription>{viewAgent?.okr}</SheetDescription>
          </SheetHeader>
          {viewAgent && (
            <div className="flex flex-col gap-4 px-4">
              <div className="flex items-center gap-2">
                <Badge variant={statusConfig[viewAgent.status].variant}>
                  {statusConfig[viewAgent.status].label}
                </Badge>
                <Badge variant="outline">{networkConfig[viewAgent.network].label}</Badge>
                {viewAgent.openAtLogin && (
                  <Badge variant="secondary" className="text-[10px]">{t('agents.openAtLogin')}</Badge>
                )}
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium">{t('agents.resourceUsage')}</span>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Cpu className="size-3.5" />
                      CPU
                    </span>
                    <span className="font-mono">{viewAgent.cpuPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <HardDrive className="size-3.5" />
                      RAM
                    </span>
                    <span className="font-mono">{viewAgent.ramMB} MB</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium">{t('agents.skills')}</span>
                <div className="flex flex-wrap gap-1">
                  {viewAgent.skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium">{t('agents.permissions')}</span>
                <div className="flex flex-wrap gap-1">
                  {viewAgent.permissions.map((perm) => (
                    <Badge key={perm} variant="secondary" className="text-xs">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium flex items-center gap-1.5">
                  <Activity className="size-3.5" />
                  {t('agents.recentActions')}
                </span>
                <div className="flex flex-col gap-2">
                  {viewAgent.recentActions.map((action, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-md border p-2.5"
                    >
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                        {action.time}
                      </span>
                      <span className="text-sm">{action.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
