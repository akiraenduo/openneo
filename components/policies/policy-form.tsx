'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from '@/lib/i18n'
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
  const { t } = useTranslation()
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
    if (!name.trim()) errs.push(t('policyForm.policyNameRequired'))
    if (scope === 'agent' && !agentId) errs.push(t('policyForm.agentRequired'))
    if (fileRule.mode === 'allowlist' && fileRule.allowedPaths.length === 0)
      errs.push(t('policyForm.allowlistPathRequired'))
    if (credRule.mode === 'onlyRegistered' && credRule.allowedCredentialIds.length === 0)
      errs.push(t('policyForm.credentialRequired'))
    if (netRule.mode === 'allowlist' && netRule.domains.length === 0)
      errs.push(t('policyForm.domainRequired'))
    return errs
  }

  // Impact preview
  const impactPreview = useMemo(() => {
    const items: string[] = []
    if (fileRule.mode === 'allowlist') {
      items.push(
        t('policyForm.impactFileAllowlist').replace('{count}', String(fileRule.allowedPaths.length)),
      )
    }
    if (fileRule.mode === 'denylist') {
      items.push(
        t('policyForm.impactFileDenylist').replace('{count}', String(fileRule.deniedPaths.length)),
      )
    }
    if (!fileRule.write) items.push(t('policyForm.impactNoWrite'))
    if (!fileRule.delete) items.push(t('policyForm.impactNoDelete'))
    if (credRule.mode === 'onlyRegistered') {
      items.push(
        t('policyForm.impactCredOnlyRegistered').replace('{count}', String(credRule.allowedCredentialIds.length)),
      )
    }
    if (credRule.mode === 'allowNone') items.push(t('policyForm.impactCredAllowNone'))
    if (credRule.requireApprovalForUse) items.push(t('policyForm.impactCredApproval'))
    if (netRule.mode === 'blockAll') items.push(t('policyForm.impactNetBlockAll'))
    if (netRule.mode === 'allowlist') {
      items.push(t('policyForm.impactNetAllowlist').replace('{count}', String(netRule.domains.length)))
    }
    if (netRule.requireApproval) items.push(t('policyForm.impactNetApproval'))
    return items
  }, [fileRule, credRule, netRule, t])

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
          <TabsTrigger value="general">{t('policyForm.general')}</TabsTrigger>
          <TabsTrigger value="file">{t('policyForm.fileTab')}</TabsTrigger>
          <TabsTrigger value="credential">{t('policyForm.credentialTab')}</TabsTrigger>
          <TabsTrigger value="network">{t('policyForm.networkTab')}</TabsTrigger>
        </TabsList>

        {/* -- General -- */}
        <TabsContent value="general" className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="policy-name">{t('policyForm.policyName')}</Label>
            <Input
              id="policy-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('policyForm.policyNamePlaceholder')}
              disabled={readOnly}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t('policyForm.scope')}</Label>
            <RadioGroup
              value={scope}
              onValueChange={(v) => setScope(v as 'global' | 'agent')}
              disabled={readOnly}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="global" id="scope-global" />
                <Label htmlFor="scope-global" className="text-sm">{t('policyForm.global')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="agent" id="scope-agent" />
                <Label htmlFor="scope-agent" className="text-sm">{t('policyForm.agent')}</Label>
              </div>
            </RadioGroup>
          </div>

          {scope === 'agent' && (
            <div className="flex flex-col gap-2">
              <Label>{t('policyForm.targetAgent')}</Label>
              <Select value={agentId} onValueChange={setAgentId} disabled={readOnly}>
                <SelectTrigger>
                  <SelectValue placeholder={t('policyForm.selectAgent')} />
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
              {t('policyForm.enabled')}
            </Label>
          </div>
        </TabsContent>

        {/* -- File Access -- */}
        <TabsContent value="file" className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label>{t('policyForm.mode')}</Label>
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
                  {t('policyForm.allowlist')}
                </Label>
                <Badge variant="outline" className="text-[10px]">{t('common.recommended')}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="denylist" id="file-denylist" />
                <Label htmlFor="file-denylist" className="text-sm">
                  {t('policyForm.denylist')}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {fileRule.mode === 'allowlist' && (
            <div className="flex flex-col gap-2">
              <Label>{t('policyForm.allowedPaths')}</Label>
              <ChipInput
                values={fileRule.allowedPaths}
                onChange={(paths) =>
                  setFileRule({ ...fileRule, allowedPaths: paths })
                }
                placeholder={t('policyForm.allowedPathsPlaceholder')}
                disabled={readOnly}
              />
            </div>
          )}

          {fileRule.mode === 'denylist' && (
            <div className="flex flex-col gap-2">
              <Label>{t('policyForm.deniedPaths')}</Label>
              <ChipInput
                values={fileRule.deniedPaths}
                onChange={(paths) =>
                  setFileRule({ ...fileRule, deniedPaths: paths })
                }
                placeholder={t('policyForm.deniedPathsPlaceholder')}
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
            <Label className="text-sm">{t('policyForm.recursive')}</Label>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t('policyForm.filePermissions')}</Label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={fileRule.read}
                  onCheckedChange={(v) =>
                    setFileRule({ ...fileRule, read: !!v })
                  }
                  disabled={readOnly}
                />
                {t('policyForm.read')}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={fileRule.write}
                  onCheckedChange={(v) =>
                    setFileRule({ ...fileRule, write: !!v })
                  }
                  disabled={readOnly}
                />
                {t('policyForm.write')}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={fileRule.delete}
                  onCheckedChange={(v) =>
                    setFileRule({ ...fileRule, delete: !!v })
                  }
                  disabled={readOnly}
                />
                {t('policyForm.deletePermission')}
              </label>
            </div>
          </div>

          <Alert>
            <ShieldAlert className="size-4" />
            <AlertDescription className="text-sm">
              {fileRule.mode === 'allowlist'
                ? t('policyForm.fileAllowlistAlert')
                : t('policyForm.fileDenylistAlert')}
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* -- Credentials -- */}
        <TabsContent value="credential" className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label>{t('policyForm.mode')}</Label>
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
                  {t('policyForm.credOnlyRegistered')}
                </Label>
                <Badge variant="outline" className="text-[10px]">{t('common.recommended')}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="allowNone" id="cred-none" />
                <Label htmlFor="cred-none" className="text-sm">
                  {t('policyForm.credAllowNone')}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="allowAny" id="cred-any" />
                <Label htmlFor="cred-any" className="text-sm">
                  {t('policyForm.credAllowAny')}
                </Label>
                <Badge variant="destructive" className="text-[10px]">{t('common.danger')}</Badge>
              </div>
            </RadioGroup>
          </div>

          {credRule.mode === 'onlyRegistered' && (
            <div className="flex flex-col gap-2">
              <Label>{t('policyForm.allowedCredentials')}</Label>
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
            <Label className="text-sm">{t('policyForm.requireApproval')}</Label>
          </div>

          {credRule.mode === 'onlyRegistered' && (
            <Alert>
              <ShieldAlert className="size-4" />
              <AlertDescription className="text-sm">
                {t('policyForm.credOnlyRegisteredAlert')}
              </AlertDescription>
            </Alert>
          )}

          {credRule.mode === 'allowAny' && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription className="text-sm">
                {t('policyForm.credAllowAnyAlert')}
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* -- Network -- */}
        <TabsContent value="network" className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label>{t('policyForm.mode')}</Label>
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
                  {t('policyForm.netBlockAll')}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="allowlist" id="net-allow" />
                <Label htmlFor="net-allow" className="text-sm">
                  {t('policyForm.netAllowlist')}
                </Label>
                <Badge variant="outline" className="text-[10px]">{t('common.recommended')}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="allowAll" id="net-all" />
                <Label htmlFor="net-all" className="text-sm">
                  {t('policyForm.netAllowAll')}
                </Label>
                <Badge variant="destructive" className="text-[10px]">{t('common.danger')}</Badge>
              </div>
            </RadioGroup>
          </div>

          {netRule.mode === 'allowlist' && (
            <div className="flex flex-col gap-2">
              <Label>{t('policyForm.allowedDomains')}</Label>
              <ChipInput
                values={netRule.domains}
                onChange={(domains) =>
                  setNetRule({ ...netRule, domains })
                }
                placeholder={t('policyForm.allowedDomainsPlaceholder')}
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
            <Label className="text-sm">{t('policyForm.requireApprovalNet')}</Label>
          </div>

          {netRule.mode === 'allowAll' && (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertDescription className="text-sm">
                {t('policyForm.netAllowAllAlert')}
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
          {showPreview ? t('policyForm.hidePreview') : t('policyForm.showPreview')}
        </Button>
        {showPreview && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs">
                {t('policyForm.impactTitle')}
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
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave}>
            {isEdit ? t('policyForm.updateBtn') : t('policyForm.createBtn')}
          </Button>
        </div>
      )}
    </div>
  )
}
