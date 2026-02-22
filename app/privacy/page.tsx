"use client"

import { SiteLayout } from '@/components/site-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  ShieldCheck,
  Eye,
  Globe,
  Server,
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function PrivacyPage() {
  const { t } = useTranslation()

  const principles = [
    {
      icon: Server,
      titleKey: 'privacy.principle1Title',
      descKey: 'privacy.principle1Desc',
    },
    {
      icon: Eye,
      titleKey: 'privacy.principle2Title',
      descKey: 'privacy.principle2Desc',
    },
    {
      icon: ShieldCheck,
      titleKey: 'privacy.principle3Title',
      descKey: 'privacy.principle3Desc',
    },
    {
      icon: Globe,
      titleKey: 'privacy.principle4Title',
      descKey: 'privacy.principle4Desc',
    },
  ]

  const faqs = [
    { qKey: 'privacy.faq1Q', aKey: 'privacy.faq1A' },
    { qKey: 'privacy.faq2Q', aKey: 'privacy.faq2A' },
    { qKey: 'privacy.faq3Q', aKey: 'privacy.faq3A' },
    { qKey: 'privacy.faq4Q', aKey: 'privacy.faq4A' },
    { qKey: 'privacy.faq5Q', aKey: 'privacy.faq5A' },
  ]

  return (
    <SiteLayout>
      <main className="flex-1">
        {/* Hero */}
        <section className="flex flex-col items-center gap-4 px-4 pb-12 pt-16 text-center sm:pt-20">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-foreground text-background">
            <ShieldCheck className="size-7" />
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            {t('privacy.title')}
          </h1>
          <p className="max-w-xl text-balance text-muted-foreground leading-relaxed">
            {t('privacy.subtitle')}
          </p>
        </section>

        {/* Principles */}
        <section className="mx-auto grid max-w-4xl gap-4 px-4 pb-12 sm:grid-cols-2">
          {principles.map((p) => (
            <Card key={p.titleKey}>
              <CardHeader className="flex flex-row items-start gap-3 pb-2">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <p.icon className="size-4 text-foreground" />
                </div>
                <CardTitle className="text-sm leading-snug">{t(p.titleKey)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(p.descKey)}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 pb-16">
          <h2 className="mb-6 text-center text-xl font-semibold">
            {t('privacy.faqTitle')}
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm">
                  {t(faq.qKey)}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {t(faq.aKey)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
    </SiteLayout>
  )
}
