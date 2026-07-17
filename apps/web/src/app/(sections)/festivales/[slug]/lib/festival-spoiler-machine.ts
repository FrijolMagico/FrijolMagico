const CATEGORY_STATES = {
  CONCEALED: 'concealed',
  REVEALING: 'revealing',
  REVEALED: 'revealed',
  CONCEALING: 'concealing'
} as const

type CategoryState = (typeof CATEGORY_STATES)[keyof typeof CATEGORY_STATES]

type CategoryEvent = 'reveal' | 'conceal' | 'complete' | 'fail'

export function transitionCategoryState(
  state: CategoryState,
  event: CategoryEvent
): CategoryState | null {
  if (event === 'fail') return CATEGORY_STATES.REVEALED
  if (state === CATEGORY_STATES.CONCEALED && event === 'reveal') {
    return CATEGORY_STATES.REVEALING
  }
  if (state === CATEGORY_STATES.REVEALING && event === 'complete') {
    return CATEGORY_STATES.REVEALED
  }
  if (state === CATEGORY_STATES.REVEALED && event === 'conceal') {
    return CATEGORY_STATES.CONCEALING
  }
  if (state === CATEGORY_STATES.CONCEALING && event === 'complete') {
    return CATEGORY_STATES.CONCEALED
  }

  return null
}

export function getGlobalSpoilerCommand(states: CategoryState[]) {
  if (states.length === 0) return null
  return states.every((state) => state === CATEGORY_STATES.REVEALED)
    ? 'conceal'
    : 'reveal'
}

export { CATEGORY_STATES }
export type { CategoryState }
