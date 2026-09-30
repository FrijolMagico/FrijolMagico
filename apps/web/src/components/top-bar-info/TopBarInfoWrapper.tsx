import siteData from '@/data/site.json'
import { TopBarInfoClient } from './TopBarInfoClient'

export function TopBarInfoWrapper() {
  if (!siteData.top_bar.active) return null

  return <TopBarInfoClient data={siteData.top_bar} disableInternalCta />
}
