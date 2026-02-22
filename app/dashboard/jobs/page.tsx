"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { useJobs } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ListTodo, Play, Clock, CheckCircle2, XCircle, Filter } from "lucide-react"

type JobFilter = "all" | "queued" | "running" | "completed" | "failed"

const statusConfig = {
  queued: { label: "待機中", icon: Clock, variant: "secondary" as const, color: "text-muted-foreground" },
  running: { label: "実行中", icon: Play, variant: "default" as const, color: "text-foreground" },
  completed: { label: "完了", icon: CheckCircle2, variant: "secondary" as const, color: "text-foreground" },
  failed: { label: "失敗", icon: XCircle, variant: "destructive" as const, color: "text-destructive" },
}

export default function JobsPage() {
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

  const filters: { value: JobFilter; label: string }[] = [
    { value: "all", label: `すべて (${counts.all})` },
    { value: "running", label: `実行中 (${counts.running})` },
    { value: "queued", label: `待機中 (${counts.queued})` },
    { value: "completed", label: `完了 (${counts.completed})` },
    { value: "failed", label: `失敗 (${counts.failed})` },
  ]

  return (
    <>
      <DashboardHeader title="ジョブ" titleEn="Jobs" />
      <div className="flex-1 overflow-auto p-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-xs text-muted-foreground">合計ジョブ</span>
                <span className="text-2xl font-bold">{jobs.length}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-xs text-muted-foreground">実行中</span>
                <span className="text-2xl font-bold">{counts.running}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-xs text-muted-foreground">待機中</span>
                <span className="text-2xl font-bold">{counts.queued}</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-1 p-4">
                <span className="text-xs text-muted-foreground">失敗</span>
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
                <span className="text-sm">該当するジョブがありません</span>
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
