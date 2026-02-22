export const RELEASE_VERSION = '0.1.0'
export const STORAGE_BUCKET = 'open-neo.firebasestorage.app'

export function getDownloadUrl(version: string = RELEASE_VERSION): string {
  return `https://${STORAGE_BUCKET}/installers/OpenNeo-${version}-arm64.dmg`
}
