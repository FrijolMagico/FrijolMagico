import type { CommitConfig, CommitSource, CommitExecutorFn } from './types'

export function createCommitConfig(params: {
  source: CommitSource
  executor: CommitExecutorFn
  section: string
  onSuccess?: () => void
}): CommitConfig {
  return params
}
