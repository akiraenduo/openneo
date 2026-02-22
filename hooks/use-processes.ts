'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ProcessInfo, KillProcessResult } from '@/lib/types/electron'

export function useProcesses(intervalMs: number = 3000) {
  const [processes, setProcesses] = useState<ProcessInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProcesses = useCallback(async () => {
    if (!window.electronAPI?.getProcesses) {
      setLoading(false)
      return
    }
    try {
      const list = await window.electronAPI.getProcesses()
      setProcesses(list)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get process list')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProcesses()

    if (!window.electronAPI?.getProcesses) return

    const timer = setInterval(fetchProcesses, intervalMs)
    return () => clearInterval(timer)
  }, [fetchProcesses, intervalMs])

  const killProcess = useCallback(async (pid: number): Promise<KillProcessResult> => {
    if (!window.electronAPI?.killProcess) {
      return { success: false, error: 'electronAPI not available' }
    }
    const result = await window.electronAPI.killProcess(pid)
    if (result.success) {
      // Refresh list after kill
      await fetchProcesses()
    }
    return result
  }, [fetchProcesses])

  return { processes, loading, error, killProcess }
}
