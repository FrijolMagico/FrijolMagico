import { ReleaseList } from './_components/release-list'
import { getGithubReleases } from './_lib/data-access-layer/get-github-releases'

export default async function ChangelogPage() {
  const releases = await getGithubReleases()

  return (
    <section className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Changelog</h1>
        <p className='text-muted-foreground mt-1'>Release history</p>
      </div>
      <ReleaseList releases={releases} />
    </section>
  )
}
