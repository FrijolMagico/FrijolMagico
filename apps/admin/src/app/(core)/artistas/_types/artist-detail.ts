export interface ArtistDetailImage {
  id: number
  type: 'avatar' | 'galeria'
  url: string
  order: number
}

interface EditionContext {
  id: number
  participationId: number
  editionId: number
  editionName: string | null
  editionNumber: string
  editionCreatedAt: string
  editionDate: string
  eventId: number | null
  eventName: string | null
  status: string
  notes: string | null
  participationNotes: string | null
}

export interface ArtistDetailActivity extends EditionContext {
  type: string
  title: string | null
}

export interface ArtistDetailExhibition extends EditionContext {
  discipline: string
}

export interface ArtistDetail {
  images: ArtistDetailImage[]
  activities: ArtistDetailActivity[]
  exhibitions: ArtistDetailExhibition[]
  activityCount: number
  exhibitionCount: number
}
