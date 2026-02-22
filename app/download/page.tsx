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
import { useTranslation } from "@/lib/i18n"

export default function DownloadPage() {
  const { t } = useTranslation()
  const [modal, setModal] = useState<"dmg" | "pkg" | null>(null)

  const releases = [
    t('download.release1'),
    t('download.release2'),
    t('download.release3'),
    t('download.release4'),
    t('download.release5'),
  ]

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
          {t('download.title')}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-muted-foreground md:text-base">
          {t('download.subtitle')}
        </p>

        {/* Download cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {/* DMG */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                <HardDrive className="size-5 text-foreground" />
              </div>
              <CardTitle className="text-base">{t('download.dmgTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={() => setModal("dmg")} className="w-full gap-2">
                <Download className="size-4" />
                {t('download.downloadDmg')}
              </Button>
              <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                <span>{t('download.version')}: <span className="font-mono text-foreground">v0.8.0</span></span>
                <span>{t('download.macos')}: <span className="text-foreground">13.0+</span></span>
                <span>{t('download.size')}: <span className="text-foreground">185 MB</span></span>
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
              <CardTitle className="text-base">{t('download.pkgTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={() => setModal("pkg")} variant="outline" className="w-full gap-2">
                <Download className="size-4" />
                {t('download.downloadPkg')}
              </Button>
              <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                <span>{t('download.version')}: <span className="font-mono text-foreground">v0.8.0</span></span>
                <span>{t('download.macos')}: <span className="text-foreground">13.0+</span></span>
                <span>{t('download.size')}: <span className="text-foreground">185 MB</span></span>
                <span className="font-mono break-all">SHA-256: 7d793037a076821f811dd41f05fd2fa8...b9cf</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Install instructions */}
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {t('download.installInstructions')}
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="dmg">
              <AccordionTrigger className="text-sm">{t('download.dmgInstall')}</AccordionTrigger>
              <AccordionContent>
                <ol className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <li><span className="font-medium text-foreground">1.</span> {t('download.dmgStep1')}</li>
                  <li><span className="font-medium text-foreground">2.</span> {t('download.dmgStep2')}</li>
                  <li><span className="font-medium text-foreground">3.</span> {t('download.dmgStep3')}</li>
                  <li><span className="font-medium text-foreground">4.</span> {t('download.dmgStep4')}</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="pkg">
              <AccordionTrigger className="text-sm">{t('download.pkgInstall')}</AccordionTrigger>
              <AccordionContent>
                <ol className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <li><span className="font-medium text-foreground">1.</span> {t('download.pkgStep1')}</li>
                  <li><span className="font-medium text-foreground">2.</span> {t('download.pkgStep2')}</li>
                  <li><span className="font-medium text-foreground">3.</span> {t('download.pkgStep3')}</li>
                  <li><span className="font-medium text-foreground">4.</span> {t('download.pkgStep4')}</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="gatekeeper">
              <AccordionTrigger className="text-sm">{t('download.gatekeeperTitle')}</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <p>{t('download.gatekeeperDesc1')}</p>
                  <p>{t('download.gatekeeperDesc2')}</p>
                  <div className="mt-2 flex items-start gap-2 rounded-lg border border-border bg-secondary p-3">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
                    <p className="text-xs text-foreground">{t('download.gatekeeperNotice')}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Release notes */}
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {t('download.releaseNotes')} <Badge variant="secondary" className="ml-2">v0.8.0</Badge>
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
            <DialogTitle>{t('download.downloadConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('download.downloadConfirmDesc')}
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
              {t('common.cancel')}
            </Button>
            <Button onClick={handleDownload}>
              {t('download.startDownload')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SiteLayout>
  )
}
