import 'server-only'

export class AssetStoreError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message)
    this.name = 'AssetStoreError'
  }
}
