"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { useJobs } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ListTodo, Play, Clock, CheckCircle2, XCircle, Filter } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

type JobFilter = "all" | "queued" | "running" | "completed" | "failed"

export default function JobsPage() {
  const { t } = useTranslation()
  const { jobs } = useJobs()
  const [filter, setFilter] = useState<JobFilter>("all")

  const filtered = filter === "all" ? jobs : jobs.filter((j) => j.status === filter)
  const counts = {
    all: jobs.length,
    queued: jobs.filter((j) => j.status === "queued").length,
    running: jobs.filter((j) => j.status === "running").length,
    completed: jobs.filter((j) => j.status === "completed").length,
    failed: jobs.filter((j) => j.status === "failed").length,
  }

  const statusConfig = {
    queued: { label: t("jobs.queued"), icon: Clock, variant: "secondary" as const, color: "text-muted-foreground" },
    running: { label: t("jobs.running"), icon: Play, variant: "default" as const, color: "text-foreground" },
    completed: { label: t("jobs.completed"), icon: CheckCircle2, variant: "secondary" as const, color: "text-foreground" },
    failed: { label: t("jobs.failed"), icon: XCircle, variant: "destructive" as const, color: "text-destructive" },
  }

  const filters: { value: JobFilter; label: string }[] = [
    { value: "all", label: `${t("common.all")} (${counts.all})` },
    { value: "running", label: `${t("jobs.running")} (${counts.running})` },
    { value: "queued", label: `${t("jobs.queued")} (${counts.queued})` },
    { value: "completed", label: `${t("jobs.completed")} (${counts.completed})` },
    { value: "failed", label: `${t("jobs.failed")} (${counts.failed})` },
  ]

  return (
    <>
      <DashboardHeader title={t("jobs.title")} />
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-xs text-muted-foreground">{t("jobs.totalJobs")}</span>
                <span className="text-2xl font-bold">{jobs.length}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-xs text-muted-foreground">{t("jobs.running")}</span>
                <span className="text-2xl font-bold">{counts.running}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-xs text-muted-foreground">{t("jobs.queued")}</span>
                <span className="text-2xl font-bold">{counts.queued}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-xs text-muted-foreground">{t("jobs.failed")}</span>
                <span className="text-2xl font-bold text-destructive">{counts.failed}</span>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="size-4 shrink-0 text-muted-foreground" />
            {filters.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? "default" : "outline"}
                size="sm"
                className="shrink-0 text-xs"
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>

          {/* Job list */}
          <div className="flex flex-col gap-3">
            {filtered.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-muted-foreground">
                <ListTodo className="size-8" />
                <span className="text-sm">{t("jobs.noJobs")}</span>
              </div>
            )}
            {filtered.map((job) => {
              const cfg = statusConfig[job.status]
              const StatusIcon = cfg.icon
              return (
                <Card key={job.id}>
                  <CardContent className="flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                          <StatusIcon className={`size-4 ${cfg.color}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{job.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {job.agentName} &middot;{" "}
                            {new Date(job.createdAt).toLocaleString("ja-JP", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <Badge variant={cfg.variant} className="shrink-0 text-[10px]">
                        {cfg.label}
                      </Badge>
                    </div>
                    {(job.status === "running" || job.status === "failed") && (
                      <div className="flex items-center gap-3">
                        <Progress value={job.progress} className="h-1.5 flex-1" />
                        <span className="shrink-0 font-mono text-xs text-muted-foreground">
                          {job.progress}%
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
