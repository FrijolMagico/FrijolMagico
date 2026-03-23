import * as nextCache from 'next/cache'

export function cacheTag(tag: string): void {
  nextCache.cacheTag?.(tag)
}

export function updateTag(tag: string): void {
  nextCache.updateTag?.(tag)
}
