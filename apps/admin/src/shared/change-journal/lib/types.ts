export type JournalMethodResult<T = unknown> =
  | { success: true; result: T }
  | { success: false; result?: T; error: string }

export type JournalPayload =
  | { op: 'set'; value: unknown }
  | { op: 'unset' }
  | { op: 'patch'; value: unknown }
  | { op: 'restore' }

export interface JournalEntry {
  entryId: string
  schemaVersion: number
  section: string
  scopeKey: string
  payload: JournalPayload
  timestampMs: number
  clientId: string
  sessionId?: string
}

export interface JournalMeta {
  totalEntries: number
  lastEntryTimestamp: number | null
  isDirty: boolean
  schemaVersion: number
}
