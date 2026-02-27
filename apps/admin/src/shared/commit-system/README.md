# Commit System

Pipeline de persistencia para enviar las operaciones acumuladas en el Journal (IndexedDB) hacia el servidor mediante Server Actions.

## Propósito

Orquestar el flujo de guardado garantizando que las operaciones se validen, ordenen y procesen correctamente antes de limpiar el almacenamiento local.

## Pipeline de 4 fases

1. **Read**: Recupera las operaciones pendientes desde el `journalCommitSource`.
2. **Validate & Sort**: Verifica la integridad de las operaciones y las ordena secuencialmente (DELETE → RESTORE → UPDATE → CREATE) vía `operation-sorter.ts`.
3. **Execute**: Ejecuta el Server Action correspondiente (executor) procesando los cambios en el servidor.
4. **Clear**: Tras un éxito confirmado, limpia las entradas procesadas en IndexedDB.

## Archivos clave

- `use-commit.ts`: Hook principal que orquestra el pipeline completo.
- `operation-sorter.ts`: Lógica de validación de conflictos y ordenamiento.
- `batch-processor.ts`: Utilidad para procesar grandes volúmenes de datos en lotes con reintentos. Usado activamente por `save-organizacion.action.ts` y `save-organizacion-equipo.action.ts`.
- `create-commit-config.ts`: Factory para tipar la configuración del pipeline.

## Estado actual

El pipeline está activo en producción para todos los módulos: `organizacion`, `organizacion_equipo`, `artista`, `catalogo_artista`, `evento`. El botón "Guardar" ejecuta el `commit()` real y persiste cambios al servidor.
