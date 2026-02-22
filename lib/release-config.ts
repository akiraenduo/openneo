export const RELEASE_VERSION = '0.1.0'
export const STORAGE_BUCKET = 'open-neo.firebasestorage.app'

export function getDownloadUrl(version: string = RELEASE_VERSION): string {
  const path = encodeURIComponent(`installers/OpenNeo-${version}-arm64.dmg`)
  return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${path}?alt=media`
}
