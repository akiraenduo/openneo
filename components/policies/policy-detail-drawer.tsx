'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Download, FolderOpen, KeyRound, Globe } from 'lucide-react'
import type { Policy, Agent, Credential } from '@/lib/mockData'

interface PolicyDetailDrawerProps {
  policy: Policy | null
  open: boolean
  onOpenChange: (open: boolean) => void
  agents: Agent[]
  credentials: Credential[]
}

export function PolicyDetailDrawer({
  policy,
  open,
  onOpenChange,
  agents,
  credentials,
}: PolicyDetailDrawerProps) {
  if (!policy) return null

  const agent = agents.find((a) => a.id === policy.agentId)
  const fr = policy.rules[0]
  const cr = policy.credentialRules[0]
  const nr = policy.networkRules[0]

  function exportPolicy() {
    const data = JSON.stringify(policy, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `policy-${policy.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-base">{policy.name}</SheetTitle>
          <SheetDescription>
            {policy.scope === 'global' ? 'グローバルポリシー' : `エージェント: ${agent?.name ?? policy.agentId}`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4">
          <div className="flex items-center gap-2">
            <Badge variant={policy.enabled ? 'default' : 'secondary'}>
              {policy.enabled ? '有効' : '無効'}
            </Badge>
            <Badge variant="outline">{policy.scope === 'global' ? 'Global' : 'Agent'}</Badge>
          </div>

          <div className="text-xs text-muted-foreground">
            作成: {new Date(policy.createdAt).toLocaleString('ja-JP')} / 更新: {new Date(policy.updatedAt).toLocaleString('ja-JP')}
          </div>

          <Separator />

          {/* File Access Rules */}
          {fr && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FolderOpen className="size-4" />
                ファイルアクセス
              </div>
              <div className="rounded-md border p-3">
                <div className="flex flex-wrap gap-1.5 pb-2">
                  <Badge variant="outline" className="text-[10px]">
                    {fr.mode === 'allowlist' ? '許可リスト' : '拒否リスト'}
                  </Badge>
                  {fr.recursive && <Badge variant="outline" className="text-[10px]">再帰</Badge>}
                  {fr.read && <Badge variant="secondary" className="text-[10px]">Read</Badge>}
                  {fr.write && <Badge variant="secondary" className="text-[10px]">Write</Badge>}
                  {fr.delete && <Badge variant="secondary" className="text-[10px]">Delete</Badge>}
                </div>
                {fr.allowedPaths.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground">許可パス:</span>
                    {fr.allowedPaths.map((p) => (
                      <code key={p} className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono">
                        {p}
                      </code>
                    ))}
                  </div>
                )}
                {fr.deniedPaths.length > 0 && (
                  <div className="flex flex-col gap-1 pt-1">
                    <span className="text-[10px] text-muted-foreground">拒否パス:</span>
                    {fr.deniedPaths.map((p) => (
                      <code key={p} className="rounded bg-destructive/10 px-1.5 py-0.5 text-[11px] font-mono text-destructive">
                        {p}
                      </code>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Credential Rules */}
          {cr && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <KeyRound className="size-4" />
                クレデンシャル
              </div>
              <div className="rounded-md border p-3">
                <div className="flex flex-wrap gap-1.5 pb-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${cr.mode === 'allowAny' ? 'border-destructive text-destructive' : ''}`}
                  >
                    {cr.mode === 'onlyRegistered'
                      ? '登録済みのみ'
                      : cr.mode === 'allowNone'
                        ? '使用不可'
                        : '全て許可'}
                  </Badge>
                  {cr.requireApprovalForUse && (
                    <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">
                      承認必要
                    </Badge>
                  )}
                </div>
                {cr.allowedCredentialIds.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground">
                      許可: {cr.allowedCredentialIds.length} 件
                    </span>
                    {cr.allowedCredentialIds.map((id) => {
                      const c = credentials.find((cr) => cr.id === id)
                      return (
                        <span key={id} className="text-xs">
                          {c?.label ?? id}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Network Rules */}
          {nr && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Globe className="size-4" />
                ネットワーク
              </div>
              <div className="rounded-md border p-3">
                <div className="flex flex-wrap gap-1.5 pb-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${nr.mode === 'allowAll' ? 'border-destructive text-destructive' : ''}`}
                  >
                    {nr.mode === 'allowlist'
                      ? '許可リスト'
                      : nr.mode === 'blockAll'
                        ? '全てブロック'
                        : '全て許可'}
                  </Badge>
                  {nr.requireApproval && (
                    <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">
                      承認必要
                    </Badge>
                  )}
                </div>
                {nr.domains.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {nr.domains.map((d) => (
                      <code key={d} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                        {d}
                      </code>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <SheetFooter>
          <Button variant="outline" size="sm" onClick={exportPolicy}>
            <Download className="mr-1.5 size-3.5" />
            エクスポート (Export JSON)
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
