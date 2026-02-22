import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useStaticSystemInfo, useDynamicSystemInfo } from '@/hooks/use-system-info'

const GB = 1024 * 1024 * 1024

describe('useStaticSystemInfo', () => {
  // TC-010: Mock API data retrieval
  it('should retrieve static system info from mock API', async () => {
    const { result } = renderHook(() => useStaticSystemInfo())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).not.toBeNull()
    expect(result.current.data?.cpuModel).toBe('Apple M3 Pro')
    expect(result.current.data?.chipGeneration).toBe('Apple M3 Pro')
    expect(result.current.data?.gpuCores).toBe(18)
    expect(result.current.data?.totalRAMBytes).toBe(36 * GB)
    expect(result.current.data?.osVersion).toBe('14.4')
    expect(result.current.data?.architecture).toBe('arm64')
    expect(result.current.error).toBeNull()
  })

  it('should support refetch', async () => {
    const { result } = renderHook(() => useStaticSystemInfo())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.refetch()
    })

    expect(result.current.data?.cpuModel).toBe('Apple M3 Pro')
  })

  // TC-012: API absent fallback
  it('should handle missing electronAPI gracefully', async () => {
    const original = window.electronAPI
    Object.defineProperty(window, 'electronAPI', { value: undefined, writable: true, configurable: true })

    const { result } = renderHook(() => useStaticSystemInfo())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()

    Object.defineProperty(window, 'electronAPI', { value: original, writable: true, configurable: true })
  })
})

describe('useDynamicSystemInfo', () => {
  // TC-011: Polling start/stop
  it('should retrieve initial dynamic info', async () => {
    const { result } = renderHook(() => useDynamicSystemInfo(3000))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).not.toBeNull()
    expect(result.current.data?.memoryPressure).toBe('nominal')
    expect(result.current.data?.cpuLoadPercent).toBe(12.5)
    expect(typeof result.current.data?.freeRAMBytes).toBe('number')
  })

  it('should call startPolling and stopPolling on mount/unmount', async () => {
    const startSpy = vi.fn()
    const stopSpy = vi.fn()
    const cleanupSpy = vi.fn()

    const original = window.electronAPI
    Object.defineProperty(window, 'electronAPI', {
      value: {
        ...original,
        startPolling: startSpy,
        stopPolling: stopSpy,
        onMetricsUpdate: () => cleanupSpy,
      },
      writable: true,
      configurable: true,
    })

    const { unmount } = renderHook(() => useDynamicSystemInfo(5000))

    await waitFor(() => {
      expect(startSpy).toHaveBeenCalledWith(5000)
    })

    unmount()

    expect(cleanupSpy).toHaveBeenCalled()
    expect(stopSpy).toHaveBeenCalled()

    Object.defineProperty(window, 'electronAPI', { value: original, writable: true, configurable: true })
  })

  it('should handle missing electronAPI gracefully', async () => {
    const original = window.electronAPI
    Object.defineProperty(window, 'electronAPI', { value: undefined, writable: true, configurable: true })

    const { result } = renderHook(() => useDynamicSystemInfo())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()

    Object.defineProperty(window, 'electronAPI', { value: original, writable: true, configurable: true })
  })
})
