'use client'

import { useState, useMemo } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
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
        c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
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
    if (!formLabel.trim()) errs.push('ラベルは必須です。')
    if (!formUsername.trim()) errs.push('ユーザー名は必須です。')
    if (!editCred && !formSecret.trim()) errs.push('シークレットは必須です。')
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
        <Label htmlFor="cred-label">ラベル (Label)</Label>
        <Input
          id="cred-label"
          value={formLabel}
          onChange={(e) => setFormLabel(e.target.value)}
          placeholder="例: Gmail-SMTP"
          disabled={readOnly}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="cred-username">ユーザー名 (Username)</Label>
        <Input
          id="cred-username"
          value={formUsername}
          onChange={(e) => setFormUsername(e.target.value)}
          placeholder="例: team@openxxx.io"
          disabled={readOnly}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="cred-secret">
          パスワード / シークレット (Secret)
        </Label>
        <Input
          id="cred-secret"
          type="password"
          value={formSecret}
          onChange={(e) => setFormSecret(e.target.value)}
          placeholder={editCred ? '変更する場合のみ入力' : 'シークレットを入力'}
          disabled={readOnly}
        />
        <p className="text-[10px] text-muted-foreground">
          保存後はマスクされた表示のみになります。(Masked after save)
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label>タグ (Tags)</Label>
        <ChipInput
          values={formTags}
          onChange={setFormTags}
          placeholder="タグを入力して Enter"
          disabled={readOnly}
        />
      </div>
    </div>
  )

  return (
    <>
      <DashboardHeader title="クレデンシャル" titleEn="Credentials Vault" />
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          {/* Header info */}
          <Card className="border-foreground/10 bg-accent/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <KeyRound className="size-4" />
                クレデンシャル保管庫 (Credentials Vault)
                <Badge variant="outline" className="text-[10px]">Frontend Demo</Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                シークレットはUIではマスク表示されます。本番環境ではOS Keychainに保存されます。
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Recommended */}
          <Card>
            <CardContent className="flex items-center gap-3 py-3">
              <Shield className="size-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">推奨: macOS Keychain への保存 (将来対応)</p>
                <p className="text-xs text-muted-foreground">
                  本番環境では、シークレットをOSのセキュアストレージに保管することを推奨します。
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
                placeholder="検索 (Search)..."
                className="pl-8"
              />
            </div>
            {!readOnly && (
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-1.5 size-4" />
                新規登録
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">ラベル (Label)</TableHead>
                  <TableHead className="text-xs">ユーザー名</TableHead>
                  <TableHead className="hidden text-xs sm:table-cell">タグ</TableHead>
                  <TableHead className="hidden text-xs md:table-cell">最終使用</TableHead>
                  <TableHead className="text-right text-xs">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                      クレデンシャルが見つかりません。
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-sm font-medium">{c.label}</TableCell>
                    <TableCell className="font-mono text-xs">{c.username}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px]">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                      {c.lastUsedAt
                        ? new Date(c.lastUsedAt).toLocaleDateString('ja-JP')
                        : '未使用'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => setViewCred(c)}
                          aria-label="詳細"
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
                              aria-label="編集"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-destructive"
                              onClick={() => setDeleteCred(c)}
                              aria-label="削除"
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
            <DialogTitle>クレデンシャルを登録 (Create)</DialogTitle>
            <DialogDescription>
              新しいクレデンシャルを保管庫に追加します。
            </DialogDescription>
          </DialogHeader>
          {credForm}
          {!readOnly && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleCreate}>登録する</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editCred} onOpenChange={() => setEditCred(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>クレデンシャルを編集 (Edit)</DialogTitle>
            <DialogDescription>
              既存のクレデンシャルを変更します。
            </DialogDescription>
          </DialogHeader>
          {credForm}
          {!readOnly && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditCred(null)}>
                キャンセル
              </Button>
              <Button onClick={handleUpdate}>更新する</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Drawer */}
      <Sheet open={!!viewCred} onOpenChange={() => setViewCred(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{viewCred?.label}</SheetTitle>
            <SheetDescription>クレデンシャル詳細</SheetDescription>
          </SheetHeader>
          {viewCred && (
            <div className="flex flex-col gap-4 px-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">ラベル</span>
                <span className="text-sm font-medium">{viewCred.label}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">ユーザー名</span>
                <div className="flex items-center gap-2">
                  <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                    {viewCred.username}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => copyToClipboard(viewCred.username)}
                    aria-label="ユーザー名をコピー"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">シークレット</span>
                <div className="flex items-center gap-2">
                  <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                    {viewCred.secretMasked}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={() => setSecretWarningOpen(true)}
                    aria-label="シークレットをコピー"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">タグ</span>
                <div className="flex flex-wrap gap-1">
                  {viewCred.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <span>作成: {new Date(viewCred.createdAt).toLocaleString('ja-JP')}</span>
                {viewCred.lastUsedAt && (
                  <span>最終使用: {new Date(viewCred.lastUsedAt).toLocaleString('ja-JP')}</span>
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
              シークレットコピーの警告
            </DialogTitle>
            <DialogDescription>
              これはデモ環境です。実際のシークレットは保存されていません。本番環境では、シークレットのコピーは監査ログに記録されます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSecretWarningOpen(false)}>
              閉じる
            </Button>
            <Button
              onClick={() => {
                copyToClipboard('(demo-secret-not-real)')
                setSecretWarningOpen(false)
              }}
            >
              コピーする (Demo)
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
              クレデンシャルを削除
            </DialogTitle>
            <DialogDescription>
              「{deleteCred?.label}」を削除します。この操作は取り消せません。ポリシーで参照されている場合、アクセスが失われる可能性があります。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteCred(null)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
