export const RELEASE_VERSION = '0.8.0'
export const GITHUB_REPO = 'anthropics/openneo'

export function getDownloadUrl(version: string = RELEASE_VERSION): string {
  return `https://github.com/${GITHUB_REPO}/releases/download/v${version}/OpenNeo-${version}-arm64.dmg`
}
