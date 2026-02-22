'use client'

import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FolderOpen, KeyRound, Globe, ShieldAlert } from 'lucide-react'
import type { Policy, Credential } from '@/lib/mockData'

export function EffectivePolicySummary({
  policies,
  credentials,
}: {
  policies: Policy[]
  credentials: Credential[]
}) {
  const { t } = useTranslation()
  const enabled = policies.filter((p) => p.enabled)

  // Aggregate file paths
  const allAllowedPaths = new Set<string>()
  const allDeniedPaths = new Set<string>()
  let fileMode: 'allowlist' | 'denylist' | 'mixed' = 'allowlist'
  const modes = new Set<string>()

  for (const p of enabled) {
    for (const r of p.rules) {
      modes.add(r.mode)
      r.allowedPaths.forEach((path) => allAllowedPaths.add(path))
      r.deniedPaths.forEach((path) => allDeniedPaths.add(path))
    }
  }
  if (modes.size > 1) fileMode = 'mixed'
  else if (modes.has('denylist')) fileMode = 'denylist'

  // Aggregate credential rules
  const allowedCredIds = new Set<string>()
  let credMode: string = 'onlyRegistered'
  let credApproval = false
  for (const p of enabled) {
    for (const cr of p.credentialRules) {
      credMode = cr.mode
      if (cr.requireApprovalForUse) credApproval = true
      cr.allowedCredentialIds.forEach((id) => allowedCredIds.add(id))
    }
  }
  const allowedCredLabels = credentials
    .filter((c) => allowedCredIds.has(c.id))
    .map((c) => c.label)

  // Aggregate network rules
  const allDomains = new Set<string>()
  let netMode: string = 'allowlist'
  let netApproval = false
  for (const p of enabled) {
    for (const nr of p.networkRules) {
      netMode = nr.mode
      if (nr.requireApproval) netApproval = true
      nr.domains.forEach((d) => allDomains.add(d))
    }
  }

  return (
    <Card className="border-foreground/20 bg-accent/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <ShieldAlert className="size-4" />
          {t('effectiveSummary.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* File Access */}
          <div className="flex flex-col gap-2 rounded-md border bg-background p-3">
            <div className="flex items-center gap-2 text-xs font-medium">
              <FolderOpen className="size-3.5" />
              {t('effectiveSummary.fileAccess')}
            </div>
            <Badge variant="outline" className="w-fit text-[10px]">
              {fileMode === 'allowlist'
                ? t('effectiveSummary.allowlist')
                : fileMode === 'denylist'
                  ? t('effectiveSummary.denylist')
                  : t('effectiveSummary.mixed')}
            </Badge>
            {allAllowedPaths.size > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground">{t('effectiveSummary.allowedPaths')}</span>
                {Array.from(allAllowedPaths).map((p) => (
                  <code
                    key={p}
                    className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono"
                  >
                    {p}
                  </code>
                ))}
              </div>
            )}
          </div>

          {/* Credentials */}
          <div className="flex flex-col gap-2 rounded-md border bg-background p-3">
            <div className="flex items-center gap-2 text-xs font-medium">
              <KeyRound className="size-3.5" />
              {t('effectiveSummary.credentials')}
            </div>
            <Badge
              variant="outline"
              className={`w-fit text-[10px] ${
                credMode === 'allowAny'
                  ? 'border-destructive text-destructive'
                  : ''
              }`}
            >
              {credMode === 'onlyRegistered'
                ? t('effectiveSummary.onlyRegistered')
                : credMode === 'allowNone'
                  ? t('effectiveSummary.allowNone')
                  : t('effectiveSummary.allowAllDanger')}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {t('effectiveSummary.allowedCount').replace('{count}', String(allowedCredLabels.length))}
              {allowedCredLabels.length > 0 && (
                <> ({allowedCredLabels.join(', ')})</>
              )}
            </span>
            {credApproval && (
              <span className="text-[10px] text-amber-600">
                {t('effectiveSummary.approvalRequired')}
              </span>
            )}
          </div>

          {/* Network */}
          <div className="flex flex-col gap-2 rounded-md border bg-background p-3">
            <div className="flex items-center gap-2 text-xs font-medium">
              <Globe className="size-3.5" />
              {t('effectiveSummary.network')}
            </div>
            <Badge
              variant="outline"
              className={`w-fit text-[10px] ${
                netMode === 'allowAll'
                  ? 'border-destructive text-destructive'
                  : ''
              }`}
            >
              {netMode === 'allowlist'
                ? t('effectiveSummary.netAllowlist')
                : netMode === 'blockAll'
                  ? t('effectiveSummary.netBlockAll')
                  : t('effectiveSummary.netAllowAllDanger')}
            </Badge>
            {allDomains.size > 0 && (
              <div className="flex flex-wrap gap-1">
                {Array.from(allDomains).map((d) => (
                  <code
                    key={d}
                    className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono"
                  >
                    {d}
                  </code>
                ))}
              </div>
            )}
            {netApproval && (
              <span className="text-[10px] text-amber-600">
                {t('effectiveSummary.netApprovalRequired')}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
