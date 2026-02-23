import { describe, it, expect } from 'vitest'
import { getDownloadUrl, RELEASE_VERSION } from '@/lib/release-config'

describe('getDownloadUrl', () => {
  it('returns correct URL with default version', () => {
    const url = getDownloadUrl()
    expect(url).toContain(RELEASE_VERSION)
    expect(url).toContain('arm64.dmg')
  })

  it('returns URL with custom version', () => {
    const url = getDownloadUrl('1.0.0')
    expect(url).toContain('1.0.0')
    expect(url).toContain('arm64.dmg')
  })

  it('URL contains arm64 and .dmg', () => {
    const url = getDownloadUrl()
    expect(url).toContain('arm64')
    expect(url).toContain('.dmg')
  })
})
