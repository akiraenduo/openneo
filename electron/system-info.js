const os = require('os')
const { execSync } = require('child_process')

/**
 * Parse macOS sysctl output for a given key.
 */
function sysctl(key) {
  try {
    return execSync(`sysctl -n ${key}`, { encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
}

/**
 * Run a shell command and return stdout, or empty string on failure.
 */
function exec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', timeout: 5000 }).trim()
  } catch {
    return ''
  }
}

/**
 * Get static system info (called once at startup).
 * CPU model, chip generation, GPU cores, total RAM, disk capacity, OS version.
 */
function getStaticSystemInfo() {
  const cpuModel = sysctl('machdep.cpu.brand_string') || os.cpus()[0]?.model || 'Unknown'

  // Detect Apple Silicon chip generation
  let chipGeneration = 'Unknown'
  const chipRaw = exec('system_profiler SPHardwareDataType 2>/dev/null | grep "Chip"')
  const chipMatch = chipRaw.match(/Chip:\s*(.+)/)
  if (chipMatch) {
    chipGeneration = chipMatch[1].trim()
  }

  // GPU cores
  let gpuCores = 0
  const gpuRaw = exec('system_profiler SPDisplaysDataType 2>/dev/null | grep "Total Number of Cores"')
  const gpuMatch = gpuRaw.match(/Total Number of Cores:\s*(\d+)/)
  if (gpuMatch) {
    gpuCores = parseInt(gpuMatch[1], 10)
  }

  const totalRAMBytes = os.totalmem()

  // Disk total and free
  let diskTotalBytes = 0
  let diskFreeBytes = 0
  const dfOutput = exec('df -k / 2>/dev/null')
  const dfLines = dfOutput.split('\n')
  if (dfLines.length >= 2) {
    const parts = dfLines[1].split(/\s+/)
    if (parts.length >= 4) {
      diskTotalBytes = parseInt(parts[1], 10) * 1024
      diskFreeBytes = parseInt(parts[3], 10) * 1024
    }
  }

  // OS version
  const osVersion = exec('sw_vers -productVersion') || 'Unknown'
  const architecture = os.arch()

  return {
    cpuModel,
    chipGeneration,
    gpuCores,
    totalRAMBytes,
    diskTotalBytes,
    diskFreeBytes,
    osVersion,
    architecture,
  }
}

/**
 * Get dynamic system info (polled periodically).
 * Free RAM, memory pressure, CPU load, disk free.
 */
function getDynamicSystemInfo() {
  const freeRAMBytes = os.freemem()

  // Memory pressure via vm_stat
  let memoryPressure = 'nominal'
  const vmStat = exec('vm_stat 2>/dev/null')
  if (vmStat) {
    const pageSize = 16384 // Apple Silicon default
    const freeMatch = vmStat.match(/Pages free:\s+(\d+)/)
    const inactiveMatch = vmStat.match(/Pages inactive:\s+(\d+)/)
    const compressedMatch = vmStat.match(/Pages occupied by compressor:\s+(\d+)/)
    const totalPages = os.totalmem() / pageSize

    if (freeMatch && inactiveMatch) {
      const freePages = parseInt(freeMatch[1], 10)
      const inactivePages = parseInt(inactiveMatch[1], 10)
      const compressedPages = compressedMatch ? parseInt(compressedMatch[1], 10) : 0
      const availableRatio = (freePages + inactivePages) / totalPages

      if (compressedPages / totalPages > 0.3 || availableRatio < 0.05) {
        memoryPressure = 'critical'
      } else if (availableRatio < 0.15) {
        memoryPressure = 'warning'
      }
    }
  }

  // CPU load (1-minute average as percentage)
  const loadAvg = os.loadavg()[0]
  const cpuCount = os.cpus().length
  const cpuLoadPercent = Math.min(Math.round((loadAvg / cpuCount) * 100 * 10) / 10, 100)

  // Disk free
  let diskFreeBytes = 0
  const dfOutput = exec('df -k / 2>/dev/null')
  const dfLines = dfOutput.split('\n')
  if (dfLines.length >= 2) {
    const parts = dfLines[1].split(/\s+/)
    if (parts.length >= 4) {
      diskFreeBytes = parseInt(parts[3], 10) * 1024
    }
  }

  return {
    freeRAMBytes,
    memoryPressure,
    cpuLoadPercent,
    diskFreeBytes,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Get top 50 processes sorted by CPU usage.
 */
function getProcessList() {
  const psOutput = exec('ps -axo pid,ppid,%cpu,rss,comm -r 2>/dev/null')
  if (!psOutput) return []

  const lines = psOutput.split('\n').slice(1) // skip header
  const processes = []

  for (const line of lines) {
    if (processes.length >= 50) break
    const parts = line.trim().split(/\s+/)
    if (parts.length < 5) continue

    const pid = parseInt(parts[0], 10)
    const ppid = parseInt(parts[1], 10)
    const cpuPercent = parseFloat(parts[2])
    const ramBytes = parseInt(parts[3], 10) * 1024 // rss is in KB
    const command = parts.slice(4).join(' ')

    if (!isNaN(pid)) {
      processes.push({ pid, ppid, cpuPercent, ramBytes, command })
    }
  }

  return processes
}

/**
 * Get battery information.
 */
function getBatteryInfo() {
  const batteryRaw = exec('pmset -g batt 2>/dev/null')

  let percent = -1
  let charging = false
  let timeRemaining = ''

  const percentMatch = batteryRaw.match(/(\d+)%/)
  if (percentMatch) {
    percent = parseInt(percentMatch[1], 10)
  }

  charging = batteryRaw.includes('AC Power') || batteryRaw.includes('charging')

  const timeMatch = batteryRaw.match(/(\d+:\d+) remaining/)
  if (timeMatch) {
    timeRemaining = timeMatch[1]
  } else if (batteryRaw.includes('(no estimate)')) {
    timeRemaining = 'calculating'
  } else if (charging) {
    timeRemaining = 'charging'
  }

  return { percent, charging, timeRemaining }
}

module.exports = {
  getStaticSystemInfo,
  getDynamicSystemInfo,
  getProcessList,
  getBatteryInfo,
}
