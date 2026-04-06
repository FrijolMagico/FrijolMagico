/**
 * Framework-agnostic business rules for edition participations.
 *
 * These predicates encode domain invariants without depending on Zod
 * or any other validation library so they can be reused in guards,
 * server actions, and tests.
 */

/**
 * A valid participation must reference exactly ONE entity:
 * an artist, a band, or a collective — never zero, never more than one.
 *
 * The `?` modifiers are required because drizzle-zod emits nullable
 * optional fields for columns without `.notNull()`. At runtime the
 * values are always `number | null` in this flow.
 */
export function hasExactlyOneEntity(data: {
  artistaId?: number | null
  bandaId?: number | null
  agrupacionId?: number | null
}): boolean {
  return (
    [data.artistaId, data.bandaId, data.agrupacionId].filter((id) => id != null)
      .length === 1
  )
}
