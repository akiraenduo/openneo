'use client'

import { useState, useEffect, useCallback } from 'react'
import type { StaticSystemInfo, DynamicSystemInfo } from '@/lib/types/electron'

// ─── useStaticSystemInfo ───

export function useStaticSystemInfo() {
  const [data, setData] = useState<StaticSystemInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!window.electronAPI?.getStaticInfo) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const info = await window.electronAPI.getStaticInfo()
      setData(info)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get static system info')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}

// ─── useDynamicSystemInfo ───

export function useDynamicSystemInfo(intervalMs: number = 3000) {
  const [data, setData] = useState<DynamicSystemInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const api = window.electronAPI
    if (!api?.onMetricsUpdate || !api?.startPolling || !api?.stopPolling) {
      setLoading(false)
      return
    }

    // Fetch initial data
    if (api.getDynamicInfo) {
      api.getDynamicInfo()
        .then((info) => {
          setData(info)
          setLoading(false)
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to get dynamic info')
          setLoading(false)
        })
    }

    // Subscribe to push updates
    const cleanup = api.onMetricsUpdate((info) => {
      setData(info)
      setLoading(false)
    })

    // Start polling
    api.startPolling(intervalMs)

    return () => {
      cleanup()
      api.stopPolling()
    }
  }, [intervalMs])

  return { data, loading, error }
}
