import type { CatalogModel } from './model-catalog'
import type { StaticSystemInfo, DynamicSystemInfo } from './types/electron'

export type CompatibilityStatus = 'ok' | 'heavy' | 'ng'

export interface ModelCompatibility {
  model: CatalogModel
  status: CompatibilityStatus
  headroomBytes: number
  requiredRAMBytes: number
  effectiveAvailableBytes: number
}

const TWO_GB = 2 * 1024 * 1024 * 1024

/**
 * Context length multiplier: longer contexts require more RAM.
 * Base is 4096 tokens. Every doubling adds ~15% RAM overhead.
 */
function contextLengthMultiplier(contextLength: number): number {
  if (contextLength <= 4096) return 1.0
  const doublings = Math.log2(contextLength / 4096)
  return 1.0 + doublings * 0.15
}

/**
 * Evaluate LLM model compatibility with the current system.
 *
 * @param models - Array of catalog models to evaluate
 * @param staticInfo - Static system info (total RAM, etc.)
 * @param dynamicInfo - Dynamic system info (free RAM, etc.)
 * @param parallelAgents - Number of agents running in parallel (1-10)
 * @param contextLength - Context window length (2048-32768)
 * @returns Array of compatibility results for each model
 */
export function evaluateModelCompatibility(
  models: CatalogModel[],
  staticInfo: Pick<StaticSystemInfo, 'totalRAMBytes'>,
  dynamicInfo: Pick<DynamicSystemInfo, 'freeRAMBytes'>,
  parallelAgents: number = 1,
  contextLength: number = 4096,
): ModelCompatibility[] {
  const clampedAgents = Math.max(1, Math.min(10, Math.round(parallelAgents)))

  return models.map((model) => {
    const ctxMultiplier = contextLengthMultiplier(contextLength)
    const adjustedRAM = model.requiredRAMBytes * ctxMultiplier

    // Each additional parallel agent uses ~30% of model RAM
    const parallelOverhead = (clampedAgents - 1) * adjustedRAM * 0.3
    const effectiveAvailableBytes = dynamicInfo.freeRAMBytes - parallelOverhead

    const headroomBytes = effectiveAvailableBytes - adjustedRAM

    let status: CompatibilityStatus
    if (headroomBytes >= TWO_GB) {
      status = 'ok'
    } else if (headroomBytes >= 0) {
      status = 'heavy'
    } else {
      status = 'ng'
    }

    return {
      model,
      status,
      headroomBytes,
      requiredRAMBytes: adjustedRAM,
      effectiveAvailableBytes,
    }
  })
}
