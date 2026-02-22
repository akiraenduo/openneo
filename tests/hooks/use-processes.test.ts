import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useProcesses } from '@/hooks/use-processes'

describe('useProcesses', () => {
  it('should retrieve process list from mock API', async () => {
    const { result } = renderHook(() => useProcesses())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.processes).toHaveLength(3)
    expect(result.current.error).toBeNull()
  })

  it('should validate process fields', async () => {
    const { result } = renderHook(() => useProcesses())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const proc = result.current.processes[0]
    expect(proc).toHaveProperty('pid')
    expect(proc).toHaveProperty('ppid')
    expect(proc).toHaveProperty('cpuPercent')
    expect(proc).toHaveProperty('ramBytes')
    expect(proc).toHaveProperty('command')
  })

  it('should return success when killing a valid PID', async () => {
    const { result } = renderHook(() => useProcesses())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let killResult!: { success: boolean; error?: string }
    await act(async () => {
      killResult = await result.current.killProcess(100)
    })

    expect(killResult.success).toBe(true)
  })

  it('should return failure when killing PID 1 (protected)', async () => {
    const { result } = renderHook(() => useProcesses())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    let killResult!: { success: boolean; error?: string }
    await act(async () => {
      killResult = await result.current.killProcess(1)
    })

    expect(killResult.success).toBe(false)
  })

  it('should refresh process list after successful kill', async () => {
    const MB = 1024 * 1024
    const getProcessesSpy = vi.fn()
      .mockResolvedValueOnce([
        { pid: 1, ppid: 0, cpuPercent: 0.1, ramBytes: 50 * MB, command: 'launchd' },
        { pid: 100, ppid: 1, cpuPercent: 5.0, ramBytes: 200 * MB, command: 'Safari' },
      ])
      .mockResolvedValueOnce([
        { pid: 1, ppid: 0, cpuPercent: 0.1, ramBytes: 50 * MB, command: 'launchd' },
      ])

    const original = window.electronAPI
    Object.defineProperty(window, 'electronAPI', {
      value: {
        ...original,
        getProcesses: getProcessesSpy,
        killProcess: async () => ({ success: true }),
      },
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => useProcesses())

    await waitFor(() => {
      expect(result.current.processes).toHaveLength(2)
    })

    await act(async () => {
      await result.current.killProcess(100)
    })

    await waitFor(() => {
      expect(result.current.processes).toHaveLength(1)
    })

    Object.defineProperty(window, 'electronAPI', { value: original, writable: true, configurable: true })
  })

  it('should handle missing electronAPI gracefully', async () => {
    const original = window.electronAPI
    Object.defineProperty(window, 'electronAPI', { value: undefined, writable: true, configurable: true })

    const { result } = renderHook(() => useProcesses())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.processes).toEqual([])
    expect(result.current.error).toBeNull()

    Object.defineProperty(window, 'electronAPI', { value: original, writable: true, configurable: true })
  })
})
