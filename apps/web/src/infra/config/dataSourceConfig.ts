export type DataSource = 'mock' | 'cms' | 'database' | 'local'

interface DataSourceConfig {
  /** Fuente de datos en produccion/preview (requerido) */
  prod: DataSource
  /** Fuente de datos en desarrollo (opcional, usa default inteligente si no se especifica) */
  dev?: DataSource
}

/**
 * Determina la fuente de datos basandose en la configuracion del modulo y el ambiente.
 *
 * Prioridad:
 * 1. Produccion/Preview -> siempre usa config.prod (NUNCA mock)
 * 2. Desarrollo con DATA_SOURCE=real -> usa config.prod para todos los modulos
 * 3. Desarrollo con DATA_SOURCE=local -> usa defaults inteligentes (cms->mock, database->local)
 * 4. Desarrollo sin override -> usa defaults inteligentes (misma logica que DATA_SOURCE=local)
 *
 * Defaults inteligentes:
 * - Modulos con prod='cms' -> dev usa 'mock'
 * - Modulos con prod='database' -> dev usa 'local' (file:local.db)
 *
 * IMPORTANTE: En produccion, mock data NUNCA es permitida, independiente de
 * cualquier variable de entorno. Esta es una proteccion de seguridad.
 *
 * @example
 * // Modulo que usa CMS en produccion, mock en desarrollo
 * const source = getDataSource({ prod: 'cms' }) // development: 'mock'
 *
 * @example
 * // Modulo que usa database en produccion, local en desarrollo
 * const source = getDataSource({ prod: 'database' }) // development: 'local'
 *
 * @example
 * // Override para usar data real en desarrollo
 * DATA_SOURCE=real bun run dev
 */
export function getDataSource(config: DataSourceConfig): DataSource {
  const { prod, dev } = config
  const vercelEnv = process.env.VERCEL_ENV
  const nodeEnv = process.env.NODE_ENV

  // Produccion/Preview: siempre usar la fuente real, NUNCA mock
  // Proteccion doble: VERCEL_ENV para Vercel, NODE_ENV para otros hostings
  const isProduction =
    vercelEnv === 'production' ||
    vercelEnv === 'preview' ||
    nodeEnv === 'production'

  if (isProduction) {
    return prod
  }

  // Desarrollo: verificar override global
  const override = process.env.DATA_SOURCE

  if (override === 'real') {
    return prod
  }

  // DATA_SOURCE=local o sin override: usar defaults inteligentes
  if (dev) {
    return dev
  }

  // Default inteligente si no hay config.dev explicito:
  // - cms -> mock
  // - database -> local
  return prod === 'cms' ? 'mock' : 'local'
}

export function isMockMode(config: DataSourceConfig): boolean {
  return getDataSource(config) === 'mock'
}
