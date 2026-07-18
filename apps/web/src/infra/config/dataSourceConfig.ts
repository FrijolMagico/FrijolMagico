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
 * 1. Vercel produccion/preview -> siempre usa config.prod (NUNCA overrideable)
 * 2. DATA_SOURCE=local -> override a base de datos local
 * 3. DATA_SOURCE=real -> override a datos reales en desarrollo
 * 4. Otros hostings (NODE_ENV=production sin VERCEL_ENV) -> config.prod
 * 5. Desarrollo -> defaults inteligentes (cms mock, database local)
 *
 * Mock data NO se controla via DATA_SOURCE. Es un fallback interno que
 * algunos repositorios usan cuando la DB local no esta disponible.
 *
 * Defaults inteligentes:
 * - Modulos con prod='cms' -> dev usa mock
 * - Modulos con prod='database' -> dev usa 'local' (file:local.db)
 *
 * @example
 * // Modulo que usa CMS en produccion, mock en desarrollo
 * const source = getDataSource({ prod: 'cms' }) // development: mock
 *
 * @example
 * // Modulo que usa database en produccion, local en desarrollo
 * const source = getDataSource({ prod: 'database' }) // development: 'local'
 *
 * @example
 * // Override para CI/build sin DB
 * DATA_SOURCE=local bun run build
 */
export function getDataSource(config: DataSourceConfig): DataSource {
  const { prod, dev } = config
  const vercelEnv = process.env.VERCEL_ENV
  const nodeEnv = process.env.NODE_ENV

  // Vercel produccion/preview: unico entorno realmente no overrideable
  if (vercelEnv === 'production' || vercelEnv === 'preview') {
    return prod
  }

  // Override global de DATA_SOURCE (local o real).
  // Se evalua ANTES del guard de NODE_ENV para que DATA_SOURCE=local
  // funcione en CI aunque next build setee NODE_ENV=production.
  const override = process.env.DATA_SOURCE

  if (override === 'local') {
    return 'local'
  }

  if (override === 'real') {
    return prod
  }

  // Proteccion para otros hostings sin VERCEL_ENV pero con
  // NODE_ENV=production. Solo aplica sin override explicito.
  if (nodeEnv === 'production') {
    return prod
  }

  // Desarrollo: defaults inteligentes
  if (dev) {
    return dev
  }

  return prod === 'cms' ? 'mock' : 'local'
}

export function isMockMode(config: DataSourceConfig): boolean {
  return getDataSource(config) === 'mock'
}
