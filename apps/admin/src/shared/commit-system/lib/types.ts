export type SectionName = 'organizacion' | 'catalogo' | 'artista' | 'evento'

export interface IdMapping {
  tempId: string
  realId: number
  section: SectionName
}

export interface SaveResult {
  success: boolean
  error?: string
  errorCode?: 'VALIDATION_ERROR' | 'DB_ERROR' | 'NETWORK_ERROR' | 'UNKNOWN'
  mappings?: IdMapping[]
  processedCount?: number
}

export interface BatchProgress {
  current: number
  total: number
  status: 'idle' | 'processing' | 'completed' | 'error'
}

export interface RemotePersistenceConfig {
  apiBaseUrl: string
  timeout: number
  retryAttempts: number
}
