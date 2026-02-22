'use client'

import { useState, useMemo } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
import { useTranslation } from '@/lib/i18n'
import {
  useAccessRequests,
  useAgents,
  usePolicies,
  useAuditLogs,
  useReadOnlyMode,
} from '@/lib/store'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Search,
  Check,
  X,
  ShieldPlus,
  FolderOpen,
  KeyRound,
  Globe,
} from 'lucide-react'
import type { AccessRequest, Policy } from '@/lib/mockData'

const typeIcons: Record<string, typeof FolderOpen> = {
  file: FolderOpen,
  network: Globe,
  credential: KeyRound,
}

export default function RequestsPage() {
  const { t } = useTranslation()
  const { requests, updateRequest } = useAccessRequests()
  const { agents } = useAgents()
  const { policies, updatePolicy } = usePolicies()
  const { addLog } = useAuditLogs()
  const { readOnly } = useReadOnlyMode()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('all')
  const [alwaysAllowReq, setAlwaysAllowReq] = useState<AccessRequest | null>(null)
  const [selectedPolicyId, setSelectedPolicyId] = useState('')

  const typeLabels: Record<string, string> = {
    file: t('requests.file'),
    network: t('requests.network'),
    credential: t('requests.credential'),
  }

  const statusLabels: Record<string, string> = {
    pending: t('requests.pending'),
    approved: t('requests.approved'),
    denied: t('requests.denied'),
  }

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        r.resource.toLowerCase().includes(search.toLowerCase()) ||
        getAgentName(r.agentId).toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || r.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [requests, search, statusFilter])

  const pending = filtered.filter((r) => r.status === 'pending')
  const resolved = filtered.filter((r) => r.status !== 'pending')

  function getAgentName(id: string) {
    return agents.find((a) => a.id === id)?.name ?? id
  }

  function handleApprove(req: AccessRequest) {
    updateRequest(req.id, {
      status: 'approved',
      decisionAt: new Date().toISOString(),
    })
    addLog({
      eventType: 'ACCESS_APPROVED',
      actor: 'user',
      target: req.id,
      details: `${getAgentName(req.agentId)} の ${req.resource} へのアクセスを承認しました`,
    })
  }

  function handleDeny(req: AccessRequest) {
    updateRequest(req.id, {
      status: 'denied',
      decisionAt: new Date().toISOString(),
    })
    addLog({
      eventType: 'ACCESS_DENIED',
      actor: 'user',
      target: req.id,
      details: `${getAgentName(req.agentId)} の ${req.resource} へのアクセスを拒否しました`,
    })
  }

  function handleAlwaysAllow() {
    if (!alwaysAllowReq || !selectedPolicyId) return
    const policy = policies.find((p) => p.id === selectedPolicyId)
    if (!policy) return

    // Add resource to the appropriate rule
    if (alwaysAllowReq.type === 'file') {
      const rules = [...policy.rules]
      if (rules.length > 0) {
        rules[0] = {
          ...rules[0],
          allowedPaths: [...rules[0].allowedPaths, alwaysAllowReq.resource],
        }
      }
      updatePolicy(policy.id, { rules })
    } else if (alwaysAllowReq.type === 'credential') {
      const credRules = [...policy.credentialRules]
      if (credRules.length > 0) {
        credRules[0] = {
          ...credRules[0],
          allowedCredentialIds: [
            ...credRules[0].allowedCredentialIds,
            alwaysAllowReq.resource,
          ],
        }
      }
      updatePolicy(policy.id, { credentialRules: credRules })
    } else if (alwaysAllowReq.type === 'network') {
      const netRules = [...policy.networkRules]
      if (netRules.length > 0) {
        netRules[0] = {
          ...netRules[0],
          domains: [...netRules[0].domains, alwaysAllowReq.resource],
        }
      }
      updatePolicy(policy.id, { networkRules: netRules })
    }

    // Approve the request
    handleApprove(alwaysAllowReq)

    addLog({
      eventType: 'POLICY_UPDATED',
      actor: 'user',
      target: policy.id,
      details: `ポリシー「${policy.name}」に ${alwaysAllowReq.resource} を追加しました (常時許可)`,
    })

    setAlwaysAllowReq(null)
    setSelectedPolicyId('')
  }

  function requestDescription(req: AccessRequest) {
    const agent = getAgentName(req.agentId)
    switch (req.type) {
      case 'file':
        return t('requests.descFile').replace('{agent}', agent).replace('{resource}', req.resource).replace('{action}', req.action)
      case 'credential':
        return t('requests.descCredential').replace('{agent}', agent).replace('{resource}', req.resource)
      case 'network':
        return t('requests.descNetwork').replace('{agent}', agent).replace('{resource}', req.resource)
      default:
        return req.resource
    }
  }

  function renderRequestRow(req: AccessRequest) {
    const Icon = typeIcons[req.type] ?? FolderOpen
    const isPending = req.status === 'pending'

    return (
      <TableRow key={req.id}>
        <TableCell>
          <div className="flex items-start gap-2">
            <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm">{requestDescription(req)}</span>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-[10px]">
                  {typeLabels[req.type]}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(req.requestedAt).toLocaleString('ja-JP')}
                </span>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge
            variant={
              req.status === 'approved'
                ? 'default'
                : req.status === 'denied'
                  ? 'destructive'
                  : 'secondary'
            }
            className="text-[10px]"
          >
            {statusLabels[req.status]}
          </Badge>
        </TableCell>
        <TableCell>
          {isPending && !readOnly && (
            <div className="flex flex-wrap items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => handleApprove(req)}
              >
                <Check className="mr-1 size-3" />
                {t('common.approve')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs text-destructive"
                onClick={() => handleDeny(req)}
              >
                <X className="mr-1 size-3" />
                {t('common.deny')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => {
                  setAlwaysAllowReq(req)
                  setSelectedPolicyId('')
                }}
              >
                <ShieldPlus className="mr-1 size-3" />
                {t('requests.alwaysAllow')}
              </Button>
            </div>
          )}
          {!isPending && req.decisionAt && (
            <span className="text-[10px] text-muted-foreground">
              {new Date(req.decisionAt).toLocaleString('ja-JP')}
            </span>
          )}
        </TableCell>
      </TableRow>
    )
  }

  return (
    <>
      <DashboardHeader title={t('requests.title')} />
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
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter(v as 'all' | 'pending' | 'approved' | 'denied')
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="pending">{t('requests.pending')}</SelectItem>
                <SelectItem value="approved">{t('requests.approved')}</SelectItem>
                <SelectItem value="denied">{t('requests.denied')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">
                {`${t('requests.pending')} (${pending.length})`}
              </TabsTrigger>
              <TabsTrigger value="resolved">
                {`${t('requests.resolved')} (${resolved.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="pt-2">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">{t('requests.request')}</TableHead>
                      <TableHead className="text-xs">{t('requests.status')}</TableHead>
                      <TableHead className="text-xs">{t('requests.action')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pending.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-sm text-muted-foreground">
                          {t('requests.noPending')}
                        </TableCell>
                      </TableRow>
                    )}
                    {pending.map(renderRequestRow)}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="resolved" className="pt-2">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">{t('requests.request')}</TableHead>
                      <TableHead className="text-xs">{t('requests.status')}</TableHead>
                      <TableHead className="text-xs">{t('requests.decisionTime')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resolved.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-sm text-muted-foreground">
                          {t('requests.noResolved')}
                        </TableCell>
                      </TableRow>
                    )}
                    {resolved.map(renderRequestRow)}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Always Allow Modal */}
      <Dialog open={!!alwaysAllowReq} onOpenChange={() => setAlwaysAllowReq(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldPlus className="size-5" />
              {t('requests.alwaysAllow')}
            </DialogTitle>
            <DialogDescription>
              {t('requests.alwaysAllowDesc')}
            </DialogDescription>
          </DialogHeader>
          {alwaysAllowReq && (
            <div className="flex flex-col gap-4">
              <div className="rounded-md border p-3">
                <p className="text-sm">{requestDescription(alwaysAllowReq)}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {t('requests.resource')} {alwaysAllowReq.resource}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t('requests.targetPolicy')}</Label>
                <Select
                  value={selectedPolicyId}
                  onValueChange={setSelectedPolicyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('requests.selectPolicy')} />
                  </SelectTrigger>
                  <SelectContent>
                    {policies
                      .filter((p) => p.enabled)
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.scope})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlwaysAllowReq(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleAlwaysAllow} disabled={!selectedPolicyId}>
              {t('requests.addToPolicyAndApprove')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
