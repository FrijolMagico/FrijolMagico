import { mock } from 'bun:test'

import { executeQuery } from '@frijolmagico/database/client'

export const executeQueryMock = mock(executeQuery)

mock.module('@frijolmagico/database/client', () => ({
  executeQuery: executeQueryMock
}))
