import { loadSql } from '@frijolmagico/database/sql'

export const FESTIVALES_QUERY = loadSql(
  import.meta.url,
  './festivalesQuery.sql'
)
