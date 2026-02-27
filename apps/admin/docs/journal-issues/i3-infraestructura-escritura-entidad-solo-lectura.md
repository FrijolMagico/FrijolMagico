# I3: Infraestructura escritura para entidad solo lectura

## Estado
✅ Resuelto en T5

Fix: reemplazar infraestructura de store (projection + operation + journal restore) con prop passing directo desde el servidor. Eliminados: `history-ui-store.ts` y `history-store-initialization.tsx`.
