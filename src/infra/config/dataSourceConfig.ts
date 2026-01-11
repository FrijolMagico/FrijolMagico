export type DataSource = 'mock' | 'cms' | 'database'

interface DataSourceConfig {
  /** Fuente de datos en produccion/preview (requerido) */
  prod: DataSource
  /** Fuente de datos en desarrollo (opcional, default: 'mock') */
  dev?: DataSource
}

/**
 * Determina la fuente de datos basandose en la configuracion del modulo y el ambiente.
 *
 * Prioridad:
 * 1. Produccion/Preview -> siempre usa config.prod
 * 2. Desarrollo con DATA_SOURCE=real -> usa config.prod
 * 3. Desarrollo con DATA_SOURCE=mock -> usa 'mock'
 * 4. Desarrollo sin override -> usa config.dev (default: 'mock')
 *
 * @example
 * // Modulo que usa CMS en produccion, mock en desarrollo
 * const source = getDataSource({ prod: 'cms' })
 *
 * @example
 * // Modulo que usa database en produccion, database tambien en desarrollo
 * const source = getDataSource({ prod: 'database', dev: 'database' })
 */
export function getDataSource(config: DataSourceConfig): DataSource {
  const { prod, dev = 'mock' } = config
  const vercelEnv = process.env.VERCEL_ENV

  // Produccion/Preview: siempre usar la fuente real
  if (vercelEnv === 'production' || vercelEnv === 'preview') {
    return prod
  }

  // Desarrollo: verificar override global
  const override = process.env.DATA_SOURCE

  if (override === 'real') {
    return prod
  }

  if (override === 'mock') {
    return 'mock'
  }

  // Sin override: usar configuracion de desarrollo del modulo
  return dev
}

export function isMockMode(config: DataSourceConfig): boolean {
  return getDataSource(config) === 'mock'
}
