import { FestivalBannerContent } from './FestivalBannerContent'

export function NewFestivalBanner({}) {
  const isDev = process.env.NODE_ENV === 'development'
  const baseUrl = isDev ? (process.env.URL ?? '') : 'https://frijolmagico.cl'
  const festivalHref = `${baseUrl}/festivales/frijol-magico-xvi`

  return <FestivalBannerContent href={festivalHref} />
}
