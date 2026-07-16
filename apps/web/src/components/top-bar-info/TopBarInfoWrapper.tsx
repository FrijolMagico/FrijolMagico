import { getActiveFestival } from '@/data/data-access-layer/festivals/getActiveFestival'
import { getEditionDays } from '@/data/data-access-layer/festivals/getEditionDays'
import {
  formatDateRangeWithPlace,
  type DayWithPlace
} from '@/utils/formatDateRangeWithPlace'
import siteData from '@/data/site.json'
import { TopBarInfoClient, type TopBarData } from './TopBarInfoClient'

async function buildDynamicData(): Promise<TopBarData | null> {
  const { data } = await getActiveFestival()

  if (!data?.length) return null

  const festival = data[0]
  const daysResult = await getEditionDays(festival.id)

  const days: DayWithPlace[] = daysResult.data?.length
    ? daysResult.data.map((d) => ({ fecha: d.fecha, lugar: d.lugar }))
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
