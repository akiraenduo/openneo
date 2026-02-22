"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { useModels } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Cpu, HardDrive, Check, MonitorSmartphone } from "lucide-react"
import type { LLMModel } from "@/lib/mockData"

const suitabilityConfig: Record<LLMModel["suitability"], { label: string; variant: "default" | "secondary" | "destructive"; labelJa: string }> = {
  ok: { label: "OK", variant: "default", labelJa: "推奨" },
  heavy: { label: "Heavy", variant: "secondary", labelJa: "高負荷" },
  "not-recommended": { label: "Not Recommended", variant: "destructive", labelJa: "非推奨" },
}

export default function ModelsPage() {
  const { models } = useModels()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedModel = models.find((m) => m.id === selectedId)

  return (
    <>
      <DashboardHeader title="モデル" titleEn="Models" />
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          {/* Mac card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                  <MonitorSmartphone className="size-5 text-foreground" />
                </div>
                <div>
                  <CardTitle className="text-sm">Your Mac</CardTitle>
                  <CardDescription className="text-xs">Apple Silicon</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">RAM 合計</span>
                  <span className="text-sm font-semibold">36 GB</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">RAM 空き</span>
                  <span className="text-sm font-semibold">18.4 GB</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">チップ</span>
                  <span className="text-sm font-semibold">M3 Pro</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">GPU コア</span>
                  <span className="text-sm font-semibold">18</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected model */}
          {selectedModel && (
            <Card className="border-foreground/20">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-foreground text-background">
                  <Check className="size-5" />
                </div>
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-sm font-semibold">
                    選択中: {selectedModel.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selectedModel.family} &middot; {selectedModel.quant} &middot; RAM {selectedModel.estimatedRAM}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>
                  解除
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Model catalog */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              モデルカタログ (Model Catalog)
            </h2>
            <div className="flex flex-col gap-3">
              {models.map((model) => {
                const suit = suitabilityConfig[model.suitability]
                const isSelected = model.id === selectedId
                return (
                  <Card
                    key={model.id}
                    className={isSelected ? "ring-2 ring-foreground ring-offset-2" : ""}
                  >
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                          <Cpu className="size-4 text-foreground" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{model.name}</span>
                            <Badge variant={suit.variant} className="text-[10px]">
                              {suit.labelJa}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {model.family} &middot; {model.size} &middot; {model.quant}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Cpu className="size-3" />
                            RAM {model.estimatedRAM}
                          </span>
                          <Separator orientation="vertical" className="h-4" />
                          <span className="flex items-center gap-1">
                            <HardDrive className="size-3" />
                            {model.diskSize}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => setSelectedId(isSelected ? null : model.id)}
                          className="shrink-0"
                        >
                          {isSelected ? "選択中" : "選択"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
