export interface DraftData {
  data: any
  updatedAt: string
}

export interface DraftManager {
  getDraft(): DraftData | null
  saveDraft(data: any): void
  clear(): void
  start(): () => void
}
