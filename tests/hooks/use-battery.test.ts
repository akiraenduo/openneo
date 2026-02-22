import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useBattery } from '@/hooks/use-battery'

describe('useBattery', () => {
  it('should retrieve battery info from mock API', async () => {
    const { result } = renderHook(() => useBattery())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).not.toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should validate battery fields', async () => {
    const { result } = renderHook(() => useBattery())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data?.percent).toBe(85)
    expect(result.current.data?.charging).toBe(false)
    expect(result.current.data?.timeRemaining).toBe('4:30')
  })

  it('should handle missing electronAPI gracefully', async () => {
    const original = window.electronAPI
    Object.defineProperty(window, 'electronAPI', { value: undefined, writable: true, configurable: true })

    const { result } = renderHook(() => useBattery())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()

    Object.defineProperty(window, 'electronAPI', { value: original, writable: true, configurable: true })
  })
})
