'use client'

import { useState, useMemo } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
import { useTranslation } from '@/lib/i18n'
import { useCredentials, useAuditLogs, useReadOnlyMode } from '@/lib/store'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChipInput } from '@/components/chip-input'
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  Copy,
  KeyRound,
  Shield,
} from 'lucide-react'
import type { Credential } from '@/lib/mockData'

export default function CredentialsPage() {
  const { t } = useTranslation()
  const { credentials, addCredential, updateCredential, deleteCredential } =
    useCredentials()
  const { addLog } = useAuditLogs()
  const { readOnly } = useReadOnlyMode()

  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editCred, setEditCred] = useState<Credential | null>(null)
  const [viewCred, setViewCred] = useState<Credential | null>(null)
  const [deleteCred, setDeleteCred] = useState<Credential | null>(null)
  const [secretWarningOpen, setSecretWarningOpen] = useState(false)

  // Create form state
  const [formLabel, setFormLabel] = useState('')
  const [formUsername, setFormUsername] = useState('')
  const [formSecret, setFormSecret] = useState('')
  const [formTags, setFormTags] = useState<string[]>([])
  const [formErrors, setFormErrors] = useState<string[]>([])

  const filtered = useMemo(() => {
    return credentials.filter(
      (c) =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.username.toLowerCase().includes(search.toLowerCase()) ||
        c.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())),
    )
  }, [credentials, search])

  function resetForm() {
    setFormLabel('')
    setFormUsername('')
    setFormSecret('')
    setFormTags([])
    setFormErrors([])
  }

  function openCreate() {
    resetForm()
    setCreateOpen(true)
  }

  function openEdit(c: Credential) {
    setFormLabel(c.label)
    setFormUsername(c.username)
    setFormSecret('')
    setFormTags([...c.tags])
    setFormErrors([])
    setEditCred(c)
  }

  function validateForm(): string[] {
    const errs: string[] = []
    if (!formLabel.trim()) errs.push(t('credentials.labelRequired'))
    if (!formUsername.trim()) errs.push(t('credentials.usernameRequired'))
    if (!editCred && !formSecret.trim()) errs.push(t('credentials.secretRequired'))
    return errs
  }

  function handleCreate() {
    const errs = validateForm()
    if (errs.length > 0) {
      setFormErrors(errs)
      return
    }
    const now = new Date().toISOString()
    const cred: Credential = {
      id: `cred-${Date.now()}`,
      label: formLabel.trim(),
      username: formUsername.trim(),
      secretMasked: '\u2022'.repeat(12),
      createdAt: now,
      tags: formTags,
    }
    addCredential(cred)
    addLog({
      eventType: 'CREDENTIAL_CREATED',
      actor: 'user',
      target: cred.id,
      details: `クレデンシャル「${cred.label}」を登録しました`,
    })
    setCreateOpen(false)
    resetForm()
  }

  function handleUpdate() {
    if (!editCred) return
    const errs = validateForm()
    if (errs.length > 0) {
      setFormErrors(errs)
      return
    }
    updateCredential(editCred.id, {
      label: formLabel.trim(),
      username: formUsername.trim(),
      tags: formTags,
      ...(formSecret.trim()
        ? { secretMasked: '\u2022'.repeat(12) }
        : {}),
    })
    addLog({
      eventType: 'CREDENTIAL_UPDATED',
      actor: 'user',
      target: editCred.id,
      details: `クレデンシャル「${formLabel}」を更新しました`,
    })
    setEditCred(null)
    resetForm()
  }

  function handleDelete() {
    if (!deleteCred) return
    deleteCredential(deleteCred.id)
    addLog({
      eventType: 'CREDENTIAL_DELETED',
      actor: 'user',
      target: deleteCred.id,
      details: `クレデンシャル「${deleteCred.label}」を削除しました`,
    })
    setDeleteCred(null)
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  const credForm = (
    <div className="flex flex-col gap-4">
      {formErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>
            <ul className="list-inside list-disc text-sm">
              {formErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="cred-label">{t('credentials.label')}</Label>
        <Input
          id="cred-label"
          value={formLabel}
          onChange={(e) => setFormLabel(e.target.value)}
          placeholder={t('credentials.labelPlaceholder')}
          disabled={readOnly}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="cred-username">{t('credentials.username')}</Label>
        <Input
          id="cred-username"
          value={formUsername}
          onChange={(e) => setFormUsername(e.target.value)}
          placeholder={t('credentials.usernamePlaceholder')}
          disabled={readOnly}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="cred-secret">
          {t('credentials.secret')}
        </Label>
        <Input
          id="cred-secret"
          type="password"
          value={formSecret}
          onChange={(e) => setFormSecret(e.target.value)}
          placeholder={editCred ? t('credentials.secretEditPlaceholder') : t('credentials.secretPlaceholder')}
          disabled={readOnly}
        />
        <p className="text-[10px] text-muted-foreground">
          {t('credentials.secretNote')}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label>{t('credentials.tags')}</Label>
        <ChipInput
          values={formTags}
          onChange={setFormTags}
          placeholder={t('credentials.tagsPlaceholder')}
          disabled={readOnly}
        />
      </div>
    </div>
  )

  return (
    <>
      <DashboardHeader title={t('credentials.title')} />
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          {/* Header info */}
          <Card className="border-foreground/10 bg-accent/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <KeyRound className="size-4" />
                {t('credentials.title')}
                <Badge variant="outline" className="text-[10px]">{t('credentials.vaultBadge')}</Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                {t('credentials.vaultDesc')}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Recommended */}
          <Card>
            <CardContent className="flex items-center gap-3 py-3">
              <Shield className="size-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t('credentials.keychainTitle')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('credentials.keychainDesc')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('common.search')}
                className="pl-8"
              />
            </div>
            {!readOnly && (
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-1.5 size-4" />
                {t('credentials.registerNew')}
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t('credentials.label')}</TableHead>
                  <TableHead className="text-xs">{t('credentials.username')}</TableHead>
                  <TableHead className="hidden text-xs sm:table-cell">{t('credentials.tags')}</TableHead>
                  <TableHead className="hidden text-xs md:table-cell">{t('credentials.lastUsed')}</TableHead>
                  <TableHead className="text-right text-xs">{t('policies.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                      {t('credentials.noCredentials')}
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-sm font-medium">{c.label}</TableCell>
                    <TableCell className="font-mono text-xs">{c.username}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                      {c.lastUsedAt
                        ? new Date(c.lastUsedAt).toLocaleDateString('ja-JP')
                        : t('common.unused')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => setViewCred(c)}
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
                              onClick={() => openEdit(c)}
                              aria-label={t('common.edit')}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive"
                              onClick={() => setDeleteCred(c)}
                              aria-label={t('common.delete')}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('credentials.createTitle')}</DialogTitle>
            <DialogDescription>
              {t('credentials.createDesc')}
            </DialogDescription>
          </DialogHeader>
          {credForm}
          {!readOnly && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleCreate}>{t('common.register')}</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editCred} onOpenChange={() => setEditCred(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('credentials.editTitle')}</DialogTitle>
            <DialogDescription>
              {t('credentials.editDesc')}
            </DialogDescription>
          </DialogHeader>
          {credForm}
          {!readOnly && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditCred(null)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleUpdate}>{t('common.update')}</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Drawer */}
      <Sheet open={!!viewCred} onOpenChange={() => setViewCred(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{viewCred?.label}</SheetTitle>
            <SheetDescription>{t('credentials.detailTitle')}</SheetDescription>
          </SheetHeader>
          {viewCred && (
            <div className="flex flex-col gap-4 px-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{t('credentials.label')}</span>
                <span className="text-sm font-medium">{viewCred.label}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{t('credentials.username')}</span>
                <div className="flex items-center gap-2">
                  <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                    {viewCred.username}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => copyToClipboard(viewCred.username)}
                    aria-label={t('credentials.copyUsername')}
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{t('credentials.secret')}</span>
                <div className="flex items-center gap-2">
                  <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                    {viewCred.secretMasked}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => setSecretWarningOpen(true)}
                    aria-label={t('credentials.copySecret')}
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">{t('credentials.tags')}</span>
                <div className="flex flex-wrap gap-1">
                  {viewCred.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <span>{t('credentials.created')}: {new Date(viewCred.createdAt).toLocaleString('ja-JP')}</span>
                {viewCred.lastUsedAt && (
                  <span>{t('credentials.lastUsed')}: {new Date(viewCred.lastUsedAt).toLocaleString('ja-JP')}</span>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Secret Copy Warning */}
      <Dialog open={secretWarningOpen} onOpenChange={setSecretWarningOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="size-5" />
              {t('credentials.secretCopyWarning')}
            </DialogTitle>
            <DialogDescription>
              {t('credentials.secretCopyWarningDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSecretWarningOpen(false)}>
              {t('common.close')}
            </Button>
            <Button
              onClick={() => {
                copyToClipboard('(demo-secret-not-real)')
                setSecretWarningOpen(false)
              }}
            >
              {t('credentials.copyDemo')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteCred} onOpenChange={() => setDeleteCred(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-5" />
              {t('credentials.deleteTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('credentials.deleteDesc').replace('{label}', deleteCred?.label ?? '')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCred(null)}>
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
