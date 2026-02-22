"use client"

import { useState } from "react"
import { SiteLayout } from "@/components/site-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Download, HardDrive, Package, AlertTriangle } from "lucide-react"

const releases = [
  "Apple Silicon 対応を正式サポート",
  "Agent Task Manager のパフォーマンスを改善",
  "ネットワーク承認キューの UI を刷新",
  "ローカル LLM 推論の安定性を向上",
  "セキュリティポリシーのエクスポート機能を追加",
]

export default function DownloadPage() {
  const [modal, setModal] = useState<"dmg" | "pkg" | null>(null)

  function handleDownload() {
    const url =
      modal === "dmg"
        ? "/downloads/openxxx-latest.dmg"
        : "/downloads/openxxx-latest.pkg"
    setModal(null)
    // In production, replace with actual GitHub release URL
    const a = document.createElement("a")
    a.href = url
    a.download = url.split("/").pop() || ""
    a.click()
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 md:py-20">
        <h1 className="text-center text-2xl font-bold tracking-tight text-foreground md:text-4xl">
          Download OpenXXX
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-muted-foreground md:text-base">
          macOS 13.0 以降の Apple Silicon Mac に対応。
        </p>

        {/* Download cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {/* DMG */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                <HardDrive className="size-5 text-foreground" />
              </div>
              <CardTitle className="text-base">Apple Silicon DMG</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={() => setModal("dmg")} className="w-full gap-2">
                <Download className="size-4" />
                Download DMG
              </Button>
              <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                <span>Version: <span className="font-mono text-foreground">v0.8.0</span></span>
                <span>macOS: <span className="text-foreground">13.0+</span></span>
                <span>Size: <span className="text-foreground">185 MB</span></span>
                <span className="font-mono break-all">SHA-256: e3b0c44298fc1c149afbf4c8996fb924...a3dc</span>
              </div>
            </CardContent>
          </Card>

          {/* PKG */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                <Package className="size-5 text-foreground" />
              </div>
              <CardTitle className="text-base">PKG Installer</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={() => setModal("pkg")} variant="outline" className="w-full gap-2">
                <Download className="size-4" />
                Download PKG
              </Button>
              <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                <span>Version: <span className="font-mono text-foreground">v0.8.0</span></span>
                <span>macOS: <span className="text-foreground">13.0+</span></span>
                <span>Size: <span className="text-foreground">185 MB</span></span>
                <span className="font-mono break-all">SHA-256: 7d793037a076821f811dd41f05fd2fa8...b9cf</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Install instructions */}
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            インストール手順 (Install Instructions)
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="dmg">
              <AccordionTrigger className="text-sm">DMG でのインストール</AccordionTrigger>
              <AccordionContent>
                <ol className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <li><span className="font-medium text-foreground">1.</span> ダウンロードした .dmg ファイルをダブルクリックで開きます。</li>
                  <li><span className="font-medium text-foreground">2.</span> OpenXXX.app を Applications フォルダにドラッグ&ドロップします。</li>
                  <li><span className="font-medium text-foreground">3.</span> 初回起動時、Gatekeeper の警告が表示される場合があります。</li>
                  <li><span className="font-medium text-foreground">4.</span> システム設定 &gt; プライバシーとセキュリティ から「このまま開く」を選択してください。</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="pkg">
              <AccordionTrigger className="text-sm">PKG でのインストール</AccordionTrigger>
              <AccordionContent>
                <ol className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <li><span className="font-medium text-foreground">1.</span> ダウンロードした .pkg ファイルをダブルクリックで開きます。</li>
                  <li><span className="font-medium text-foreground">2.</span> インストーラの指示に従って進めてください。</li>
                  <li><span className="font-medium text-foreground">3.</span> 管理者パスワードの入力が求められます。</li>
                  <li><span className="font-medium text-foreground">4.</span> インストール完了後、Applications から OpenXXX を起動します。</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="gatekeeper">
              <AccordionTrigger className="text-sm">Gatekeeper について</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <p>macOS の Gatekeeper は、未確認の開発者からのアプリを初回起動時にブロックする場合があります。</p>
                  <p>システム設定 &gt; プライバシーとセキュリティ で「このまま開く」を選択するか、右クリック &gt; 「開く」で起動できます。</p>
                  <div className="mt-2 flex items-start gap-2 rounded-lg border border-border bg-secondary p-3">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
                    <p className="text-xs text-foreground">OpenXXX は公証 (notarization) 済みです。不正なソフトウェアではありません。</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Release notes */}
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Release Notes <Badge variant="secondary" className="ml-2">v0.8.0</Badge>
          </h2>
          <ul className="flex flex-col gap-2">
            {releases.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 block size-1.5 shrink-0 rounded-full bg-foreground" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Confirmation modal */}
      <Dialog open={modal !== null} onOpenChange={() => setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ダウンロード確認</DialogTitle>
            <DialogDescription>
              これはフロントエンドデモです。実際のリリースでは、この href を GitHub Releases の URL に置き換えてください。
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-secondary p-3">
            <code className="text-xs text-foreground font-mono break-all">
              {modal === "dmg"
                ? "/downloads/openxxx-latest.dmg"
                : "/downloads/openxxx-latest.pkg"}
            </code>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>
              キャンセル
            </Button>
            <Button onClick={handleDownload}>
              ダウンロード開始
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SiteLayout>
  )
}
