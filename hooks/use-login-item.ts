'use client'

import { useState, useEffect, useCallback } from 'react'
import type { LoginItemSettings } from '@/lib/types/electron'

export function useLoginItem() {
  const [settings, setSettings] = useState<LoginItemSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!window.electronAPI?.getLoginItemSettings) {
      setLoading(false)
      return
    }
    window.electronAPI.getLoginItemSettings()
      .then((s) => {
        setSettings(s)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const toggle = useCallback(async () => {
    if (!window.electronAPI?.setLoginItemSettings || !settings) return
    const newValue = !settings.openAtLogin
    const updated = await window.electronAPI.setLoginItemSettings(newValue)
    setSettings(updated)
  }, [settings])

  return { settings, loading, toggle }
}
