import { CURRENT_SCHEMA_VERSION } from './lib/constants'
import { JournalStorage } from './lib/storage'
import type {
  JournalEntry,
  JournalPayload,
  JournalMethodResult
} from './lib/types'

const storage = new JournalStorage()

export async function writeEntry(
  section: string,
  scopeKey: string,
  payload: JournalPayload,
  meta?: { sessionId?: string }
): Promise<JournalMethodResult> {
  console.log('[DEBUG-ENTRY] Writing entry:', { section, scopeKey, payload: JSON.stringify(payload) })
  const entry: JournalEntry = {

    entryId: crypto.randomUUID(),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    section,
    scopeKey,
    payload,
    timestampMs: Date.now(),
    clientId: crypto.randomUUID(),
    sessionId: meta?.sessionId
  }

  return storage.writeEntry(entry)
}

export async function getLatestEntries(
  section: string
): Promise<JournalEntry[]> {
  const entries = await storage.getEntries(section)

  if (!entries.success) {
    console.error(
      `[ChangeJournal] Failed to get entries for section "${section}":`,
      entries.error
    )
    return []
  }

  return entries.result.reverse()
}

export async function hasEntries(section: string): Promise<boolean> {
  const entries = await storage.getEntries(section)

  if (!entries.success) {
    console.error(
      `[ChangeJournal] Failed to check entries for section "${section}":`,
      entries.error
    )
    return false
  }

  return entries.success && entries.result.length > 0
}

export async function clearSection(section: string): Promise<void> {
  const result = await storage.clearSection(section)

  if (!result.success) {
    console.error(
      `[ChangeJournal] Failed to clear section "${section}":`,
      result.error
    )
  }
}

export async function getSectionsWithChanges(): Promise<
  Array<{ section: string; count: number }>
> {
  const sections = await storage.getAllSections()

  if (!sections.success) {
    console.error('[ChangeJournal] Failed to get sections:', sections.error)
    return []
  }

  const results = await Promise.all(
    sections.result.map(async (section) => {
      const entries = await storage.getEntries(section)
      if (!entries.success) {
        console.error(
          `[ChangeJournal] Failed to get entries for section "${section}":`,
          entries.error
        )
        return { section, count: 0 }
      }

      return { section, count: entries.result.length }
    })
  )

  return results
}
