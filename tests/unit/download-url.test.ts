import { describe, it, expect } from 'vitest'
import { getDownloadUrl, RELEASE_VERSION } from '@/lib/release-config'

describe('getDownloadUrl', () => {
  it('returns correct URL with default version', () => {
    expect(getDownloadUrl()).toBe(`/downloads/OpenNeo-${RELEASE_VERSION}-arm64.dmg`)
  })

  it('returns URL with custom version', () => {
    expect(getDownloadUrl('1.0.0')).toBe('/downloads/OpenNeo-1.0.0-arm64.dmg')
  })

  it('URL contains arm64 and .dmg', () => {
    const url = getDownloadUrl()
    expect(url).toContain('arm64')
    expect(url).toContain('.dmg')
  })
})
