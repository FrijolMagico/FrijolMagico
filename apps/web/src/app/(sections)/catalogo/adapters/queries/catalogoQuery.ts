import { loadSql } from '@frijolmagico/database/sql'

export const CATALOG_QUERY = loadSql(import.meta.url, './catalogoQuery.sql')
