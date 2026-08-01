import 'server-only'

export class AssetStoreError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = 'AssetStoreError'
  }
}
