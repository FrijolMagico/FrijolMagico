const CRONITOR_BASE_URL = process.env.CRONITOR_URL

interface CronitorPingOptions {
  state: 'run' | 'complete' | 'fail'
  message?: string
  metrics?: Array<{ name: string; value: number }>
}

export const sendCronitorPing = async ({
  state,
  message,
  metrics
}: CronitorPingOptions) => {
  if (!CRONITOR_BASE_URL) return

  const cronitorUrl = new URL('featured-artists-rotation', CRONITOR_BASE_URL)

  if (message) {
    cronitorUrl.searchParams.append('msg', message)
  }

  metrics?.forEach((m) => {
    cronitorUrl.searchParams.append('metric', `${m.name}:${m.value}`)
  })

  try {
    await fetch(cronitorUrl.toString())
  } catch (error) {
    console.error('[cron/featured-artists] Cronitor ping failed', {
      state,
      error
    })
  }
}
