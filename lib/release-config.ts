export const RELEASE_VERSION = '0.2.0'
export const GITHUB_REPO = 'open-neo/openneo'
export const STORAGE_BUCKET = 'open-neo.firebasestorage.app'

export function getDownloadUrl(version: string = RELEASE_VERSION): string {
  const filename = `OpenNeo-${version}-arm64.dmg`
  return `https://github.com/${GITHUB_REPO}/releases/download/v${version}/${filename}`
}
