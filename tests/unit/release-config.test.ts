import { describe, it, expect } from 'vitest'
import { RELEASE_VERSION, getDownloadUrl } from '@/lib/release-config'

describe('release-config', () => {
  it('RELEASE_VERSION is a valid semver string', () => {
    expect(RELEASE_VERSION).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('getDownloadUrl() returns a URL ending with .dmg', () => {
    expect(getDownloadUrl()).toMatch(/\.dmg$/)
  })

  it('getDownloadUrl() contains the version string', () => {
    expect(getDownloadUrl()).toContain(RELEASE_VERSION)
  })

  it('getDownloadUrl() contains arm64', () => {
    expect(getDownloadUrl()).toContain('arm64')
  })

  it('getDownloadUrl() points to GitHub Releases', () => {
    expect(getDownloadUrl()).toContain('github.com')
    expect(getDownloadUrl()).toContain('/releases/download/')
  })
})
