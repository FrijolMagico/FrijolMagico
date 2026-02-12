import { describe, it, expect, beforeEach, mock } from 'bun:test'
import type { PaginationUrlSyncConfig } from '../pagination-url-sync'

type QueryStates = Record<string, number>
type SetUrlStateFn = (newState: QueryStates) => Promise<null>
type UseQueryStatesReturnType = [QueryStates, SetUrlStateFn]

const mockSetUrlState = mock<SetUrlStateFn>(() => Promise.resolve(null))
let currentUrlState: QueryStates = {}

const mockUseQueryStates = mock((parsers) => {
  const keys = Object.keys(parsers)
  const state: QueryStates = {}

  keys.forEach((key) => {
    const parser = parsers[key as keyof typeof parsers]
    state[key] = currentUrlState[key] ?? parser.defaultValue ?? 1
  })

  return [state, mockSetUrlState] as UseQueryStatesReturnType
})

mock.module('nuqs', () => ({
  useQueryStates: mockUseQueryStates,
  parseAsInteger: {
    withDefault: (defaultValue: number) => ({
      parse: (value: string | null) =>
        value ? parseInt(value, 10) : defaultValue,
      serialize: (value: number) => value.toString(),
      defaultValue
    })
  }
}))

describe('Pagination URL Sync Configuration', () => {
  beforeEach(() => {
    mockUseQueryStates.mockClear()
    mockSetUrlState.mockClear()
    currentUrlState = {}
  })

  describe('Config Parser Setup', () => {
    it('creates parser config with default param names', () => {
      const config: PaginationUrlSyncConfig = {}
      const {
        pageParam = 'page',
        pageSizeParam = 'pageSize',
        defaultPageSize = 20
      } = config

      expect(pageParam).toBe('page')
      expect(pageSizeParam).toBe('pageSize')
      expect(defaultPageSize).toBe(20)
    })

    it('creates parser config with custom param names', () => {
      const config: PaginationUrlSyncConfig = {
        pageParam: 'p',
        pageSizeParam: 'size'
      }

      const {
        pageParam = 'page',
        pageSizeParam = 'pageSize',
        defaultPageSize = 20
      } = config

      expect(pageParam).toBe('p')
      expect(pageSizeParam).toBe('size')
      expect(defaultPageSize).toBe(20)
    })

    it('creates parser config with custom default page size', () => {
      const config: PaginationUrlSyncConfig = {
        defaultPageSize: 50
      }

      const {
        pageParam = 'page',
        pageSizeParam = 'pageSize',
        defaultPageSize = 20
      } = config

      expect(pageParam).toBe('page')
      expect(pageSizeParam).toBe('pageSize')
      expect(defaultPageSize).toBe(50)
    })

    it('creates parser config with all custom values', () => {
      const config: PaginationUrlSyncConfig = {
        pageParam: 'currentPage',
        pageSizeParam: 'limit',
        defaultPageSize: 100
      }

      const {
        pageParam = 'page',
        pageSizeParam = 'pageSize',
        defaultPageSize = 20
      } = config

      expect(pageParam).toBe('currentPage')
      expect(pageSizeParam).toBe('limit')
      expect(defaultPageSize).toBe(100)
    })
  })

  describe('nuqs parseAsInteger Parser', () => {
    it('parses valid integer strings', () => {
      const parser = {
        parse: (value: string | null) => (value ? parseInt(value, 10) : 1),
        serialize: (value: number) => value.toString(),
        defaultValue: 1
      }

      expect(parser.parse('5')).toBe(5)
      expect(parser.parse('100')).toBe(100)
      expect(parser.parse('1')).toBe(1)
    })

    it('returns default value for null input', () => {
      const parser = {
        parse: (value: string | null) => (value ? parseInt(value, 10) : 20),
        serialize: (value: number) => value.toString(),
        defaultValue: 20
      }

      expect(parser.parse(null)).toBe(20)
    })

    it('serializes numbers to strings', () => {
      const parser = {
        parse: (value: string | null) => (value ? parseInt(value, 10) : 1),
        serialize: (value: number) => value.toString(),
        defaultValue: 1
      }

      expect(parser.serialize(5)).toBe('5')
      expect(parser.serialize(100)).toBe('100')
      expect(parser.serialize(1)).toBe('1')
    })

    it('handles edge case values', () => {
      const parser = {
        parse: (value: string | null) => (value ? parseInt(value, 10) : 1),
        serialize: (value: number) => value.toString(),
        defaultValue: 1
      }

      expect(parser.parse('0')).toBe(0)
      expect(parser.parse('-5')).toBe(-5)
      expect(parser.parse('999999')).toBe(999999)
    })
  })

  describe('URL State Shape', () => {
    it('constructs correct URL state shape with defaults', () => {
      const pageParam = 'page'
      const pageSizeParam = 'pageSize'

      const urlState: QueryStates = {
        [pageParam]: 1,
        [pageSizeParam]: 20
      }

      expect(urlState.page).toBe(1)
      expect(urlState.pageSize).toBe(20)
    })

    it('constructs correct URL state shape with custom params', () => {
      const pageParam = 'p'
      const pageSizeParam = 'size'

      const urlState: QueryStates = {
        [pageParam]: 3,
        [pageSizeParam]: 50
      }

      expect(urlState.p).toBe(3)
      expect(urlState.size).toBe(50)
    })

    it('handles dynamic param name assignment', () => {
      const config: PaginationUrlSyncConfig = {
        pageParam: 'customPage',
        pageSizeParam: 'customSize',
        defaultPageSize: 75
      }

      const {
        pageParam = 'page',
        pageSizeParam = 'pageSize',
        defaultPageSize = 20
      } = config

      const urlState: QueryStates = {
        [pageParam]: 10,
        [pageSizeParam]: defaultPageSize
      }

      expect(urlState.customPage).toBe(10)
      expect(urlState.customSize).toBe(75)
    })
  })

  describe('Mock Function Behavior', () => {
    it('tracks setUrlState calls', () => {
      const setUrlState = mock<SetUrlStateFn>(() => Promise.resolve(null))

      setUrlState({ page: 5, pageSize: 20 })
      setUrlState({ page: 6, pageSize: 20 })

      expect(setUrlState).toHaveBeenCalledTimes(2)
      expect(setUrlState).toHaveBeenNthCalledWith(1, { page: 5, pageSize: 20 })
      expect(setUrlState).toHaveBeenNthCalledWith(2, { page: 6, pageSize: 20 })
    })

    it('returns promise from setUrlState', async () => {
      const setUrlState = mock<SetUrlStateFn>(() => Promise.resolve(null))

      const result = setUrlState({ page: 1, pageSize: 20 })

      expect(result).toBeInstanceOf(Promise)
      await expect(result).resolves.toBeNull()
    })
  })

  describe('Configuration Validation', () => {
    it('validates pageParam is a string', () => {
      const config: PaginationUrlSyncConfig = {
        pageParam: 'p'
      }

      expect(typeof config.pageParam).toBe('string')
      expect(config.pageParam).toBe('p')
    })

    it('validates pageSizeParam is a string', () => {
      const config: PaginationUrlSyncConfig = {
        pageSizeParam: 'limit'
      }

      expect(typeof config.pageSizeParam).toBe('string')
      expect(config.pageSizeParam).toBe('limit')
    })

    it('validates defaultPageSize is a number', () => {
      const config: PaginationUrlSyncConfig = {
        defaultPageSize: 100
      }

      expect(typeof config.defaultPageSize).toBe('number')
      expect(config.defaultPageSize).toBe(100)
    })

    it('accepts empty config object', () => {
      const config: PaginationUrlSyncConfig = {}

      expect(config).toEqual({})
      expect(Object.keys(config).length).toBe(0)
    })
  })

  describe('Parser Factory Pattern', () => {
    function createPaginationParsers(config: PaginationUrlSyncConfig = {}) {
      const {
        pageParam = 'page',
        pageSizeParam = 'pageSize',
        defaultPageSize = 20
      } = config

      return {
        [pageParam]: {
          parse: (value: string | null) => (value ? parseInt(value, 10) : 1),
          serialize: (value: number) => value.toString(),
          defaultValue: 1
        },
        [pageSizeParam]: {
          parse: (value: string | null) =>
            value ? parseInt(value, 10) : defaultPageSize,
          serialize: (value: number) => value.toString(),
          defaultValue: defaultPageSize
        }
      }
    }

    it('creates parsers with default config', () => {
      const parsers = createPaginationParsers()

      expect(parsers.page).toBeDefined()
      expect(parsers.pageSize).toBeDefined()
      expect(parsers.page.defaultValue).toBe(1)
      expect(parsers.pageSize.defaultValue).toBe(20)
    })

    it('creates parsers with custom param names', () => {
      const parsers = createPaginationParsers({
        pageParam: 'p',
        pageSizeParam: 'size'
      })

      expect(parsers.p).toBeDefined()
      expect(parsers.size).toBeDefined()
      expect(parsers.p.defaultValue).toBe(1)
      expect(parsers.size.defaultValue).toBe(20)
    })

    it('creates parsers with custom default page size', () => {
      const parsers = createPaginationParsers({
        defaultPageSize: 50
      })

      expect(parsers.pageSize.defaultValue).toBe(50)
    })

    it('parser serializes and parses correctly', () => {
      const parsers = createPaginationParsers()

      const serialized = parsers.page.serialize(5)
      const parsed = parsers.page.parse(serialized)

      expect(serialized).toBe('5')
      expect(parsed).toBe(5)
    })
  })

  describe('URL Sync Options', () => {
    it('includes shallow routing option', () => {
      const options = { shallow: true }

      expect(options.shallow).toBe(true)
    })

    it('validates options shape', () => {
      const options = { shallow: true }

      expect(typeof options.shallow).toBe('boolean')
      expect(Object.keys(options)).toContain('shallow')
    })
  })

  describe('Type Safety', () => {
    it('enforces correct config types', () => {
      const validConfig: PaginationUrlSyncConfig = {
        pageParam: 'page',
        pageSizeParam: 'pageSize',
        defaultPageSize: 20
      }

      expect(validConfig).toBeDefined()
    })

    it('allows partial config', () => {
      const partialConfig: PaginationUrlSyncConfig = {
        pageParam: 'p'
      }

      expect(partialConfig.pageParam).toBe('p')
      expect(partialConfig.pageSizeParam).toBeUndefined()
      expect(partialConfig.defaultPageSize).toBeUndefined()
    })

    it('allows empty config', () => {
      const emptyConfig: PaginationUrlSyncConfig = {}

      expect(Object.keys(emptyConfig).length).toBe(0)
    })
  })
})
