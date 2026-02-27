# Change Journal

Almacén persistente de operaciones pendientes (IndexedDB). Acumula cambios del usuario hasta que sean confirmados o descartados.

## API pública

- `writeEntry(section, scopeKey, payload)` — escribe una operación
- `getLatestEntries(section)` — retorna entradas más recientes primero
- `clearSection(section)` — elimina todas las entradas de una sección
- `getSectionsWithChanges()` — lista secciones con entradas pendientes

## Convención de `scopeKey`

- `section:entityId` — ADD, DELETE, RESTORE (sin campo específico)
- `section:entityId:field` — UPDATE por campo individual

## Operaciones de payload

- `set` — crear o actualizar (valor en `payload.value`)
- `unset` — eliminar (sin valor)
- `restore` — restaurar entidad eliminada (sin valor)
- `patch` — actualización parcial directa (valor en `payload.value`)