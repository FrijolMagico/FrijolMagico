import { Organizacion, OrganizacionEquipo } from '@frijolmagico/database/orm'

export type RawOrganization = Organizacion
export type RawTeamMember = OrganizacionEquipo

export type Organization = Omit<RawOrganization, 'createdAt' | 'updatedAt'>

/**
 * Datos del formulario de miembro de equipo.
 *
 * Usado para agregar/editar miembros del equipo.
 * El campo `id` es opcional para nuevos miembros.
 *
 * ## Estados del Miembro
 *
 * - **Nuevo**: `isNew = true`, sin `id`
 * - **Existente**: `id` definido, `isNew` undefined
 * - **Eliminado**: `isDeleted = true`, pendiente de commit
 *
 * @example
 * ```typescript
 * // Nuevo miembro
 * const newMember: OrganizacionEquipoFormData = {
 *   nombre: 'Juan Pérez',
 *   cargo: 'Director',
 *   rrss: '@juanperez',
 *   isNew: true
 * }
 *
 * // Miembro existente
 * const existingMember: OrganizacionEquipoFormData = {
 *   id: 123,
 *   nombre: 'María García',
 *   cargo: 'Coordinadora',
 *   rrss: '@mariagarcia'
 * }
 * ```
 */

export interface TeamMember extends Pick<
  RawTeamMember,
  'nombre' | 'cargo' | 'rrss'
> {
  id?: number
  /** Marca si es nuevo (no persistido aún) */
  isNew?: boolean
  /** Marca si está eliminado (pendiente de commit) */
  isDeleted?: boolean
}

/**
 * Resultado de operación de actualización.
 *
 * Patrón Result usado para manejar éxito/error de forma explícita.
 *
 * @example
 * ```typescript
 * // Server Action retorna resultado tipado
 * export async function updateOrganizacion(
 *   data: OrganizacionFormData
 * ): Promise<UpdateOrganizacionResult> {
 *   try {
 *     const [updated] = await db
 *       .update(organizacion)
 *       .set(data)
 *       .where(eq(organizacion.id, ORG_ID))
 *       .returning()
 *
 *     return { success: true, data: updated }
 *   } catch (error) {
 *     return {
 *       success: false,
 *       error: error instanceof Error ? error.message : 'Error desconocido'
 *     }
 *   }
 * }
 *
 * // Cliente maneja resultado
 * const result = await updateOrganizacion(formData)
 *
 * if (result.success) {
 *   toast.success('Guardado exitosamente')
 * } else {
 *   toast.error(result.error)
 * }
 * ```
 */
export interface UpdateOrganizationResult {
  /** Indica si la operación fue exitosa */
  success: boolean

  /** Mensaje de error (solo si success = false) */
  error?: string

  /** Datos actualizados (solo si success = true) */
  data?: Organizacion
}
