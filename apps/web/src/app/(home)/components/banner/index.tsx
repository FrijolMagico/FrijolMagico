import { getActiveFestival } from '@/data/data-access-layer/festivals/getActiveFestival'
import { ActiveFestivalBanner } from './ActiveFestivalBanner'
import { PodcastBanner } from './PodcastBanner'

export async function Banner() {
  const { data, error } = await getActiveFestival()
  if (error || !data?.length) return <PodcastBanner />
  return <ActiveFestivalBanner festivalSlug={data[0].slug} />
}
