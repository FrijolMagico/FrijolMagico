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
- `operation-sorter.ts`: Lógica de validación de conflictos, ordenamiento y edge cases (DELETE-on-tempId, CREATE+DELETE, UPDATE+DELETE).
- `batch-processor.ts`: Utilidad para procesar grandes volúmenes en lotes. Actualmente sin uso (T7 migró los actions a `db.transaction()`).
- `create-commit-config.ts`: Factory para tipar la configuración del pipeline.

## Estado actual

El pipeline está activo. T7 completada: bugs de integridad corregidos (double-update, stripUndefined, allMappings), error handling estandarizado, revalidateTag corregido, y edge cases del sorter implementados.

El pipeline está activo en producción para todos los módulos: `organizacion`, `organizacion_equipo`, `artista`, `catalogo_artista`, `evento`. El botón "Guardar" ejecuta el `commit()` real y persiste cambios al servidor.
## Edge cases del sorter

- **DELETE sobre tempId**: Descartado silenciosamente (entidad nunca persistió).
- **CREATE + DELETE mismo tempId**: Cancelación total, ambos descartados.
- **UPDATE + DELETE misma entidad real**: DELETE gana, UPDATEs descartados.
- **DELETEs duplicados**: Deduplicados a una sola operación.
