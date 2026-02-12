import { test as base } from '@playwright/test'

type AdminFixtures = {}

export const test = base.extend<AdminFixtures>({})

export { expect } from '@playwright/test'
