import { hasDiff } from '@frijolmagico/utils/shallow-diff'
import type { ActionState } from '@/shared/types/actions'

/**
 * A single step in the update plan.
 * Each step compares initial vs current payloads and only executes when there is a real diff.
 */
export interface UpdateStep {
  label: string
  initial: Record<string, unknown>
  current: Record<string, unknown>
  execute: () => Promise<ActionState>
}

interface UpdatePlanResult {
  success: boolean
  errorMessage?: string
}

/**
 * Executes a sequential update plan: for each step, diffs initial vs current
 * and calls the action only when something actually changed.
 * Stops on the first failed action and returns the error.
 */
export async function executeUpdatePlan(
  steps: UpdateStep[]
): Promise<UpdatePlanResult> {
  for (const step of steps) {
    if (!hasDiff(step.initial, step.current)) continue

    const result = await step.execute()

    if (!result.success) {
      const message =
        result.errors?.map((e) => e.message).join(', ') ??
        `Error al actualizar ${step.label}`

      return { success: false, errorMessage: message }
    }
  }

  return { success: true }
}
