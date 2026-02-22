import { describe, it, expect } from 'vitest'
import { evaluateModelCompatibility, type ModelCompatibility } from '@/lib/llm-compatibility'
import { modelCatalog, type CatalogModel } from '@/lib/model-catalog'

const GB = 1024 * 1024 * 1024

function findModel(id: string): CatalogModel {
  const m = modelCatalog.find((m) => m.id === id)
  if (!m) throw new Error(`Model ${id} not found in catalog`)
  return m
}

function evalSingle(
  model: CatalogModel,
  totalRAMBytes: number,
  freeRAMBytes: number,
  parallelAgents: number = 1,
  contextLength: number = 4096,
): ModelCompatibility {
  const results = evaluateModelCompatibility(
    [model],
    { totalRAMBytes },
    { freeRAMBytes },
    parallelAgents,
    contextLength,
  )
  return results[0]
}

describe('evaluateModelCompatibility', () => {
  // TC-001: Phi-3 Mini on 36GB machine → ok
  it('should rate Phi-3 Mini as ok on 36GB machine', () => {
    const phi3 = findModel('phi-3-mini')
    const result = evalSingle(phi3, 36 * GB, 18.4 * GB)
    expect(result.status).toBe('ok')
    expect(result.headroomBytes).toBeGreaterThanOrEqual(2 * GB)
  })

  // TC-002: Llama 3.1 405B on 36GB machine → ng
  it('should rate 405B model as ng on 36GB machine', () => {
    const model405b = findModel('llama-3.1-405b')
    const result = evalSingle(model405b, 36 * GB, 18.4 * GB)
    expect(result.status).toBe('ng')
    expect(result.headroomBytes).toBeLessThan(0)
  })

  // TC-003: Increasing parallel agents decreases headroom
  it('should decrease headroom when parallel agents increase', () => {
    const llama8b = findModel('llama-3.2-8b')

    const result1 = evalSingle(llama8b, 36 * GB, 18.4 * GB, 1)
    const result3 = evalSingle(llama8b, 36 * GB, 18.4 * GB, 3)
    const result5 = evalSingle(llama8b, 36 * GB, 18.4 * GB, 5)

    expect(result1.headroomBytes).toBeGreaterThan(result3.headroomBytes)
    expect(result3.headroomBytes).toBeGreaterThan(result5.headroomBytes)
  })

  // TC-004: Increasing context length decreases headroom
  it('should decrease headroom when context length increases', () => {
    const llama8b = findModel('llama-3.2-8b')

    const result2k = evalSingle(llama8b, 36 * GB, 18.4 * GB, 1, 2048)
    const result8k = evalSingle(llama8b, 36 * GB, 18.4 * GB, 1, 8192)

    expect(result2k.headroomBytes).toBeGreaterThan(result8k.headroomBytes)
  })

  // TC-005: 16GB RAM patterns
  describe('16GB RAM machine', () => {
    const freeRAM = 8 * GB
    const totalRAM = 16 * GB

    it('should rate Phi-3 Mini as ok', () => {
      const result = evalSingle(findModel('phi-3-mini'), totalRAM, freeRAM)
      expect(result.status).toBe('ok')
    })

    it('should rate Mistral 7B as heavy or ok', () => {
      const result = evalSingle(findModel('mistral-7b'), totalRAM, freeRAM)
      expect(['ok', 'heavy']).toContain(result.status)
    })

    it('should rate Gemma 2 27B as ng', () => {
      const result = evalSingle(findModel('gemma-2-27b'), totalRAM, freeRAM)
      expect(result.status).toBe('ng')
    })
  })

  // TC-006: 64GB and 128GB RAM patterns
  describe('64GB RAM machine', () => {
    const freeRAM = 40 * GB
    const totalRAM = 64 * GB

    it('should rate Llama 3.3 70B as ng (42GB required, 40GB free)', () => {
      const result = evalSingle(findModel('llama-3.3-70b'), totalRAM, freeRAM)
      expect(result.status).toBe('ng')
    })

    it('should rate Gemma 2 27B as ok', () => {
      const result = evalSingle(findModel('gemma-2-27b'), totalRAM, freeRAM)
      expect(result.status).toBe('ok')
    })
  })

  describe('128GB RAM machine', () => {
    const freeRAM = 80 * GB
    const totalRAM = 128 * GB

    it('should rate Llama 3.3 70B as ok', () => {
      const result = evalSingle(findModel('llama-3.3-70b'), totalRAM, freeRAM)
      expect(result.status).toBe('ok')
    })

    it('should still rate 405B as ng (needs 180GB)', () => {
      const result = evalSingle(findModel('llama-3.1-405b'), totalRAM, freeRAM)
      expect(result.status).toBe('ng')
    })
  })

  it('should evaluate all catalog models without error', () => {
    const results = evaluateModelCompatibility(
      modelCatalog,
      { totalRAMBytes: 36 * GB },
      { freeRAMBytes: 18.4 * GB },
    )
    expect(results).toHaveLength(modelCatalog.length)
    results.forEach((r) => {
      expect(['ok', 'heavy', 'ng']).toContain(r.status)
      expect(r.model).toBeDefined()
      expect(typeof r.headroomBytes).toBe('number')
    })
  })

  it('should clamp parallel agents to valid range', () => {
    const phi3 = findModel('phi-3-mini')
    // Negative agents should be clamped to 1
    const resultNeg = evalSingle(phi3, 36 * GB, 18.4 * GB, -5)
    const result1 = evalSingle(phi3, 36 * GB, 18.4 * GB, 1)
    expect(resultNeg.headroomBytes).toBe(result1.headroomBytes)
  })
})
