'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  Policy,
  Credential,
  AccessRequest,
  AuditLogEntry,
  Agent,
  Job,
  LLMModel,
  NetworkDomain,
} from './mockData'
import {
  defaultPolicies,
  defaultCredentials,
  defaultAccessRequests,
  defaultAuditLogs,
  defaultAgents,
  defaultJobs,
  defaultModels,
  defaultNetworkDomains,
} from './mockData'

// ─── localStorage helpers ───

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full – ignore
  }
}

// ─── Generic persisted-state hook ───

function usePersistedState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setValue(loadFromStorage(key, fallback))
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        saveToStorage(key, resolved)
        return resolved
      })
    },
    [key],
  )

  return [value, set, hydrated] as const
}

// ─── Specific hooks ───

export function useAgents() {
  const [agents, , hydrated] = usePersistedState<Agent[]>(
    'OpenNeo-agents',
    defaultAgents,
  )
  return { agents, hydrated }
}

export function usePolicies() {
  const [policies, setPolicies, hydrated] = usePersistedState<Policy[]>(
    'OpenNeo-policies',
    defaultPolicies,
  )

  const addPolicy = useCallback(
    (p: Policy) => setPolicies((prev) => [...prev, p]),
    [setPolicies],
  )

  const updatePolicy = useCallback(
    (id: string, patch: Partial<Policy>) =>
      setPolicies((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
        ),
      ),
    [setPolicies],
  )

  const deletePolicy = useCallback(
    (id: string) => setPolicies((prev) => prev.filter((p) => p.id !== id)),
    [setPolicies],
  )

  return { policies, setPolicies, addPolicy, updatePolicy, deletePolicy, hydrated }
}

export function useCredentials() {
  const [credentials, setCredentials, hydrated] = usePersistedState<Credential[]>(
    'OpenNeo-credentials',
    defaultCredentials,
  )

  const addCredential = useCallback(
    (c: Credential) => setCredentials((prev) => [...prev, c]),
    [setCredentials],
  )

  const updateCredential = useCallback(
    (id: string, patch: Partial<Credential>) =>
      setCredentials((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      ),
    [setCredentials],
  )

  const deleteCredential = useCallback(
    (id: string) => setCredentials((prev) => prev.filter((c) => c.id !== id)),
    [setCredentials],
  )

  return { credentials, setCredentials, addCredential, updateCredential, deleteCredential, hydrated }
}

export function useAccessRequests() {
  const [requests, setRequests, hydrated] = usePersistedState<AccessRequest[]>(
    'OpenNeo-requests',
    defaultAccessRequests,
  )

  const updateRequest = useCallback(
    (id: string, patch: Partial<AccessRequest>) =>
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      ),
    [setRequests],
  )

  return { requests, setRequests, updateRequest, hydrated }
}

export function useAuditLogs() {
  const [logs, setLogs, hydrated] = usePersistedState<AuditLogEntry[]>(
    'OpenNeo-audit-logs',
    defaultAuditLogs,
  )

  const addLog = useCallback(
    (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'hashChainIndicator'>) => {
      setLogs((prev) => {
        const lastHash = prev.length > 0 ? prev[0].hashChainIndicator : 'sha256:genesis'
        const newEntry: AuditLogEntry = {
          ...entry,
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          hashChainIndicator: `sha256:${lastHash.slice(-6)}${Math.random().toString(36).slice(2, 8)}`,
        }
        return [newEntry, ...prev]
      })
    },
    [setLogs],
  )

  return { logs, setLogs, addLog, hydrated }
}

export function useJobs() {
  const [jobs, setJobs, hydrated] = usePersistedState<Job[]>(
    'OpenNeo-jobs',
    defaultJobs,
  )
  return { jobs, setJobs, hydrated }
}

export function useModels() {
  const [models, , hydrated] = usePersistedState<LLMModel[]>(
    'OpenNeo-models',
    defaultModels,
  )
  return { models, hydrated }
}

export function useNetworkDomains() {
  const [domains, setDomains, hydrated] = usePersistedState<NetworkDomain[]>(
    'OpenNeo-network-domains',
    defaultNetworkDomains,
  )

  const addDomain = useCallback(
    (d: NetworkDomain) => setDomains((prev) => [...prev, d]),
    [setDomains],
  )

  const updateDomain = useCallback(
    (id: string, patch: Partial<NetworkDomain>) =>
      setDomains((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      ),
    [setDomains],
  )

  const deleteDomain = useCallback(
    (id: string) => setDomains((prev) => prev.filter((d) => d.id !== id)),
    [setDomains],
  )

  return { domains, setDomains, addDomain, updateDomain, deleteDomain, hydrated }
}

// ─── Read-only mode ───

export function useReadOnlyMode() {
  const [readOnly, setReadOnly, hydrated] = usePersistedState<boolean>(
    'OpenNeo-readonly',
    false,
  )
  return { readOnly, setReadOnly, hydrated }
}
