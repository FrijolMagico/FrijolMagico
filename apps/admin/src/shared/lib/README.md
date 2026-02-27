# shared/lib

Glue code que conecta módulos desacoplados del sistema de journal.

## Archivos

| Archivo | Rol |
|---------|-----|
| `journal-commit-source.ts` | Adapter: Change Journal → CommitSource. Lee entradas del journal y las mapea a `CommitOperation[]` para el pipeline de commit. |
| `write-operation-into-journal.ts` | Write path: OperationLog → Journal. Convierte `EntityOperation[]` en entradas IndexedDB. |
| `journal-entries-to-operations.ts` | Restore path: Journal → OperationLog. Rehidrata el store desde entradas persistidas (inverso del write path). |
| `section-dirty-store.ts` | Estado Zustand del amber dot por sección. |
| `discard-registry.ts` | Registro de callbacks de descarte por entidad. |

`utils.ts` y `database-entities.ts` son utilidades triviales (ver inline).