'use client'

import { useState, useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChipInput } from '@/components/chip-input'
import { AlertTriangle, ShieldAlert, Info } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import type { Policy, Agent, Credential, FileAccessRule, CredentialRule, NetworkRule } from '@/lib/mockData'

interface PolicyFormProps {
  initial?: Policy
  agents: Agent[]
  credentials: Credential[]
  onSave: (policy: Policy) => void
  onCancel: () => void
  readOnly?: boolean
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function emptyFileRule(): FileAccessRule {
  return {
    id: makeId(),
    mode: 'allowlist',
    allowedPaths: [],
    deniedPaths: [],
    recursive: true,
    read: true,
    write: false,
    delete: false,
  }
}

function emptyCredRule(): CredentialRule {
  return {
    id: makeId(),
    mode: 'onlyRegistered',
    allowedCredentialIds: [],
    requireApprovalForUse: true,
  }
}

function emptyNetRule(): NetworkRule {
  return {
    id: makeId(),
    mode: 'allowlist',
    domains: [],
    requireApproval: true,
  }
}

export function PolicyForm({ initial, agents, credentials, onSave, onCancel, readOnly }: PolicyFormProps) {
  const isEdit = !!initial

  const [name, setName] = useState(initial?.name ?? '')
  const [scope, setScope] = useState<'global' | 'agent'>(initial?.scope ?? 'global')
  const [agentId, setAgentId] = useState(initial?.agentId ?? '')
  const [enabled, setEnabled] = useState(initial?.enabled ?? true)
  const [fileRule, setFileRule] = useState<FileAccessRule>(
    initial?.rules[0] ?? emptyFileRule(),
  )
  const [credRule, setCredRule] = useState<CredentialRule>(
    initial?.credentialRules[0] ?? emptyCredRule(),
  )
  const [netRule, setNetRule] = useState<NetworkRule>(
    initial?.networkRules[0] ?? emptyNetRule(),
  )
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Validation
  function validate(): string[] {
    const errs: string[] = []
    if (!name.trim()) errs.push('ポリシー名は必須です。')
    if (scope === 'agent' && !agentId) errs.push('エージェントを選択してください。')
    if (fileRule.mode === 'allowlist' && fileRule.allowedPaths.length === 0)
      errs.push('許可リストモードでは、少なくとも1つの許可パスが必要です。')
    if (credRule.mode === 'onlyRegistered' && credRule.allowedCredentialIds.length === 0)
      errs.push('登録済みモードでは、少なくとも1つのクレデンシャルを選択してください。')
    if (netRule.mode === 'allowlist' && netRule.domains.length === 0)
      errs.push('許可リストモードでは、少なくとも1つのドメインが必要です。')
    return errs
  }

  // Impact preview
  const impactPreview = useMemo(() => {
    const items: string[] = []
    if (fileRule.mode === 'allowlist') {
      items.push(
        `ファイルアクセス: 許可パス以外のファイルへのアクセスがブロックされます。(${fileRule.allowedPaths.length} パス許可)`,
      )
    }
    if (fileRule.mode === 'denylist') {
      items.push(
        `ファイルアクセス: 拒否リストのパスへのアクセスがブロックされます。(${fileRule.deniedPaths.length} パス拒否)`,
      )
    }
    if (!fileRule.write) items.push('ファイル書き込みが禁止されます。')
    if (!fileRule.delete) items.push('ファイル削除が禁止されます。')
    if (credRule.mode === 'onlyRegistered') {
      items.push(
        `クレデンシャル: 未登録のID/パスワードの使用がブロックされます。(${credRule.allowedCredentialIds.length} 件許可)`,
      )
    }
    if (credRule.mode === 'allowNone') items.push('クレデンシャル: 全てのクレデンシャル使用がブロックされます。')
    if (credRule.requireApprovalForUse) items.push('クレデンシャル使用時に承認が必要になります。')
    if (netRule.mode === 'blockAll') items.push('ネットワーク: 全ての外部リクエストがブロックされます。')
    if (netRule.mode === 'allowlist') {
      items.push(`ネットワーク: 許可ドメイン以外へのリクエストがブロックされます。(${netRule.domains.length} ドメイン許可)`)
    }
    if (netRule.requireApproval) items.push('外部リクエスト時に承認が必要になります。')
    return items
  }, [fileRule, credRule, netRule])

  function handleSave() {
    const errs = validate()
    if (errs.length > 0) {
      setErrors(errs)
      return
    }
    const now = new Date().toISOString()
    const policy: Policy = {
      id: initial?.id ?? `policy-${makeId()}`,
      name,
      scope,
      agentId: scope === 'agent' ? agentId : undefined,
      enabled,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
      rules: [fileRule],
      credentialRules: [credRule],
      networkRules: [netRule],
    }
    onSave(policy)
  }

  return (
    <div className="flex flex-col gap-4">
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>
            <ul className="list-inside list-disc text-sm">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="general">基本 (General)</TabsTrigger>
          <TabsTrigger value="file">ファイル (File)</TabsTrigger>
          <TabsTrigger value="credential">認証情報 (Cred)</TabsTrigger>
          <TabsTrigger value="network">ネットワーク (Net)</TabsTrigger>
        </TabsList>

        {/* ── General ── */}
        <TabsContent value="general" className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="policy-name">ポリシー名 (Name)</Label>
            <Input
              id="policy-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: グローバルセキュリティポリシー"
              disabled={readOnly}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>スコープ (Scope)</Label>
            <RadioGroup
              value={scope}
              onValueChange={(v) => setScope(v as 'global' | 'agent')}
              disabled={readOnly}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="global" id="scope-global" />
                <Label htmlFor="scope-global" className="text-sm">グローバル (Global)</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="agent" id="scope-agent" />
                <Label htmlFor="scope-agent" className="text-sm">エージェント (Agent)</Label>
              </div>
            </RadioGroup>
          </div>

          {scope === 'agent' && (
            <div className="flex flex-col gap-2">
              <Label>対象エージェント (Target Agent)</Label>
              <Select value={agentId} onValueChange={setAgentId} disabled={readOnly}>
                <SelectTrigger>
                  <SelectValue placeholder="エージェントを選択" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Switch
              id="policy-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
              disabled={readOnly}
            />
            <Label htmlFor="policy-enabled" className="text-sm">
              有効 (Enabled)
            </Label>
          </div>
        </TabsContent>

        {/* ── File Access ── */}
        <TabsContent value="file" className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label>モード (Mode)</Label>
            <RadioGroup
              value={fileRule.mode}
              onValueChange={(v) =>
                setFileRule({ ...fileRule, mode: v as 'allowlist' | 'denylist' })
              }
              disabled={readOnly}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="allowlist" id="file-allowlist" />
                <Label htmlFor="file-allowlist" className="text-sm">
                  許可リスト (Allowlist)
                </Label>
                <Badge variant="outline" className="text-[10px]">推奨</Badge>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="denylist" id="file-denylist" />
                <Label htmlFor="file-denylist" className="text-sm">
                  拒否リスト (Denylist)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {fileRule.mode === 'allowlist' && (
            <div className="flex flex-col gap-2">
              <Label>許可パス (Allowed Paths)</Label>
              <ChipInput
                values={fileRule.allowedPaths}
                onChange={(paths) =>
                  setFileRule({ ...fileRule, allowedPaths: paths })
                }
                placeholder="パスを入力して Enter (例: /Users/akira/Projects)"
                disabled={readOnly}
              />
            </div>
          )}

          {fileRule.mode === 'denylist' && (
            <div className="flex flex-col gap-2">
              <Label>拒否パス (Denied Paths)</Label>
              <ChipInput
                values={fileRule.deniedPaths}
                onChange={(paths) =>
                  setFileRule({ ...fileRule, deniedPaths: paths })
                }
                placeholder="パスを入力して Enter"
                disabled={readOnly}
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <Switch
              checked={fileRule.recursive}
              onCheckedChange={(v) =>
                setFileRule({ ...fileRule, recursive: v })
              }
              disabled={readOnly}
            />
            <Label className="text-sm">サブディレクトリを含む (Recursive)</Label>
          </div>

          <div className="flex flex-col gap-2">
            <Label>権限 (Permissions)</Label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={fileRule.read}
                  onCheckedChange={(v) =>
                    setFileRule({ ...fileRule, read: !!v })
                  }
                  disabled={readOnly}
                />
                読み取り (Read)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={fileRule.write}
                  onCheckedChange={(v) =>
                    setFileRule({ ...fileRule, write: !!v })
                  }
                  disabled={readOnly}
                />
                書き込み (Write)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={fileRule.delete}
                  onCheckedChange={(v) =>
                    setFileRule({ ...fileRule, delete: !!v })
                  }
                  disabled={readOnly}
                />
                削除 (Delete)
              </label>
            </div>
          </div>

          <Alert>
            <ShieldAlert className="size-4" />
            <AlertDescription className="text-sm">
              {fileRule.mode === 'allowlist'
                ? 'エージェントは許可されたパス以外のファイルにアクセスできなくなります。'
                : 'エージェントは拒否リストのパスにアクセスできなくなります。'}
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* ── Credentials ── */}
        <TabsContent value="credential" className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label>モード (Mode)</Label>
            <RadioGroup
              value={credRule.mode}
              onValueChange={(v) =>
                setCredRule({ ...credRule, mode: v as CredentialRule['mode'] })
              }
              disabled={readOnly}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="onlyRegistered" id="cred-only" />
                <Label htmlFor="cred-only" className="text-sm">
                  登録済みのみ (Only Registered)
                </Label>
                <Badge variant="outline" className="text-[10px]">推奨</Badge>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="allowNone" id="cred-none" />
                <Label htmlFor="cred-none" className="text-sm">
                  使用不可 (Allow None)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="allowAny" id="cred-any" />
                <Label htmlFor="cred-any" className="text-sm">
                  全て許可 (Allow Any)
                </Label>
                <Badge variant="destructive" className="text-[10px]">危険</Badge>
              </div>
            </RadioGroup>
          </div>

          {credRule.mode === 'onlyRegistered' && (
            <div className="flex flex-col gap-2">
              <Label>許可クレデンシャル (Allowed Credentials)</Label>
              <div className="flex flex-col gap-2 rounded-md border p-3">
                {credentials.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={credRule.allowedCredentialIds.includes(c.id)}
                      onCheckedChange={(checked) => {
                        if (readOnly) return
                        const ids = checked
                          ? [...credRule.allowedCredentialIds, c.id]
                          : credRule.allowedCredentialIds.filter((id) => id !== c.id)
                        setCredRule({ ...credRule, allowedCredentialIds: ids })
                      }}
                      disabled={readOnly}
                    />
                    {c.label}
                    <span className="text-muted-foreground">({c.username})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Switch
              checked={credRule.requireApprovalForUse}
              onCheckedChange={(v) =>
                setCredRule({ ...credRule, requireApprovalForUse: v })
              }
              disabled={readOnly}
            />
            <Label className="text-sm">使用時に承認を要求 (Require Approval)</Label>
          </div>

          {credRule.mode === 'onlyRegistered' && (
            <Alert>
              <ShieldAlert className="size-4" />
              <AlertDescription className="text-sm">
                エージェントは未登録のID/パスワードを使用できなくなります。
              </AlertDescription>
            </Alert>
          )}

          {credRule.mode === 'allowAny' && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription className="text-sm">
                警告: エージェントが任意のクレデンシャルを使用できます。本番環境では非推奨です。
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* ── Network ── */}
        <TabsContent value="network" className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label>モード (Mode)</Label>
            <RadioGroup
              value={netRule.mode}
              onValueChange={(v) =>
                setNetRule({ ...netRule, mode: v as NetworkRule['mode'] })
              }
              disabled={readOnly}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="blockAll" id="net-block" />
                <Label htmlFor="net-block" className="text-sm">
                  全てブロック (Block All)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="allowlist" id="net-allow" />
                <Label htmlFor="net-allow" className="text-sm">
                  許可リスト (Allowlist)
                </Label>
                <Badge variant="outline" className="text-[10px]">推奨</Badge>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="allowAll" id="net-all" />
                <Label htmlFor="net-all" className="text-sm">
                  全て許可 (Allow All)
                </Label>
                <Badge variant="destructive" className="text-[10px]">危険</Badge>
              </div>
            </RadioGroup>
          </div>

          {netRule.mode === 'allowlist' && (
            <div className="flex flex-col gap-2">
              <Label>許可ドメイン (Allowed Domains)</Label>
              <ChipInput
                values={netRule.domains}
                onChange={(domains) =>
                  setNetRule({ ...netRule, domains })
                }
                placeholder="ドメインを入力して Enter (例: api.openai.com)"
                disabled={readOnly}
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <Switch
              checked={netRule.requireApproval}
              onCheckedChange={(v) =>
                setNetRule({ ...netRule, requireApproval: v })
              }
              disabled={readOnly}
            />
            <Label className="text-sm">外部リクエスト時に承認を要求 (Require Approval)</Label>
          </div>

          {netRule.mode === 'allowAll' && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription className="text-sm">
                警告: エージェントが任意の外部サービスにアクセスできます。本番環境では非推奨です。
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      {/* Impact Preview */}
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="w-fit"
        >
          <Info className="mr-1.5 size-3.5" />
          {showPreview ? '影響プレビューを隠す' : '影響プレビューを表示 (Preview Impact)'}
        </Button>
        {showPreview && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">
                この設定が適用された場合の影響:
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-1.5">
                {impactPreview.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actions */}
      {!readOnly && (
        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>
            {isEdit ? '更新する (Update)' : '作成する (Create)'}
          </Button>
        </div>
      )}
    </div>
  )
}
