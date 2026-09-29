import { NextResponse, type NextRequest } from 'next/server'

import { getActiveCatalogSlugForAlias } from './app/(sections)/catalogo/lib/getArtistBySlug'

type AliasResolver = (slug: string) => Promise<string | null>

export function createCatalogAliasProxy(resolveAlias: AliasResolver) {
  return async function catalogAliasProxy(request: NextRequest) {
    const match = request.nextUrl.pathname.match(/^\/catalogo\/([^/]+)\/?$/)
    if (!match) return NextResponse.next()

    const slug = decodeURIComponent(match[1])
    const canonicalSlug = await resolveAlias(slug)
    if (!canonicalSlug || canonicalSlug === slug) return NextResponse.next()

    const destination = request.nextUrl.clone()
    destination.pathname = `/catalogo/${encodeURIComponent(canonicalSlug)}`
    return NextResponse.redirect(destination, 308)
  }
}

export const proxy = createCatalogAliasProxy(getActiveCatalogSlugForAlias)

export const config = {
  matcher: '/catalogo/:slug'
}
