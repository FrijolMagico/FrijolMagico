export interface ActionState<T = unknown> {
  success: boolean
  data?: T
  errors?: { entityType: string; message: string }[]
}
