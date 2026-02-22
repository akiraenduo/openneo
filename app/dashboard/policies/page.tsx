'use client'

import { useState, useMemo } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
import { EffectivePolicySummary } from '@/components/policies/effective-summary'
import { PolicyForm } from '@/components/policies/policy-form'
import { PolicyDetailDrawer } from '@/components/policies/policy-detail-drawer'
import { useTranslation } from '@/lib/i18n'
import { usePolicies, useCredentials, useAgents, useAuditLogs, useReadOnlyMode } from '@/lib/store'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import type { Policy } from '@/lib/mockData'

export default function PoliciesPage() {
  const { t } = useTranslation()
  const { policies, addPolicy, updatePolicy, deletePolicy } = usePolicies()
  const { credentials } = useCredentials()
  const { agents } = useAgents()
  const { addLog } = useAuditLogs()
  const { readOnly } = useReadOnlyMode()

  const [search, setSearch] = useState('')
  const [scopeFilter, setScopeFilter] = useState<'all' | 'global' | 'agent'>('all')

  const [createOpen, setCreateOpen] = useState(false)
  const [editPolicy, setEditPolicy] = useState<Policy | null>(null)
  const [viewPolicy, setViewPolicy] = useState<Policy | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Policy | null>(null)

  const filtered = useMemo(() => {
    return policies.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase())
      const matchScope = scopeFilter === 'all' || p.scope === scopeFilter
      return matchSearch && matchScope
    })
  }, [policies, search, scopeFilter])

  function handleCreate(policy: Policy) {
    addPolicy(policy)
    addLog({
      eventType: 'POLICY_CREATED',
      actor: 'user',
      target: policy.id,
      details: `ポリシー「${policy.name}」を作成しました`,
    })
    setCreateOpen(false)
  }

  function handleUpdate(policy: Policy) {
    updatePolicy(policy.id, policy)
    addLog({
      eventType: 'POLICY_UPDATED',
      actor: 'user',
      target: policy.id,
      details: `ポリシー「${policy.name}」を更新しました`,
    })
    setEditPolicy(null)
  }

  function handleDelete() {
    if (!deleteTarget) return
    deletePolicy(deleteTarget.id)
    addLog({
      eventType: 'POLICY_DELETED',
      actor: 'user',
      target: deleteTarget.id,
      details: `ポリシー「${deleteTarget.name}」を削除しました`,
    })
    setDeleteTarget(null)
  }

  function getAgent(id?: string) {
    return agents.find((a) => a.id === id)
  }

  return (
    <>
      <DashboardHeader title={t('policies.title')} />
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          {/* Effective Summary */}
          <EffectivePolicySummary policies={policies} credentials={credentials} />

          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
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
                value={scopeFilter}
                onValueChange={(v) => setScopeFilter(v as 'all' | 'global' | 'agent')}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!readOnly && (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1.5 size-4" />
                {t('policies.createNew')}
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t('policies.name')}</TableHead>
                  <TableHead className="hidden text-xs sm:table-cell">{t('policies.scope')}</TableHead>
                  <TableHead className="text-xs">{t('policies.enabled')}</TableHead>
                  <TableHead className="hidden text-xs md:table-cell">{t('policies.file')}</TableHead>
                  <TableHead className="hidden text-xs md:table-cell">{t('policies.credentialsCol')}</TableHead>
                  <TableHead className="hidden text-xs lg:table-cell">{t('policies.networkCol')}</TableHead>
                  <TableHead className="hidden text-xs lg:table-cell">{t('policies.updated')}</TableHead>
                  <TableHead className="text-right text-xs">{t('policies.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-sm text-muted-foreground">
                      {t('policies.noPolicies')}
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((p) => {
                  const fr = p.rules[0]
                  const cr = p.credentialRules[0]
                  const nr = p.networkRules[0]
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm font-medium">
                        <div className="flex flex-col">
                          <span>{p.name}</span>
                          {p.scope === 'agent' && (
                            <span className="text-[10px] text-muted-foreground">
                              {getAgent(p.agentId)?.name ?? p.agentId}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-[10px]">
                          {p.scope === 'global' ? 'Global' : 'Agent'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={p.enabled ? 'default' : 'secondary'}
                          className="text-[10px]"
                        >
                          {p.enabled ? 'ON' : 'OFF'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {fr && (
                          <span className="text-xs text-muted-foreground">
                            {fr.mode === 'allowlist'
                              ? `${fr.allowedPaths.length} ${t('policies.pathsAllowed')}`
                              : `${fr.deniedPaths.length} ${t('policies.pathsDenied')}`}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {cr && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${cr.mode === 'allowAny' ? 'border-destructive text-destructive' : ''}`}
                          >
                            {cr.mode === 'onlyRegistered'
                              ? t('policies.onlyRegistered')
                              : cr.mode === 'allowNone'
                                ? t('policies.none')
                                : t('policies.allowAll')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {nr && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${nr.mode === 'allowAll' ? 'border-destructive text-destructive' : ''}`}
                          >
                            {nr.mode === 'allowlist'
                              ? `${nr.domains.length} ${t('policies.domains')}`
                              : nr.mode === 'blockAll'
                                ? t('policies.block')
                                : t('policies.allowAll')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                        {new Date(p.updatedAt).toLocaleDateString('ja-JP')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => setViewPolicy(p)}
                            aria-label={t('common.details')}
                          >
                            <Eye className="size-3.5" />
                          </Button>
                          {!readOnly && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => setEditPolicy(p)}
                                aria-label={t('common.edit')}
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-destructive"
                                onClick={() => setDeleteTarget(p)}
                                aria-label={t('common.delete')}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('policies.createPolicy')}</DialogTitle>
            <DialogDescription>
              {t('policies.createPolicyDesc')}
            </DialogDescription>
          </DialogHeader>
          <PolicyForm
            agents={agents}
            credentials={credentials}
            onSave={handleCreate}
            onCancel={() => setCreateOpen(false)}
            readOnly={readOnly}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editPolicy} onOpenChange={() => setEditPolicy(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('policies.editPolicy')}</DialogTitle>
            <DialogDescription>
              {t('policies.editPolicyDesc')}
            </DialogDescription>
          </DialogHeader>
          {editPolicy && (
            <PolicyForm
              initial={editPolicy}
              agents={agents}
              credentials={credentials}
              onSave={handleUpdate}
              onCancel={() => setEditPolicy(null)}
              readOnly={readOnly}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Drawer */}
      <PolicyDetailDrawer
        policy={viewPolicy}
        open={!!viewPolicy}
        onOpenChange={() => setViewPolicy(null)}
        agents={agents}
        credentials={credentials}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              {t('policies.deletePolicy')}
            </DialogTitle>
            <DialogDescription>
              {t('policies.deleteDesc').replace('{name}', deleteTarget?.name ?? '')}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3">
            <p className="text-sm font-medium text-destructive">
              {t('policies.deleteWarning')}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
