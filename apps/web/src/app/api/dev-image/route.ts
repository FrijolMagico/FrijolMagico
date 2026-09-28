import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_HOSTS = [
  'cdn.frijolmagico.cl',
  'cdn-dev.frijolmagico.cl'
]

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Solo disponible en desarrollo', { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')
  const w = searchParams.get('w')
  const q = searchParams.get('q')

  if (!url) {
    return new NextResponse('Falta parámetro url', { status: 400 })
  }

  try {
    const parsed = new URL(url)
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return new NextResponse('Host no permitido', { status: 403 })
    }
  } catch {
    return new NextResponse('URL inválida', { status: 400 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'FrijolMagico-Dev-Image-Proxy/1.0'
      }
    })

    if (!res.ok) {
      return new NextResponse(`Error del CDN: ${res.status}`, { status: res.status })
    }

    const contentType = res.headers.get('Content-Type') || 'application/octet-stream'
    const arrayBuffer = await res.arrayBuffer()

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return new NextResponse('Timeout descargando imagen', { status: 504 })
    }
    return new NextResponse('Error interno', { status: 500 })
  } finally {
    clearTimeout(timeout)
  }
}