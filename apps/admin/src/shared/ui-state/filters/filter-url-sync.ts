'use client'

import { useEffect, useMemo } from 'react'
import { useQueryStates, parseAsString } from 'nuqs'
import type { UseBoundStore } from 'zustand'
import type { StoreApi } from 'zustand'
import type { FilterStoreState } from './factory'

export type FilterParamSerializer<T> = {
  parse: (raw: string | null) => T
  serialize: (value: T) => string | null
}

export interface FilterUrlSyncConfig<TFilters extends object> {
  params: {
    [K in keyof TFilters]?: {
      paramName: string
      serializer: FilterParamSerializer<TFilters[K]>
    }
  }
}

/**
 * Built-in serializer for `boolean | null` filter values.
 * URL: absent → null, 'true' → true, 'false' → false
 */
export const boolOrNullSerializer: FilterParamSerializer<boolean | null> = {
  parse: (raw) => (raw === null ? null : raw === 'true'),
  serialize: (val) => (val === null ? null : String(val))
}

/**
 * Built-in serializer for `string` filter values.
 * URL: absent → '' (empty), non-empty string → stored as-is
 */
export const stringSerializer: FilterParamSerializer<string> = {
  parse: (raw) => raw ?? '',
  serialize: (val) => (val === '' ? null : val)
}

/**
 * React hook for bidirectional URL synchronization with a filter store.
 *
 * Syncs:
 * 1. URL → store on initial mount
 * 2. Store → URL when user applies filters
 *
 * @param useFilterStoreHook - Zustand filter store hook
 * @param config - Param names and serializers
 */
export function useFilterUrlSync<TFilters extends object>(
  useFilterStoreHook: UseBoundStore<StoreApi<FilterStoreState<TFilters>>>,
  config: FilterUrlSyncConfig<TFilters>
): void {
  const paramEntries = useMemo(
    () =>
      Object.entries(config.params) as Array<
        [
          keyof TFilters & string,
          {
            paramName: string
            serializer: FilterParamSerializer<TFilters[keyof TFilters]>
          }
        ]
      >,
    [config.params]
  )

  const nuqsShape = useMemo(
    () =>
      Object.fromEntries(
        paramEntries.map(([, { paramName }]) => [paramName, parseAsString])
      ) as Record<string, typeof parseAsString>,
    [paramEntries]
  )

  const [urlState, setUrlState] = useQueryStates(nuqsShape, { shallow: true })

  // Subscribe to store changes
  const filters = useFilterStoreHook((s) => s.filters)
  const setFilters = useFilterStoreHook((s) => s.setFilters)

  // Initial sync: URL → store on mount
  useEffect(() => {
    const updates: Partial<TFilters> = {}

    for (const [filterKey, paramConfig] of paramEntries) {
      if (!paramConfig) continue
      const { paramName, serializer } = paramConfig
      const rawValue = urlState[paramName] ?? null
      const parsed = serializer.parse(rawValue) as TFilters[typeof filterKey]
      updates[filterKey] = parsed
    }

    setFilters(updates)
  }, []) // Only runs on mount

  // Store → URL: when user applies filter, sync to URL
  useEffect(() => {
    const newUrlParams: Record<string, string | null> = {}

    for (const [filterKey, paramConfig] of paramEntries) {
      if (!paramConfig) continue
      const { paramName, serializer } = paramConfig
      const value = filters[filterKey]
      const serialized = serializer.serialize(
        value as TFilters[typeof filterKey]
      )
      newUrlParams[paramName] = serialized
    }

    setUrlState(newUrlParams)
  }, [filters, paramEntries, setUrlState])
}
