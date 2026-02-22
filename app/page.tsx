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

const features = [
  {
    icon: MonitorCog,
    title: "Agent Task Manager",
    desc: "CPU / RAM / ネットワークをエージェントごとにリアルタイム監視。macOS アクティビティモニタのような透明性。",
  },
  {
    icon: Brain,
    title: "Local LLM First",
    desc: "OSS のローカルモデルを優先。推論はあなたの Mac 上で完結し、データが外部に出ません。",
  },
  {
    icon: ShieldCheck,
    title: "Explicit Cloud Approval",
    desc: "Claude や GPT などの外部 API コールは、すべてユーザーの明示的な承認が必要です。",
  },
  {
    icon: Target,
    title: "OKR-driven Agents",
    desc: "各エージェントに目標 (OKR) を設定。スケジュール実行とハートビートで自律的に稼働します。",
  },
  {
    icon: Zap,
    title: "Skills & Automation",
    desc: "スキルの割り当てと自動生成。エージェントが必要な能力を獲得し、タスクを自動化します。",
  },
  {
    icon: Lock,
    title: "Privacy by Design",
    desc: "デフォルトでデータ収集なし。すべてのアクセスはポリシーで制御され、監査ログに記録されます。",
  },
]

const steps = [
  {
    num: "01",
    icon: Download,
    title: "OpenXXX をインストール",
    desc: "Apple Silicon Mac に DMG または PKG でインストール。数分で完了します。",
  },
  {
    num: "02",
    icon: Layers,
    title: "ログイン時起動を有効化 (任意)",
    desc: "Open at Login を有効にすると、Mac 起動時にエージェントが自動的に稼働開始します。",
  },
  {
    num: "03",
    icon: Eye,
    title: "完全な可視性のもとで監視",
    desc: "Task Manager でエージェントの状態をリアルタイムに確認。すべてのアクションが透明です。",
  },
]

export default function LandingPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center md:py-32">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            OpenXXX
            <span className="block text-muted-foreground">User-Owned Agent OS for macOS</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Local-first. Transparent. 24/7 autonomous agents with a Task Manager you can trust.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
              <Link href="/download">
                <Download className="size-4" />
                Download for Apple Silicon (DMG)
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full gap-2 sm:w-auto">
              <Link href="/download">
                <Package className="size-4" />
                Get PKG Installer
              </Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            macOS 13.0+ &middot; Apple Silicon &middot; v0.8.0
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
          <h2 className="text-center text-xl font-bold text-foreground md:text-2xl">
            Features
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-muted-foreground">
            ローカル優先のセキュアなエージェント管理
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border-border">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                    <f.icon className="size-4 text-foreground" />
                  </div>
                  <CardTitle className="text-sm">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
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
            How it works
          </h2>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-muted-foreground">
            3 ステップで始められます
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="flex flex-col items-center text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary">
                  <s.icon className="size-6 text-foreground" />
                </div>
                <span className="mt-4 font-mono text-xs text-muted-foreground">{s.num}</span>
                <h3 className="mt-1 text-sm font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshot placeholders */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
          <h2 className="text-center text-xl font-bold text-foreground md:text-2xl">
            Screenshots
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { label: "Agent List", desc: "エージェント一覧と状態" },
              { label: "Memory Usage", desc: "メモリ使用量チャート" },
              { label: "Network Approvals", desc: "ネットワーク承認キュー" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center justify-center rounded-xl border border-border bg-secondary p-10"
              >
                <Cpu className="size-8 text-muted-foreground" />
                <span className="mt-3 text-sm font-medium text-foreground">{s.label}</span>
                <span className="mt-1 text-xs text-muted-foreground">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center md:py-24">
          <h2 className="text-xl font-bold text-foreground md:text-2xl">
            Ready to get started?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            あなたの Mac で、あなたのエージェントを。
          </p>
          <Button asChild size="lg" className="mt-6 gap-2">
            <Link href="/download">
              <Download className="size-4" />
              Download for Apple Silicon
            </Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  )
}
