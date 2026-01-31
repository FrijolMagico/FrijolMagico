/**
 * Shared database types across the monorepo
 * Add domain-specific types here as needed
 */

export interface DatabaseConfig {
  url: string
  authToken?: string
}
