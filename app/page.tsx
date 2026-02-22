"use client"

import Link from "next/link"
import { SiteLayout } from "@/components/site-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Download,
  Package,
  Cpu,
  Brain,
  ShieldCheck,
  Target,
  Zap,
  Lock,
  MonitorCog,
  Layers,
  Eye,
} from "lucide-react"
import { useTranslation } from "@/lib/i18n"

export default function LandingPage() {
  const { t } = useTranslation()

  const features = [
    { icon: MonitorCog, titleKey: "landing.feature1Title", descKey: "landing.feature1Desc" },
    { icon: Brain, titleKey: "landing.feature2Title", descKey: "landing.feature2Desc" },
    { icon: ShieldCheck, titleKey: "landing.feature3Title", descKey: "landing.feature3Desc" },
    { icon: Target, titleKey: "landing.feature4Title", descKey: "landing.feature4Desc" },
    { icon: Zap, titleKey: "landing.feature5Title", descKey: "landing.feature5Desc" },
    { icon: Lock, titleKey: "landing.feature6Title", descKey: "landing.feature6Desc" },
  ]

  const steps = [
    { num: "01", icon: Download, titleKey: "landing.step1Title", descKey: "landing.step1Desc" },
    { num: "02", icon: Layers, titleKey: "landing.step2Title", descKey: "landing.step2Desc" },
    { num: "03", icon: Eye, titleKey: "landing.step3Title", descKey: "landing.step3Desc" },
  ]

  const screenshots = [
    { labelKey: "landing.screenshot1Label", descKey: "landing.screenshot1Desc" },
    { labelKey: "landing.screenshot2Label", descKey: "landing.screenshot2Desc" },
    { labelKey: "landing.screenshot3Label", descKey: "landing.screenshot3Desc" },
  ]

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center md:py-32">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            OpenNeo
            <span className="block text-muted-foreground">{t('landing.subtitle')}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            {t('landing.description')}
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
              <Link href="/download">
                <Download className="size-4" />
                {t('landing.downloadDmg')}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full gap-2 sm:w-auto">
              <Link href="/download">
                <Package className="size-4" />
                {t('landing.getPkg')}
              </Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            {t('landing.systemReq')}
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
          <h2 className="text-center text-xl font-bold text-foreground md:text-2xl">
            {t('landing.features')}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-muted-foreground">
            {t('landing.featuresDesc')}
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.titleKey} className="border-border">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                    <f.icon className="size-4 text-foreground" />
                  </div>
                  <CardTitle className="text-sm">{t(f.titleKey)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t(f.descKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-4xl px-4 py-16 md:py-24">
          <h2 className="text-center text-xl font-bold text-foreground md:text-2xl">
            {t('landing.howItWorks')}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-muted-foreground">
            {t('landing.howItWorksDesc')}
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="flex flex-col items-center text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary">
                  <s.icon className="size-6 text-foreground" />
                </div>
                <span className="mt-4 font-mono text-xs text-muted-foreground">{s.num}</span>
                <h3 className="mt-1 text-sm font-semibold text-foreground">{t(s.titleKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(s.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshot placeholders */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
          <h2 className="text-center text-xl font-bold text-foreground md:text-2xl">
            {t('landing.screenshots')}
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {screenshots.map((s) => (
              <div
                key={s.labelKey}
                className="flex flex-col items-center justify-center rounded-xl border border-border bg-secondary p-10"
              >
                <Cpu className="size-8 text-muted-foreground" />
                <span className="mt-3 text-sm font-medium text-foreground">{t(s.labelKey)}</span>
                <span className="mt-1 text-xs text-muted-foreground">{t(s.descKey)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">
            {t('landing.readyTitle')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('landing.readyDesc')}
          </p>
          <Button asChild size="lg" className="mt-6 gap-2">
            <Link href="/download">
              <Download className="size-4" />
              {t('landing.downloadAppleSilicon')}
            </Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  )
}
