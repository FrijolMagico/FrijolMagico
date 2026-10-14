import { getActiveFestival } from '@/data/data-access-layer/festivals/getActiveFestival'
import { ActiveFestivalBanner } from './ActiveFestivalBanner'
import { FissureBanner } from './FissureBanner'
import { PodcastBanner } from './PodcastBanner'

export async function Banner() {
  const { data, error } = await getActiveFestival()
  const activeFestival = !error && data?.length ? data[0] : undefined

  if (activeFestival) {
    return (
      <FissureBanner
        landscape={{ sizing: 'fixed', height: 640 }}
        compact={{ sizing: 'square' }}
      >
        <ActiveFestivalBanner festivalSlug={activeFestival.slug} />
      </FissureBanner>
    )
  }

  return (
    <FissureBanner
      landscape={{ sizing: 'fixed', height: 420 }}
      compact={{ sizing: 'fixed', height: 360 }}
    >
      <PodcastBanner />
    </FissureBanner>
  )
}
