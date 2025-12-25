import { z } from 'zod'

/**
 * Schema para validar filas del Google Sheet del catalogo
 *
 * Validacion mixta:
 * - Campos criticos: error si invalidos
 * - Campos permisivos: se transforman a null si invalidos
 *
 * Nota: El campo rrss del sheet es un string simple (URL).
 * La transformacion a RrssObject ocurre en el importer.
 */
export const catalogSheetRowSchema = z.object({
  // ===========================================================================
  // Campos ignorados (no se usan en tabla artista)
  // ===========================================================================
  id: z.string().optional(),
  category: z.string().optional(), // Se usara en participante, no en artista
  avatar: z.string().optional(), // Sin CDN por ahora

  // ===========================================================================
  // CRITICO - requerido para artista.nombre (NOT NULL en DB)
  // ===========================================================================
  name: z.string().min(1, 'Name is required'),

  // ===========================================================================
  // Permisivos - se transforman a null si invalidos o vacios
  // ===========================================================================
  email: z
    .string()
    .optional()
    .transform((v) => v?.trim() || '')
    .pipe(
      z
        .string()
        .email()
        .or(z.literal(''))
        .transform((v) => v || null),
    ),

  // rrss es un string simple del sheet (ej: "https://instagram.com/user")
  // La transformacion a RrssObject tipado ocurre en el importer
  rrss: z
    .string()
    .optional()
    .transform((v) => v?.trim() || null),

  collective: z
    .string()
    .optional()
    .transform((v) => v?.trim() || null),

  // Ciudad del artista
  city: z
    .string()
    .optional()
    .transform((v) => v?.trim() || null),

  // Pais del artista
  country: z
    .string()
    .optional()
    .transform((v) => v?.trim() || null),

  // Bio/descripcion del artista (Markdown)
  bio: z
    .string()
    .optional()
    .transform((v) => v?.trim() || null),
})

/**
 * Tipo inferido de una fila del sheet
 */
export type CatalogSheetRow = z.infer<typeof catalogSheetRowSchema>

/**
 * Resultado de validacion con soporte para warnings
 */
export interface CatalogSheetRowValidationResult {
  success: boolean
  data?: CatalogSheetRow
  errors?: string[]
  warnings?: string[]
}

/**
 * Valida una fila del Google Sheet del catalogo
 *
 * - Si campos criticos fallan -> success: false, errors: [...]
 * - Si campos permisivos fallan -> success: true, warnings: [...], data con nulls
 *
 * @param data - Fila cruda del Google Sheet
 * @returns Resultado de validacion con data, errors y/o warnings
 */
export function validateCatalogSheetRow(
  data: unknown,
): CatalogSheetRowValidationResult {
  // Campos que causan error si fallan (vs warning)
  const criticalFields = ['name']

  const result = catalogSheetRowSchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  // Separar errores criticos de warnings
  const errors: string[] = []
  const warnings: string[] = []

  for (const error of result.error.issues) {
    const field = error.path[0]?.toString() || ''
    const message = `${field}: ${error.message}`

    if (criticalFields.includes(field)) {
      errors.push(message)
    } else {
      warnings.push(message)
    }
  }

  // Si solo hay warnings (no errores criticos), intentar con schema permisivo
  if (errors.length === 0) {
    const permissiveData = {
      ...(data as Record<string, unknown>),
      // Forzar campos permisivos a null para que pasen validacion
      email: '',
      rrss: '',
    }

    const retryResult = catalogSheetRowSchema.safeParse(permissiveData)

    if (retryResult.success) {
      return {
        success: true,
        data: retryResult.data,
        warnings,
      }
    }
  }

  return { success: false, errors, warnings }
}
