import { describe, it, expect } from 'bun:test'
import { createPaginationStore } from '@/shared/ui-state/pagination'

describe('Pagination Factory', () => {
  describe('Store Creation', () => {
    it('creates independent stores with separate state', () => {
      const store1 = createPaginationStore({ storeName: 'store1' })
      const store2 = createPaginationStore({ storeName: 'store2' })

      store1.getState().setTotalItems(100)
      store1.getState().setPage(5)
      store2.getState().setTotalItems(50)
      store2.getState().setPage(2)

      expect(store1.getState().page).toBe(5)
      expect(store2.getState().page).toBe(2)
      expect(store1.getState().totalItems).toBe(100)
      expect(store2.getState().totalItems).toBe(50)
    })

    it('initializes with default values', () => {
      const store = createPaginationStore({ storeName: 'test' })
      const state = store.getState()

      expect(state.page).toBe(1)
      expect(state.pageSize).toBe(20)
      expect(state.totalItems).toBe(0)
    })

    it('respects custom default page size', () => {
      const store = createPaginationStore({
        storeName: 'test',
        defaultPageSize: 50
      })

      expect(store.getState().pageSize).toBe(50)
    })
  })

  describe('getTotalPages() Calculation', () => {
    it('returns 1 when total items is 0', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(0)

      expect(store.getState().getTotalPages()).toBe(1)
    })

    it('calculates total pages correctly', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)

      expect(store.getState().getTotalPages()).toBe(5)
    })

    it('rounds up when items do not divide evenly', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(95)

      expect(store.getState().getTotalPages()).toBe(5)
    })

    it('updates when page size changes', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)
      expect(store.getState().getTotalPages()).toBe(5)

      store.getState().setPageSize(50)
      expect(store.getState().getTotalPages()).toBe(2)
    })

    it('updates when total items change', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(50)
      expect(store.getState().getTotalPages()).toBe(3)

      store.getState().setTotalItems(100)
      expect(store.getState().getTotalPages()).toBe(5)
    })
  })

  describe('getVisibleRange()', () => {
    it('returns correct slice indices for first page', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)
      store.getState().setPage(1)

      const range = store.getState().getVisibleRange()
      expect(range.startIndex).toBe(0)
      expect(range.endIndex).toBe(20)
    })

    it('returns correct slice indices for middle page', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)
      store.getState().setPage(3)

      const range = store.getState().getVisibleRange()
      expect(range.startIndex).toBe(40)
      expect(range.endIndex).toBe(60)
    })

    it('returns correct slice indices for last page', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(95)
      store.getState().setPage(5)

      const range = store.getState().getVisibleRange()
      expect(range.startIndex).toBe(80)
      expect(range.endIndex).toBe(95)
    })

    it('clamps end index to total items', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(35)
      store.getState().setPage(2)

      const range = store.getState().getVisibleRange()
      expect(range.startIndex).toBe(20)
      expect(range.endIndex).toBe(35)
    })

    it('handles single item', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(1)
      store.getState().setPage(1)

      const range = store.getState().getVisibleRange()
      expect(range.startIndex).toBe(0)
      expect(range.endIndex).toBe(1)
    })

    it('returns correct range when page size equals total items', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setPageSize(100)
      store.getState().setTotalItems(100)
      store.getState().setPage(1)

      const range = store.getState().getVisibleRange()
      expect(range.startIndex).toBe(0)
      expect(range.endIndex).toBe(100)
    })
  })

  describe('setPage()', () => {
    it('sets page within valid bounds', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)

      store.getState().setPage(3)
      expect(store.getState().page).toBe(3)
    })

    it('clamps page to minimum of 1', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)

      store.getState().setPage(0)
      expect(store.getState().page).toBe(1)

      store.getState().setPage(-5)
      expect(store.getState().page).toBe(1)
    })

    it('clamps page to maximum total pages', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)

      store.getState().setPage(10)
      expect(store.getState().page).toBe(5)
    })

    it('accepts valid page numbers', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)

      for (let i = 1; i <= 5; i++) {
        store.getState().setPage(i)
        expect(store.getState().page).toBe(i)
      }
    })
  })

  describe('setPageSize()', () => {
    it('sets page size and resets page to 1', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)
      store.getState().setPage(5)

      store.getState().setPageSize(50)
      expect(store.getState().pageSize).toBe(50)
      expect(store.getState().page).toBe(1)
    })

    it('sanitizes page size to minimum of 1', () => {
      const store = createPaginationStore({ storeName: 'test' })

      store.getState().setPageSize(0)
      expect(store.getState().pageSize).toBe(1)

      store.getState().setPageSize(-10)
      expect(store.getState().pageSize).toBe(1)
    })

    it('accepts valid page sizes', () => {
      const store = createPaginationStore({ storeName: 'test' })

      store.getState().setPageSize(100)
      expect(store.getState().pageSize).toBe(100)

      store.getState().setPageSize(1)
      expect(store.getState().pageSize).toBe(1)
    })
  })

  describe('setTotalItems()', () => {
    it('sets total items when valid', () => {
      const store = createPaginationStore({ storeName: 'test' })

      store.getState().setTotalItems(50)
      expect(store.getState().totalItems).toBe(50)
    })

    it('sanitizes total items to minimum of 0', () => {
      const store = createPaginationStore({ storeName: 'test' })

      store.getState().setTotalItems(-5)
      expect(store.getState().totalItems).toBe(0)
    })

    it('clamps current page when total items decrease', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)
      store.getState().setPage(5)

      store.getState().setTotalItems(50)
      expect(store.getState().page).toBe(3)
      expect(store.getState().totalItems).toBe(50)
    })

    it('maintains page when total items stay sufficient', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)
      store.getState().setPage(3)

      store.getState().setTotalItems(80)
      expect(store.getState().page).toBe(3)
    })

    it('handles zero items edge case', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)
      store.getState().setPage(5)

      store.getState().setTotalItems(0)
      expect(store.getState().totalItems).toBe(0)
      expect(store.getState().page).toBe(1)
      expect(store.getState().getTotalPages()).toBe(1)
    })

    it('clamps page correctly during shrinking', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setPageSize(10)

      // 100 items / 10 per page = 10 pages, set page to 10
      store.getState().setTotalItems(100)
      store.getState().setPage(10)
      expect(store.getState().page).toBe(10)

      // Reduce to 75 items / 10 per page = 8 pages, page should clamp to 8
      store.getState().setTotalItems(75)
      expect(store.getState().page).toBe(8)
    })
  })

  describe('goNext()', () => {
    it('increments page when not at last page', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)
      store.getState().setPage(2)

      store.getState().goNext()
      expect(store.getState().page).toBe(3)
    })

    it('does not go beyond last page', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)
      store.getState().setPage(5)

      store.getState().goNext()
      expect(store.getState().page).toBe(5)
    })

    it('navigates from first page correctly', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)
      store.getState().setPage(1)

      store.getState().goNext()
      expect(store.getState().page).toBe(2)
    })

    it('handles single page scenario', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(10)
      store.getState().setPage(1)

      store.getState().goNext()
      expect(store.getState().page).toBe(1)
    })
  })

  describe('goPrev()', () => {
    it('decrements page when not at first page', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)
      store.getState().setPage(3)

      store.getState().goPrev()
      expect(store.getState().page).toBe(2)
    })

    it('does not go below first page', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)
      store.getState().setPage(1)

      store.getState().goPrev()
      expect(store.getState().page).toBe(1)
    })

    it('navigates from last page correctly', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)
      store.getState().setPage(5)

      store.getState().goPrev()
      expect(store.getState().page).toBe(4)
    })

    it('handles single page scenario', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(10)
      store.getState().setPage(1)

      store.getState().goPrev()
      expect(store.getState().page).toBe(1)
    })
  })

  describe('reset()', () => {
    it('resets page to 1', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)
      store.getState().setPage(5)

      store.getState().reset()
      expect(store.getState().page).toBe(1)
    })

    it('preserves other state during reset', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(200)
      store.getState().setPageSize(50)
      store.getState().setPage(5)

      store.getState().reset()
      expect(store.getState().pageSize).toBe(50)
      expect(store.getState().totalItems).toBe(200)
    })
  })

  describe('Edge Cases', () => {
    it('handles zero items with getVisibleRange', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(0)
      store.getState().setPage(1)

      const range = store.getState().getVisibleRange()
      expect(range.startIndex).toBe(0)
      expect(range.endIndex).toBe(0)
    })

    it('handles large page numbers gracefully', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)

      store.getState().setPage(999)
      expect(store.getState().page).toBe(5)
    })

    it('handles very large page sizes', () => {
      const store = createPaginationStore({
        storeName: 'test',
        maxPageSize: 10000
      })
      store.getState().setTotalItems(1000)

      store.getState().setPageSize(10000)
      expect(store.getState().pageSize).toBe(10000)
      expect(store.getState().getTotalPages()).toBe(1)
    })

    it('maintains consistency after multiple state changes', () => {
      const store = createPaginationStore({ storeName: 'test' })

      store.getState().setTotalItems(100)
      store.getState().setPageSize(25)
      store.getState().setPage(2)
      expect(store.getState().getTotalPages()).toBe(4)

      const range = store.getState().getVisibleRange()
      expect(range.startIndex).toBe(25)
      expect(range.endIndex).toBe(50)
    })

    it('handles rapid successive updates', () => {
      const store = createPaginationStore({ storeName: 'test' })
      store.getState().setTotalItems(100)

      for (let i = 0; i < 10; i++) {
        store.getState().goNext()
      }

      expect(store.getState().page).toBeLessThanOrEqual(
        store.getState().getTotalPages()
      )
    })
  })

  describe('Store with URL Sync Disabled', () => {
    it('creates store with urlSync: false', () => {
      const store = createPaginationStore({
        storeName: 'test',
        urlSync: false
      })

      store.getState().setTotalItems(100)
      store.getState().setPage(3)
      expect(store.getState().page).toBe(3)
    })

    it('updates state normally without URL side effects', () => {
      const store = createPaginationStore({
        storeName: 'test',
        urlSync: false
      })

      store.getState().setTotalItems(50)
      store.getState().setPageSize(10)
      store.getState().setPage(2)

      expect(store.getState().totalItems).toBe(50)
      expect(store.getState().pageSize).toBe(10)
      expect(store.getState().page).toBe(2)
    })
  })
})
