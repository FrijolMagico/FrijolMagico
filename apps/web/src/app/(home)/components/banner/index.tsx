import { getActiveFestivalDisplay } from '@/data/data-access-layer/festivals/getActiveFestivalDisplay'
import { ActiveFestivalBanner } from './ActiveFestivalBanner'
import { PodcastBanner } from './PodcastBanner'

export async function Banner() {
  const festival = await getActiveFestivalDisplay()
  if (!festival) return <PodcastBanner />
  return <ActiveFestivalBanner festivalSlug={festival.slug} />
}
