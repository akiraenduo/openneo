export const RELEASE_VERSION = '0.8.0'

export function getDownloadUrl(version: string = RELEASE_VERSION): string {
  return `/downloads/OpenNeo-${version}-arm64.dmg`
}
