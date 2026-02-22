import { describe, it, expect } from 'vitest'
import { RELEASE_VERSION, GITHUB_REPO, getDownloadUrl } from '@/lib/release-config'

describe('release-config', () => {
  it('RELEASE_VERSION is a valid semver string', () => {
    expect(RELEASE_VERSION).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('GITHUB_REPO is a non-empty string with owner/repo format', () => {
    expect(GITHUB_REPO).toMatch(/^[^/]+\/[^/]+$/)
  })

  it('getDownloadUrl() returns a URL ending with .dmg', () => {
    expect(getDownloadUrl()).toMatch(/\.dmg$/)
  })

  it('getDownloadUrl() contains the version string', () => {
    expect(getDownloadUrl()).toContain(RELEASE_VERSION)
  })

  it('getDownloadUrl() is a valid GitHub Releases URL', () => {
    const url = getDownloadUrl()
    expect(url).toMatch(/^https:\/\/github\.com\/[^/]+\/[^/]+\/releases\/download\/v/)
  })

  it('getDownloadUrl() contains arm64', () => {
    expect(getDownloadUrl()).toContain('arm64')
  })
})
