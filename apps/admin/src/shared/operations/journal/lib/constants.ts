export const CURRENT_SCHEMA_VERSION = 1
export const JOURNAL_DATABASE_NAME = 'frijolmagico-journal'

export const JOURNAL_OPS = {
  SET: 'set',
  UNSET: 'unset',
  PATCH: 'patch',
  RESTORE: 'restore'
} as const

export const DEFAULT_JOURNAL_META = {
  totalEntries: 0,
  lastEntryTimestamp: null,
  isDirty: false,
  schemaVersion: CURRENT_SCHEMA_VERSION
} as const
