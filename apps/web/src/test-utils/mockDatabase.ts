import { mock } from 'bun:test'

import {
  executeBatch,
  executeInsert,
  executeQuery,
  getTursoClient
} from '@frijolmagico/database/client'

export const getTursoClientMock = mock(getTursoClient)
export const executeQueryMock = mock(executeQuery)
export const executeBatchMock = mock(executeBatch)
export const executeInsertMock = mock(executeInsert)

mock.module('@frijolmagico/database/client', () => ({
  getTursoClient: getTursoClientMock,
  executeQuery: executeQueryMock,
  executeBatch: executeBatchMock,
  executeInsert: executeInsertMock
}))
