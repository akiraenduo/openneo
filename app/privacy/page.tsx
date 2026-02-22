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

const principles = [
  {
    icon: Server,
    title: 'ローカルファースト (Local-first)',
    description:
      'すべてのデータはあなたのMac上に保存されます。デフォルトでは外部サーバーにデータを送信しません。エージェントの実行、モデルの推論、ファイルアクセスはすべてローカルで処理されます。',
  },
  {
    icon: Eye,
    title: 'データ収集なし (No Data Collection)',
    description:
      'OpenXXXはデフォルトであなたのデータを収集・販売しません。使用状況の分析やテレメトリはオプトインであり、有効にしない限り一切の情報を外部に送信しません。',
  },
  {
    icon: ShieldCheck,
    title: 'オプトイン診断 (Opt-in Diagnostics)',
    description:
      'アプリの改善のための診断データ送信は完全にオプトインです。設定から明示的に有効にした場合のみ、匿名化されたクラッシュレポートと基本的な使用統計が送信されます。',
  },
  {
    icon: Globe,
    title: '外部モデル呼び出しの明示的承認 (Explicit Cloud Approval)',
    description:
      'Claude、GPT等の外部APIへの接続は、すべてユーザーの明示的な承認が必要です。どのデータがどのサービスに送信されるかを事前に確認できます。ポリシーによるネットワーク制御が常に適用されます。',
  },
]

const faqs = [
  {
    question: 'OpenXXXはどのようなデータを保存しますか？',
    answer:
      'エージェントの設定、OKR、実行ログ、ポリシー設定がローカルに保存されます。すべてのデータはあなたのMacのファイルシステム上にあり、暗号化されています。外部サーバーには送信されません。',
  },
  {
    question: '外部LLM（Claude、GPT等）を使う場合、データは安全ですか？',
    answer:
      '外部LLMへのリクエストは、ネットワークポリシーとアクセス制御の対象です。送信前にユーザーの承認が必要であり、どのデータが送信されるかを確認できます。ただし、外部サービスのプライバシーポリシーも別途確認してください。',
  },
  {
    question: 'アンインストールするとデータはどうなりますか？',
    answer:
      'アプリケーションを削除すると、関連するすべてのローカルデータも削除されます。macOS Keychainに保存されたクレデンシャルは、Keychain Access.appから個別に削除できます。',
  },
  {
    question: 'オープンソースですか？',
    answer:
      'OpenXXXのコアコンポーネントはオープンソースとして公開予定です。セキュリティ監査を受け、透明性を確保しています。ソースコードを直接確認できます。',
  },
  {
    question: '企業利用の場合、追加のセキュリティ要件に対応できますか？',
    answer:
      'ポリシー管理、クレデンシャルVault、監査ログ機能により、企業のコンプライアンス要件に対応できます。ポリシーはJSON形式でエクスポート可能であり、外部監査ツールとの連携も可能です。',
  },
]

export default function PrivacyPage() {
  return (
    <SiteLayout>
      <main className="flex-1">
        {/* Hero */}
        <section className="flex flex-col items-center gap-4 px-4 pb-12 pt-16 text-center sm:pt-20">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-foreground text-background">
            <ShieldCheck className="size-7" />
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            プライバシーポリシー
          </h1>
          <p className="max-w-xl text-balance text-muted-foreground leading-relaxed">
            OpenXXXはプライバシーを最優先に設計されています。
            あなたのデータはあなたのものです。
          </p>
        </section>

        {/* Principles */}
        <section className="mx-auto grid max-w-4xl gap-4 px-4 pb-12 sm:grid-cols-2">
          {principles.map((p) => (
            <Card key={p.title}>
              <CardHeader className="flex flex-row items-start gap-3 pb-2">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <p.icon className="size-4 text-foreground" />
                </div>
                <CardTitle className="text-sm leading-snug">{p.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {p.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 pb-16">
          <h2 className="mb-6 text-center text-xl font-semibold">
            よくある質問 (FAQ)
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
    </SiteLayout>
  )
}
