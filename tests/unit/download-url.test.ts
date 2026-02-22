import { describe, it, expect } from 'vitest'
import { getDownloadUrl, RELEASE_VERSION, GITHUB_REPO } from '@/lib/release-config'

describe('getDownloadUrl', () => {
  it('returns correct URL with default version', () => {
    const expected = `https://github.com/${GITHUB_REPO}/releases/download/v${RELEASE_VERSION}/OpenNeo-${RELEASE_VERSION}-arm64.dmg`
    expect(getDownloadUrl()).toBe(expected)
  })

  it('returns URL with custom version', () => {
    const url = getDownloadUrl('1.0.0')
    expect(url).toBe(`https://github.com/${GITHUB_REPO}/releases/download/v1.0.0/OpenNeo-1.0.0-arm64.dmg`)
  })

  it('URL contains arm64 and .dmg', () => {
    const url = getDownloadUrl()
    expect(url).toContain('arm64')
    expect(url).toContain('.dmg')
  })
})
