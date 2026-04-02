import { createLoader, parseAsString, parseAsStringLiteral } from 'nuqs/server'

import { searchParser } from '@/shared/lib/list-parsers'
import { PARTICIPATION_STATUSES } from '../_constants/participations.constants'

export const participacionesSearchParams = {
  ...searchParser,
  edicion: parseAsString,
  estado: parseAsStringLiteral(PARTICIPATION_STATUSES)
}

export const loadParticipacionesSearchParams = createLoader(
  participacionesSearchParams
)
