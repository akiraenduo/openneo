'use client'

import { useState, useEffect, useCallback } from 'react'
import type { BatteryInfo } from '@/lib/types/electron'

export function useBattery(intervalMs: number = 10000) {
  const [data, setData] = useState<BatteryInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBattery = useCallback(async () => {
    if (!window.electronAPI?.getBattery) {
      setLoading(false)
      return
    }
    try {
      const info = await window.electronAPI.getBattery()
      setData(info)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get battery info')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBattery()

    if (!window.electronAPI?.getBattery) return

    const timer = setInterval(fetchBattery, intervalMs)
    return () => clearInterval(timer)
  }, [fetchBattery, intervalMs])

  return { data, loading, error }
}
