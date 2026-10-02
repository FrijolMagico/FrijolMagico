import { createHash, randomUUID, timingSafeEqual } from 'node:crypto'
import { cacheLife, cacheTag, revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const CACHE_PROBE_TAG_PREFIX = 'cache-probe'
const PROCESS_INSTANCE_ID = randomUUID()
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MODES = ['immediate', 'swr'] as const

type ProbeMode = (typeof MODES)[number]

async function getCachedGeneration(runId: string, mode: ProbeMode) {
  'use cache: remote'
  cacheLife({ stale: 0, revalidate: 60, expire: 300 })
  cacheTag(`${CACHE_PROBE_TAG_PREFIX}:${runId}:${mode}`)

  return { generation: randomUUID(), createdAt: new Date().toISOString() }
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'CDN-Cache-Control': 'no-store',
      'Vercel-CDN-Cache-Control': 'no-store'
    }
  })
}

function getValidatedProbe(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const keys = [...params.keys()]
  if (
    keys.length !== 2 ||
    keys.some((key) => key !== 'runId' && key !== 'mode') ||
    params.getAll('runId').length !== 1 ||
    params.getAll('mode').length !== 1
  ) {
    return null
  }

  const runId = params.get('runId')
  const mode = params.get('mode')
  if (!runId || !UUID_PATTERN.test(runId) || !MODES.some((validMode) => validMode === mode)) {
    return null
  }

  return { runId, mode: mode as ProbeMode }
}

async function authorize(request: NextRequest) {
  await headers()

  if (process.env.VERCEL_ENV !== 'preview') {
    return jsonResponse({ error: 'Not found' }, 404)
  }

  const expectedSecret = process.env.CACHE_PROBE_SECRET
  if (!expectedSecret) {
    return jsonResponse({ error: 'Not found' }, 404)
  }

  const authorization = request.headers.get('Authorization') ?? ''
  const match = /^Bearer ([^\s]+)$/.exec(authorization)
  const suppliedDigest = createHash('sha256').update(match?.[1] ?? '').digest()
  const expectedDigest = createHash('sha256').update(expectedSecret).digest()
  if (!timingSafeEqual(suppliedDigest, expectedDigest) || match === null) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  return null
}

export async function GET(request: NextRequest) {
  const denied = await authorize(request)
  if (denied) return denied

  const probe = getValidatedProbe(request)
  if (!probe) return jsonResponse({ error: 'Invalid probe request' }, 400)

  const generation = await getCachedGeneration(probe.runId, probe.mode)
  return jsonResponse({ ...probe, ...generation, instanceId: PROCESS_INSTANCE_ID })
}

export async function POST(request: NextRequest) {
  const denied = await authorize(request)
  if (denied) return denied

  const probe = getValidatedProbe(request)
  if (!probe) return jsonResponse({ error: 'Invalid probe request' }, 400)

  const tag = `${CACHE_PROBE_TAG_PREFIX}:${probe.runId}:${probe.mode}`
  revalidateTag(tag, probe.mode === 'immediate' ? { expire: 0 } : 'max')
  return jsonResponse({ invalidated: true, ...probe })
}
