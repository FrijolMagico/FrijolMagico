import 'server-only'

export interface GithubRelease {
  id: number
  name: string
  tagName: string
  publishedAt: string
  body: string
}

interface GithubApiRelease {
  id: number
  name: string | null
  tag_name: string
  published_at: string
  body: string | null
}

function isGithubApiRelease(value: unknown): value is GithubApiRelease {
  if (!value || typeof value !== 'object') return false

  const release = value as Record<string, unknown>
  return (
    typeof release.id === 'number' &&
    Number.isInteger(release.id) &&
    (typeof release.name === 'string' || release.name === null) &&
    typeof release.tag_name === 'string' &&
    typeof release.published_at === 'string' &&
    !Number.isNaN(Date.parse(release.published_at)) &&
    (typeof release.body === 'string' || release.body === null)
  )
}

export async function getGithubReleases(): Promise<GithubRelease[]> {
  try {
    const releases: GithubRelease[] = []

    for (let page = 1; ; page += 1) {
      const response = await fetch(
        `https://api.github.com/repos/FrijolMagico/FrijolMagico/releases?per_page=100&page=${page}`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
          },
          next: { revalidate: 3600 }
        }
      )

      if (!response.ok) return []

      const data: unknown = await response.json()
      if (!Array.isArray(data)) return []
      if (data.length === 0) break
      if (!data.every(isGithubApiRelease)) return []

      releases.push(
        ...data.map((release) => ({
          id: release.id,
          name: release.name?.trim() || release.tag_name,
          tagName: release.tag_name,
          publishedAt: release.published_at,
          body: release.body ?? ''
        }))
      )
    }

    return releases.sort(
      (left, right) =>
        Date.parse(right.publishedAt) - Date.parse(left.publishedAt) ||
        right.id - left.id
    )
  } catch {
    return []
  }
}
