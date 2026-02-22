'use client'

import { useState } from 'react'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Cpu, HardDrive, Check, MonitorSmartphone } from 'lucide-react'
import { useStaticSystemInfo, useDynamicSystemInfo } from '@/hooks/use-system-info'
import { modelCatalog } from '@/lib/model-catalog'
import { evaluateModelCompatibility, type CompatibilityStatus } from '@/lib/llm-compatibility'
import { useTranslation } from '@/lib/i18n'

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

const statusConfig: Record<CompatibilityStatus, { variant: 'default' | 'secondary' | 'destructive'; labelKey: string }> = {
  ok: { variant: 'default', labelKey: 'models.ok' },
  heavy: { variant: 'secondary', labelKey: 'models.heavy' },
  ng: { variant: 'destructive', labelKey: 'models.notRecommended' },
}

const contextLengthOptions = [2048, 4096, 8192, 16384, 32768]

export default function ModelsPage() {
  const { t } = useTranslation()
  const { data: staticInfo } = useStaticSystemInfo()
  const { data: dynamicInfo } = useDynamicSystemInfo(3000)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [parallelAgents, setParallelAgents] = useState(1)
  const [contextLength, setContextLength] = useState(4096)

  // Fallback values for browser dev mode
  const totalRAMBytes = staticInfo?.totalRAMBytes || 36 * 1024 * 1024 * 1024
  const freeRAMBytes = dynamicInfo?.freeRAMBytes || 18.4 * 1024 * 1024 * 1024

  const compatibility = evaluateModelCompatibility(
    modelCatalog,
    { totalRAMBytes },
    { freeRAMBytes },
    parallelAgents,
    contextLength,
  )

  const selectedModel = compatibility.find((c) => c.model.id === selectedId)

  return (
    <>
      <DashboardHeader title={t('models.title')} />
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          {/* Mac card - real data */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                  <MonitorSmartphone className="size-5 text-foreground" />
                </div>
                <div>
                  <CardTitle className="text-sm">{t('models.yourMac')}</CardTitle>
                  <CardDescription className="text-xs">
                    {staticInfo?.chipGeneration || t('models.appleSilicon')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">{t('models.totalRam')}</span>
                  <span className="text-sm font-semibold">{formatBytes(totalRAMBytes)}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">{t('models.freeRam')}</span>
                  <span className="text-sm font-semibold">{formatBytes(freeRAMBytes)}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">{t('models.chip')}</span>
                  <span className="text-sm font-semibold">{staticInfo?.chipGeneration || 'M3 Pro'}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">{t('models.gpuCores')}</span>
                  <span className="text-sm font-semibold">{staticInfo?.gpuCores || 18}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controls: parallel agents + context length */}
          <Card>
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end">
              <div className="flex flex-1 flex-col gap-2">
                <Label className="text-xs">{t('models.parallelAgents')} ({parallelAgents})</Label>
                <Slider
                  value={[parallelAgents]}
                  onValueChange={([v]) => setParallelAgents(v)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs">{t('models.contextLength')}</Label>
                <Select
                  value={String(contextLength)}
                  onValueChange={(v) => setContextLength(Number(v))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contextLengthOptions.map((cl) => (
                      <SelectItem key={cl} value={String(cl)}>
                        {cl.toLocaleString()} tokens
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    {`${t('models.selected')}: ${selectedModel.model.name}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selectedModel.model.family} &middot; {selectedModel.model.quantization} &middot; RAM {formatBytes(selectedModel.requiredRAMBytes)}
                    &middot; {t('models.headroom')}: {selectedModel.headroomBytes >= 0 ? '+' : ''}{formatBytes(Math.abs(selectedModel.headroomBytes))}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>
                  {t('models.deselect')}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Model catalog */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              {t('models.modelCatalog')}
            </h2>
            <div className="flex flex-col gap-3">
              {compatibility.map((compat) => {
                const { model, status, headroomBytes } = compat
                const cfg = statusConfig[status]
                const isSelected = model.id === selectedId
                return (
                  <Card
                    key={model.id}
                    className={isSelected ? 'ring-2 ring-foreground ring-offset-2' : ''}
                  >
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                          <Cpu className="size-4 text-foreground" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{model.name}</span>
                            <Badge variant={cfg.variant} className="text-[10px]">
                              {t(cfg.labelKey)}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {model.family} &middot; {model.parameterSize} &middot; {model.quantization}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Cpu className="size-3" />
                            RAM {formatBytes(compat.requiredRAMBytes)}
                          </span>
                          <Separator orientation="vertical" className="h-4" />
                          <span className="flex items-center gap-1">
                            <HardDrive className="size-3" />
                            {formatBytes(model.diskSizeBytes)}
                          </span>
                          <Separator orientation="vertical" className="h-4" />
                          <span className="font-mono text-[10px]">
                            {headroomBytes >= 0 ? '+' : ''}{formatBytes(Math.abs(headroomBytes))}
                            {headroomBytes < 0 ? ' deficit' : ' free'}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant={isSelected ? 'default' : 'outline'}
                          onClick={() => setSelectedId(isSelected ? null : model.id)}
                          className="shrink-0"
                          disabled={status === 'ng'}
                        >
                          {isSelected ? t('models.selected') : t('models.select')}
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
