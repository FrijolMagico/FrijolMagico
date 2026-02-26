# UI State Module

Este módulo implementa el sistema de estado optimista para el panel de administración. Resuelve la reconciliación de cambios locales con datos del servidor sin mutar el estado remoto prematuramente.

## Propósito

Permite una experiencia fluida donde el usuario ve sus cambios (ADD, UPDATE, DELETE) de inmediato, mientras estos se mantienen en un log de operaciones pendiente de ser persistido en el servidor.

## Arquitectura y Fábricas

El sistema se divide en dos stores de Zustand:

1. **Operation Log (`createEntityOperationStore`)**:
   - Mantiene una cola secuencial de cambios pendientes.
   - Gestiona operaciones `ADD`, `UPDATE`, `DELETE` y `RESTORE`.
   - Se usa para capturar las intenciones del usuario.

2. **Projection Engine (`createUIProjectionStore`)**:
   - Genera una vista coherente combinando el snapshot del servidor + el log de operaciones.
   - Realiza reconciliación "net-zero": si un cambio manual devuelve una entidad a su estado original del servidor, limpia los flags de edición.

## Flujo de Datos

`Snapshot Servidor → operationStore → projectionStore → Vista UI`

El hook `useProjectionSync` actúa como el orquestador, re-calculando la proyección cada vez que cambian los datos remotos o se agrega una operación local.

## Archivos Clave

- `operation-log/factory.ts`: Lógica de captura de operaciones.
- `ui-projection-engine/factory.ts`: Algoritmo de proyección y reconciliación.
- `hooks/use-projection-sync.ts`: Sincronización automática de stores.

## Siguiente paso

El siguiente issue pendiente en este módulo es **[P1 — Projection Engine acoplada a `useSectionDirtyStore`](../../docs/journal-issues/p1-projection-engine-acoplada-dirty-store.md)**.

Ver también el roadmap general de deuda técnica: [`docs/journal-issues/README.md`](../../docs/journal-issues/README.md)

> **⚠️ Antes de ejecutar**: Crear el plan oficial para P1 y validarlo con los especialistas **Metis** (gap analysis) y **Momus** (plan critic) siguiendo el mismo proceso que esta tarea.
