'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
import { useNetworkDomains, useAccessRequests, useAuditLogs, useReadOnlyMode } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Globe,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  ShieldAlert,
} from 'lucide-react'

export default function NetworkPage() {
  const { domains, addDomain, updateDomain, deleteDomain } = useNetworkDomains()
  const { requests, updateRequest } = useAccessRequests()
  const { addLog } = useAuditLogs()
  const { readOnly } = useReadOnlyMode()

  const [newDomain, setNewDomain] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const pendingNetworkRequests = requests.filter(
    (r) => r.type === 'network' && r.status === 'pending',
  )
  const approvedCount = domains.filter((d) => d.approved).length

  function handleAddDomain() {
    if (!newDomain.trim()) return
    addDomain({
      id: `nd-${Date.now()}`,
      domain: newDomain.trim(),
      approved: true,
      addedAt: new Date().toISOString().split('T')[0],
    })
    addLog({
      eventType: 'NETWORK_DOMAIN_ADDED',
      actor: 'user',
      target: newDomain.trim(),
      details: `${newDomain.trim()} をネットワーク許可リストに追加`,
    })
    setNewDomain('')
    setAddOpen(false)
  }

  function handleApproveRequest(reqId: string, resource: string) {
    updateRequest(reqId, {
      status: 'approved',
      decisionAt: new Date().toISOString(),
    })
    const exists = domains.some((d) => d.domain === resource)
    if (!exists) {
      addDomain({
        id: `nd-${Date.now()}`,
        domain: resource,
        approved: true,
        addedAt: new Date().toISOString().split('T')[0],
      })
    }
    addLog({
      eventType: 'NETWORK_REQUEST_APPROVED',
      actor: 'user',
      target: resource,
      details: `${resource} へのネットワーク接続を承認`,
    })
  }

  function handleDenyRequest(reqId: string, resource: string) {
    updateRequest(reqId, {
      status: 'denied',
      decisionAt: new Date().toISOString(),
    })
    addLog({
      eventType: 'NETWORK_REQUEST_DENIED',
      actor: 'user',
      target: resource,
      details: `${resource} へのネットワーク接続を拒否`,
    })
  }

  return (
    <>
      <DashboardHeader title="ネットワーク" titleEn="Network" />
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-xs text-muted-foreground">許可ドメイン</span>
                <span className="text-2xl font-bold">{approvedCount}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-xs text-muted-foreground">合計ドメイン</span>
                <span className="text-2xl font-bold">{domains.length}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-xs text-muted-foreground">承認待ちリクエスト</span>
                <span className="text-2xl font-bold text-destructive">
                  {pendingNetworkRequests.length}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Pending approval queue */}
          {pendingNetworkRequests.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ShieldAlert className="size-4 text-amber-600" />
                  <span className="text-amber-900">承認待ちリクエスト (Approval Required)</span>
                </CardTitle>
                <CardDescription className="text-amber-700">
                  エージェントからのネットワーク接続リクエスト
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {pendingNetworkRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-col gap-2 rounded-md border border-amber-200 bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <Clock className="size-3.5 text-amber-600" />
                        <span className="text-sm font-medium">{req.resource}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Agent: {req.agentId} -- Action: {req.action}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        disabled={readOnly}
                        onClick={() => handleApproveRequest(req.id, req.resource)}
                      >
                        <CheckCircle2 className="mr-1 size-3.5" />
                        承認
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs text-destructive"
                        disabled={readOnly}
                        onClick={() => handleDenyRequest(req.id, req.resource)}
                      >
                        <XCircle className="mr-1 size-3.5" />
                        拒否
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Allowlist table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm">許可リスト (Allowlist)</CardTitle>
                <CardDescription>エージェントが接続を許可されたドメイン</CardDescription>
              </div>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" disabled={readOnly}>
                    <Plus className="mr-1 size-3.5" />
                    追加
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>ドメインを追加 (Add Domain)</DialogTitle>
                    <DialogDescription>
                      許可リストに新しいドメインを追加します。
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    placeholder="例: api.example.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddDomain()
                    }}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddOpen(false)}>
                      キャンセル
                    </Button>
                    <Button onClick={handleAddDomain} disabled={!newDomain.trim()}>
                      追加する
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {domains.map((domain) => (
                  <div
                    key={domain.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="size-4 text-muted-foreground" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-mono">{domain.domain}</span>
                        <span className="text-[10px] text-muted-foreground">
                          追加日: {domain.addedAt}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {domain.approved ? (
                        <Badge variant="outline" className="gap-1 text-[10px]">
                          <CheckCircle2 className="size-3" />
                          許可
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1 text-[10px]">
                          <XCircle className="size-3" />
                          未承認
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={readOnly}
                        onClick={() => {
                          deleteDomain(domain.id)
                          addLog({
                            eventType: 'NETWORK_DOMAIN_REMOVED',
                            actor: 'user',
                            target: domain.domain,
                            details: `${domain.domain} を許可リストから削除`,
                          })
                        }}
                      >
                        <Trash2 className="size-3.5 text-muted-foreground" />
                        <span className="sr-only">削除</span>
                      </Button>
                    </div>
                  </div>
                ))}
                {domains.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    ドメインが登録されていません
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
