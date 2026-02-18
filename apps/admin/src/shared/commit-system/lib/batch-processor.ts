export interface BatchConfig {
  maxBatchSize: number
  maxRetries: number
  timeoutMs: number
  baseDelayMs: number
}

export interface BatchProgress {
  currentBatch: number
  totalBatches: number
  processedEntries: number
  totalEntries: number
  status: 'processing' | 'completed' | 'error'
  currentRetry?: number
}

export interface BatchResult {
  success: boolean
  processedBatches: number
  failedBatches: number
  errors: Error[]
}

const DEFAULT_CONFIG: BatchConfig = {
  maxBatchSize: 50,
  maxRetries: 3,
  timeoutMs: 30000,
  baseDelayMs: 1000
}

export async function processBatches<T, R>(
  items: T[],
  processBatch: (batch: T[]) => Promise<R[]>,
  config: Partial<BatchConfig> = {},
  onProgress?: (progress: BatchProgress) => void
): Promise<BatchResult> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const batches = splitIntoBatches(items, finalConfig.maxBatchSize)

  let processedBatches = 0
  let failedBatches = 0
  const errors: Error[] = []

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]

    onProgress?.({
      currentBatch: i + 1,
      totalBatches: batches.length,
      processedEntries: i * finalConfig.maxBatchSize,
      totalEntries: items.length,
      status: 'processing'
    })

    let success = false
    let retries = 0

    while (!success && retries < finalConfig.maxRetries) {
      try {
        await processWithTimeout(
          () => processBatch(batch),
          finalConfig.timeoutMs
        )
        success = true
        processedBatches++
      } catch (error) {
        retries++
        if (retries >= finalConfig.maxRetries) {
          failedBatches++
          errors.push(error as Error)
        } else {
          const delay = finalConfig.baseDelayMs * Math.pow(2, retries - 1)

          onProgress?.({
            currentBatch: i + 1,
            totalBatches: batches.length,
            processedEntries: i * finalConfig.maxBatchSize,
            totalEntries: items.length,
            status: 'processing',
            currentRetry: retries
          })

          await sleep(delay)
        }
      }
    }
  }

  onProgress?.({
    currentBatch: batches.length,
    totalBatches: batches.length,
    processedEntries: items.length,
    totalEntries: items.length,
    status: failedBatches === 0 ? 'completed' : 'error'
  })

  return {
    success: failedBatches === 0,
    processedBatches,
    failedBatches,
    errors
  }
}

function splitIntoBatches<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = []
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }
  return batches
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function processWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    )
  ])
}
