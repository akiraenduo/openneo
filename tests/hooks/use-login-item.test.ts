import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useLoginItem } from '@/hooks/use-login-item'

describe('useLoginItem', () => {
  it('should retrieve login item settings', async () => {
    const { result } = renderHook(() => useLoginItem())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.settings).not.toBeNull()
    expect(result.current.settings?.openAtLogin).toBe(false)
  })

  it('should toggle openAtLogin to true', async () => {
    const { result } = renderHook(() => useLoginItem())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.toggle()
    })

    expect(result.current.settings?.openAtLogin).toBe(true)
  })

  it('should call setLoginItemSettings with correct value', async () => {
    const setSpy = vi.fn().mockResolvedValue({ openAtLogin: true })
    const original = window.electronAPI
    Object.defineProperty(window, 'electronAPI', {
      value: { ...original, setLoginItemSettings: setSpy },
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => useLoginItem())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.toggle()
    })

    expect(setSpy).toHaveBeenCalledWith(true)

    Object.defineProperty(window, 'electronAPI', { value: original, writable: true, configurable: true })
  })

  it('should handle missing electronAPI gracefully', async () => {
    const original = window.electronAPI
    Object.defineProperty(window, 'electronAPI', { value: undefined, writable: true, configurable: true })

    const { result } = renderHook(() => useLoginItem())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.settings).toBeNull()

    Object.defineProperty(window, 'electronAPI', { value: original, writable: true, configurable: true })
  })
})
