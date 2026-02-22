import { describe, it, expect } from 'vitest'
import { modelCatalog } from '@/lib/model-catalog'

describe('modelCatalog', () => {
  // TC-007: All models have required fields
  it('should have all required fields for every model', () => {
    modelCatalog.forEach((model) => {
      expect(model.id).toBeTruthy()
      expect(model.family).toBeTruthy()
      expect(model.name).toBeTruthy()
      expect(model.parameterSize).toBeTruthy()
      expect(model.quantization).toBeTruthy()
      expect(model.description).toBeTruthy()
      expect(typeof model.requiredRAMBytes).toBe('number')
      expect(typeof model.diskSizeBytes).toBe('number')
      expect(Array.isArray(model.contextLengthOptions)).toBe(true)
    })
  })

  // TC-008: requiredRAMBytes > 0
  it('should have positive requiredRAMBytes for every model', () => {
    modelCatalog.forEach((model) => {
      expect(model.requiredRAMBytes).toBeGreaterThan(0)
    })
  })

  // TC-009: contextLengthOptions non-empty
  it('should have non-empty contextLengthOptions for every model', () => {
    modelCatalog.forEach((model) => {
      expect(model.contextLengthOptions.length).toBeGreaterThan(0)
      model.contextLengthOptions.forEach((cl) => {
        expect(cl).toBeGreaterThan(0)
      })
    })
  })

  it('should have positive diskSizeBytes for every model', () => {
    modelCatalog.forEach((model) => {
      expect(model.diskSizeBytes).toBeGreaterThan(0)
    })
  })

  it('should have unique IDs', () => {
    const ids = modelCatalog.map((m) => m.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('should include expected model families', () => {
    const families = new Set(modelCatalog.map((m) => m.family))
    expect(families.has('Llama')).toBe(true)
    expect(families.has('Mistral')).toBe(true)
    expect(families.has('Phi')).toBe(true)
    expect(families.has('Gemma')).toBe(true)
    expect(families.has('Qwen')).toBe(true)
  })
})
