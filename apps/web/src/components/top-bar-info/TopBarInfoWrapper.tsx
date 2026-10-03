import { getActiveFestivalDisplay } from '@/data/data-access-layer/festivals/getActiveFestivalDisplay'
import {
  formatDateRangeWithPlace,
  type DayWithPlace
} from '@/utils/formatDateRangeWithPlace'
import siteData from '@/data/site.json'
import { TopBarInfoClient, type TopBarData } from './TopBarInfoClient'

async function buildDynamicData(): Promise<TopBarData | null> {
  const festival = await getActiveFestivalDisplay()

  if (!festival) return null

  const days: DayWithPlace[] = festival.days.length
    ? festival.days
    : [{ fecha: festival.start_date, lugar: null }]

  const dateRange = formatDateRangeWithPlace(days)

  return {
    text: `🌱 **${festival.event_name} ${festival.edition_number}:** _${dateRange}_`,
    button: {
      active: true,
      text: 'Más info 👈',
      href: `/festivales/${festival.slug}`
    }
  }
}

export async function TopBarInfoWrapper() {
  const dynamicData = await buildDynamicData()

  if (dynamicData) {
    return <TopBarInfoClient data={dynamicData} />
  }

  if (!siteData.top_bar.active) return null

  return <TopBarInfoClient data={siteData.top_bar} />
}
