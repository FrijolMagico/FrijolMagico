import { useState } from 'react'

/**
 * Returns the previous array reference if the new array has the exact same items.
 * Useful for preventing re-renders when derived arrays (like mapped IDs) are recreated
 * with the same contents but a new reference.
 */
export function useStableArray<T>(next: T[]): T[] {
  const [state, setState] = useState({
    items: next,
    stable: next
  })

  // Pattern: Storing information from previous renders
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  if (next !== state.items) {
    const isSameLength = state.items.length === next.length
    const isSameItems = isSameLength && state.items.every((v, i) => Object.is(v, next[i]))

    if (isSameItems) {
      // Contents match, update 'items' tracker but keep 'stable' reference
      setState({ items: next, stable: state.stable })
    } else {
      // Contents changed, update both
      setState({ items: next, stable: next })
    }
  }

  return state.stable
}
