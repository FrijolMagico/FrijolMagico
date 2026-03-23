import type { Band } from '../_schemas/banda.schema'

export type BandRow = Pick<
  Band,
  | 'id'
  | 'name'
  | 'description'
  | 'email'
  | 'phone'
  | 'city'
  | 'country'
  | 'active'
  | 'createdAt'
>

export type DeletedBandRow = BandRow & {
  deletedAt: string
}
