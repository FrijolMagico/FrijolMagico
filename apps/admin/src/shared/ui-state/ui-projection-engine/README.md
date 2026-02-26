# Projection Engine

Sistema de proyección de datos para el panel de administración. Combina un snapshot remoto con un log de operaciones locales para producir un estado proyectado que la UI consume directamente.

## Propósito

Separar el estado del servidor del estado de la UI: las operaciones del usuario se acumulan en un log y se proyectan sobre el snapshot remoto sin mutarlo, hasta que se persisten.

## API

`createProjectionStore<T extends { id: string }>()` — fábrica que retorna un Zustand store con:

- `byId: Record<string, ProjectedEntity<T>>` — entidades proyectadas indexadas por id
- `allIds: string[]` — ids en orden
- `project(remoteSnapshot, persistedOps, pendingOps)` — recalcula el estado proyectado
- `reset()` — vacía el store (callers deben limpiar el dirty store externamente)

## `ProjectedEntity<T>.__meta`

Cada entidad proyectada incluye flags de estado:

- `isNew`: creada locallocally, no existe en el servidor
- `isUpdated`: modificada respecto al snapshot remoto (con reconciliación net-zero)
- `isDeleted`: marcada para eliminar

## Reconciliación net-zero

Si todas las ediciones acumuladas de una entidad la devuelven a su estado original del servidor, `isUpdated` vuelve a `false`. Esto evita falsos positivos en el dirty tracking.
