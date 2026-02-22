export interface CatalogModel {
  id: string
  family: string
  name: string
  parameterSize: string
  quantization: string
  requiredRAMBytes: number
  diskSizeBytes: number
  contextLengthOptions: number[]
  description: string
}

const GB = 1024 * 1024 * 1024

export const modelCatalog: CatalogModel[] = [
  {
    id: 'llama-3.2-8b',
    family: 'Llama',
    name: 'Llama 3.2 8B',
    parameterSize: '8B',
    quantization: 'Q4_K_M',
    requiredRAMBytes: 6 * GB,
    diskSizeBytes: 4.9 * GB,
    contextLengthOptions: [2048, 4096, 8192],
    description: 'Compact model suitable for most tasks on Apple Silicon Macs.',
  },
  {
    id: 'llama-3.3-70b',
    family: 'Llama',
    name: 'Llama 3.3 70B',
    parameterSize: '70B',
    quantization: 'Q4_K_M',
    requiredRAMBytes: 42 * GB,
    diskSizeBytes: 38 * GB,
    contextLengthOptions: [2048, 4096, 8192, 16384],
    description: 'High-capacity model requiring significant RAM. Best on 64GB+ Macs.',
  },
  {
    id: 'llama-3.1-405b',
    family: 'Llama',
    name: 'Llama 3.1 405B',
    parameterSize: '405B',
    quantization: 'Q2_K',
    requiredRAMBytes: 180 * GB,
    diskSizeBytes: 160 * GB,
    contextLengthOptions: [2048, 4096, 8192, 16384, 32768],
    description: 'Largest open model. Requires 192GB+ RAM for inference.',
  },
  {
    id: 'mistral-7b',
    family: 'Mistral',
    name: 'Mistral 7B',
    parameterSize: '7B',
    quantization: 'Q5_K_M',
    requiredRAMBytes: 5.5 * GB,
    diskSizeBytes: 5.1 * GB,
    contextLengthOptions: [2048, 4096, 8192],
    description: 'Efficient 7B model with strong reasoning capabilities.',
  },
  {
    id: 'phi-3-mini',
    family: 'Phi',
    name: 'Phi-3 Mini',
    parameterSize: '3.8B',
    quantization: 'Q4_K_M',
    requiredRAMBytes: 3 * GB,
    diskSizeBytes: 2.3 * GB,
    contextLengthOptions: [2048, 4096],
    description: 'Ultra-compact model from Microsoft. Fast inference, low resource usage.',
  },
  {
    id: 'gemma-2-27b',
    family: 'Gemma',
    name: 'Gemma 2 27B',
    parameterSize: '27B',
    quantization: 'Q4_K_M',
    requiredRAMBytes: 18 * GB,
    diskSizeBytes: 16 * GB,
    contextLengthOptions: [2048, 4096, 8192],
    description: 'Google\'s mid-range model. Good balance of quality and resource use.',
  },
  {
    id: 'qwen-2.5-14b',
    family: 'Qwen',
    name: 'Qwen 2.5 14B',
    parameterSize: '14B',
    quantization: 'Q4_K_M',
    requiredRAMBytes: 10 * GB,
    diskSizeBytes: 8.5 * GB,
    contextLengthOptions: [2048, 4096, 8192, 16384],
    description: 'Alibaba\'s multilingual model with strong CJK support.',
  },
  {
    id: 'qwen-2.5-72b',
    family: 'Qwen',
    name: 'Qwen 2.5 72B',
    parameterSize: '72B',
    quantization: 'Q4_K_M',
    requiredRAMBytes: 44 * GB,
    diskSizeBytes: 40 * GB,
    contextLengthOptions: [2048, 4096, 8192, 16384, 32768],
    description: 'Large multilingual model. Requires 64GB+ RAM.',
  },
]
