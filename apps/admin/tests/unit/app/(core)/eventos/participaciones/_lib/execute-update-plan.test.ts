import { expect, test } from 'bun:test'
import { executeUpdatePlan } from '@/core/eventos/participaciones/_lib/execute-update-plan'
import type { ActionState } from '@/shared/types/actions'

function step(
  label: string,
  result: ActionState,
  calls: string[],
  changed = true
) {
  return {
    label,
    initial: { value: changed ? 'before' : 'same' },
    current: { value: changed ? 'after' : 'same' },
    execute: async () => {
      calls.push(label)
      return result
    }
  }
}

test.each([
  ['SWR then immediate', ['swr', 'immediate']],
  ['immediate then SWR', ['immediate', 'swr']]
] as const)('%s reports SWR freshness in execution order', async (_label, metadata) => {
  const calls: string[] = []
  const result = await executeUpdatePlan([
    step('participation', { success: true, webRevalidation: metadata[0] }, calls),
    step('exhibition', { success: true, webRevalidation: metadata[1] }, calls)
  ])

  expect(calls).toEqual(['participation', 'exhibition'])
  expect(result).toEqual({ success: true, webRevalidation: 'swr' })
})

test('immediate freshness is retained when no successful step reports SWR', async () => {
  const calls: string[] = []
  const result = await executeUpdatePlan([
    step('participation', { success: true, webRevalidation: 'immediate' }, calls),
    step('exhibition', { success: true }, calls)
  ])

  expect(calls).toEqual(['participation', 'exhibition'])
  expect(result).toEqual({ success: true, webRevalidation: 'immediate' })
})

test('omits freshness when all executed steps omit it or every step is unchanged', async () => {
  const calls: string[] = []
  const withoutMetadata = await executeUpdatePlan([
    step('participation', { success: true }, calls),
    step('exhibition', { success: true }, calls)
  ])
  const allUnchanged = await executeUpdatePlan([
    step('participation', { success: true, webRevalidation: 'swr' }, calls, false),
    step('exhibition', { success: true, webRevalidation: 'immediate' }, calls, false)
  ])

  expect(calls).toEqual(['participation', 'exhibition'])
  expect(withoutMetadata).toEqual({ success: true })
  expect(allUnchanged).toEqual({ success: true })
})

test('skips unchanged steps and executes changed steps sequentially in plan order', async () => {
  const calls: string[] = []
  const result = await executeUpdatePlan([
    step('unchanged participation', { success: true, webRevalidation: 'swr' }, calls, false),
    step('changed participation', { success: true, webRevalidation: 'immediate' }, calls),
    step('unchanged exhibition', { success: true }, calls, false),
    step('changed exhibition', { success: true }, calls)
  ])

  expect(calls).toEqual(['changed participation', 'changed exhibition'])
  expect(result).toEqual({ success: true, webRevalidation: 'immediate' })
})

test('returns the first failure without freshness and does not execute later steps', async () => {
  const calls: string[] = []
  const result = await executeUpdatePlan([
    step('participation', { success: true, webRevalidation: 'swr' }, calls),
    {
      ...step('exhibition', { success: false, errors: [{ entityType: 'expositor', message: 'No se pudo guardar' }] }, calls),
      execute: async () => {
        calls.push('exhibition')
        return { success: false, errors: [{ entityType: 'expositor', message: 'No se pudo guardar' }] }
      }
    },
    step('later', { success: true, webRevalidation: 'swr' }, calls)
  ])

  expect(calls).toEqual(['participation', 'exhibition'])
  expect(result).toEqual({ success: false, errorMessage: 'No se pudo guardar' })
})

test('uses the existing fallback message for the first failure without metadata', async () => {
  const calls: string[] = []
  const result = await executeUpdatePlan([
    step('participation', { success: false }, calls),
    step('exhibition', { success: true, webRevalidation: 'swr' }, calls)
  ])

  expect(calls).toEqual(['participation'])
  expect(result).toEqual({ success: false, errorMessage: 'Error al actualizar participation' })
})

test('propagates the original rejection and does not execute later steps', async () => {
  const calls: string[] = []
  const rejection = new Error('action rejected')
  const plan = [
    step('participation', { success: true, webRevalidation: 'immediate' }, calls),
    {
      label: 'exhibition',
      initial: { value: 'before' },
      current: { value: 'after' },
      execute: async () => {
        calls.push('exhibition')
        throw rejection
      }
    },
    step('later', { success: true }, calls)
  ]

  await expect(executeUpdatePlan(plan)).rejects.toBe(rejection)
  expect(calls).toEqual(['participation', 'exhibition'])
})
