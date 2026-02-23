import { NextResponse } from 'next/server'
import { GITHUB_REPO, RELEASE_VERSION, getDownloadUrl } from '@/lib/release-config'

export const revalidate = 300 // cache for 5 minutes

export async function GET() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      { next: { revalidate: 300 } }
    )

    if (!res.ok) throw new Error(`GitHub API ${res.status}`)

    const release = await res.json()
    const version = (release.tag_name as string).replace(/^v/, '')
    const dmgAsset = (release.assets as Array<{ name: string; browser_download_url: string }>)
      .find(a => a.name.endsWith('-arm64.dmg'))

    return NextResponse.json({
      version,
      downloadUrl: dmgAsset?.browser_download_url ?? getDownloadUrl(version),
    })
  } catch {
    return NextResponse.json({
      version: RELEASE_VERSION,
      downloadUrl: getDownloadUrl(),
    })
  }
}
