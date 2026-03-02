import type { Organization } from '../_types'
import { createEntityOperationStore } from '@/shared/operations/log'
import { createProjectionStore } from '@/shared/operations/projection'

export const useOrganizationOperationStore =
  createEntityOperationStore<Organization>()

export const useOrganizationProjectionStore =
  createProjectionStore<Organization>()
