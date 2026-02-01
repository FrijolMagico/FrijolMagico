**Overview**

- Esta carpeta contiene la definición de esquema, migraciones y scripts de datos para la base de datos del proyecto.
- El diseño prioriza integridad referencial, trazabilidad temporal (`created_at`, `updated_at`) y reglas de negocio implementadas mediante triggers y constraints.

**Core Tables**

- `evento`: entidad principal que agrupa ediciones.
- `evento_edicion`: instancia de un evento (edición). Relaciona con `evento`.
- `evento_edicion_participante`: tabla "maestra" de participantes por edición; representa la relación única entre un `artista` y una `evento_edicion`.
- `participante_exposicion`: participación en la sección de exposición; referencia al maestro `evento_edicion_participante`.
- `participante_actividad`: participación en actividades; referencia al maestro `evento_edicion_participante`.
- `actividad`: detalles concretos de una actividad (vinculada a `participante_actividad`).
- `artista`: entidad que representa a la persona o agrupación participante.
- `disciplina`: catálogo de disciplinas usadas en postulaciones y exposiciones.
- `evento_edicion_postulacion`: registros de postulaciones a una edición (separada de participantes finales).

**Key Relationships & Referential Behavior**

- `evento_edicion_participante` tiene claves foráneas a `evento_edicion` y `artista`. La eliminación de una edición o artista propaga en cascada según la definición de la FK.
- `participante_exposicion` y `participante_actividad` referencian a `evento_edicion_participante` mediante `participante_id`. Estas relaciones están definidas para evitar borrados accidentales del maestro (restricciones `ON DELETE RESTRICT` o comportamiento equivalente) salvo cuando está explícitamente indicado.
- `actividad` está anclada a `participante_actividad` con `ON DELETE CASCADE` (borrar la participación borra la actividad asociada).

**Constraints & Business Rules**

- Integridad única: `evento_edicion_participante` garantiza unicidad por par (`artista_id`, `evento_edicion_id`).
- Estados controlados: varias tablas usan columnas `estado` con conjuntos cerrados de valores (ej.: `seleccionado`, `confirmado`, `desistido`, `cancelado`, `ausente`, `completado`).
- Triggers `updated_at`: existe una familia de triggers que mantienen `updated_at` de forma idempotente para evitar recursión indeseada.

**Triggers relevantes y decisiones de diseño**

- Triggers de veto: existen triggers que previenen la inserción de participaciones para artistas vetados y que cancelan participaciones activas cuando un artista es vetado, con la lógica de no afectar participaciones `completado` de eventos pasados.
- Triggers de cascada de cancelación: si el maestro (`evento_edicion_participante`) pasa a `cancelado`, los hijos en `participante_exposicion` y `participante_actividad` se actualizan acorde (se respetan estados finales como `completado`).
- Cambio importante: los triggers automáticos que creaban filas en `evento_edicion_participante` a partir de inserciones/actualizaciones en las tablas hijas fueron removidos deliberadamente. La creación de la fila "maestra" ahora debe hacerse desde la capa de aplicación antes de insertar registros hijos. Se conservaron los triggers que realizan veto y cascada.

**Data Backfills & Seed Files**

- La carpeta `db/data/` contiene scripts SQL para inserciones históricas y backfills. Estos archivos están pensados para ejecución manual y no deberían versionarse con datos sensibles.
- Se añadió un script de backfill que genera los registros faltantes en `evento_edicion_participante` a partir de las tablas hijas. El script es idempotente y previsto para uso en despliegues donde sea necesario reproducir el backfill.
- Para reversiones, la convención es crear archivos `.rollback.sql` que reviertan los cambios introducidos por el candidato de inserción.

**Migrations**

- Las migraciones se encuentran en `db/migrations/` y siguen la convención `NNNN_description.up.sql` y `NNNN_description.down.sql`.
- El motor de migraciones usado localmente es `geni` (invocado desde los scripts definidos en el proyecto); las tareas relacionadas a migraciones están documentadas en el archivo principal del proyecto.
- Recomendación de práctica: antes de aplicar migraciones en entornos remotos, ejecutar una prueba en una sesión transaccional y asegurar backups si el cambio es destructivo.

**Operational Notes**

- Variables de conexión: el acceso a la base remota se gestiona mediante variables/credenciales externas; en entornos con Turso se usan tokens y URLs específicos que deben mantenerse fuera del control de versiones.
- Aplicación: la lógica de negocio ahora requiere que la aplicación inserte o actualice `evento_edicion_participante` (registro maestro) antes de crear registros en `participante_exposicion` o `participante_actividad`.
- Pruebas: al validar modificaciones en producción, comparar conteos de pares únicos en tablas hijas con el conteo en `evento_edicion_participante` y revisar que no existan referencias hijas con `participante_id` nulo.

**Checks y validación rápida**

- Validar número de pares únicos en las tablas hijas frente a la tabla maestra para detectar discrepancias.
- Verificar que no existan filas hijas con `participante_id` nulo.
- Confirmar que los triggers relevantes (veto y cascade) están presentes y que los `updated_at` se actualizan correctamente.

**Dónde mirar en el repositorio**

- Migraciones: `db/migrations/`
- Scripts históricos: `db/data/`
- Esquema actual: `db/schema.sql`

**Notas finales**

- Este archivo documenta la estructura, las decisiones de diseño y las prácticas operativas básicas. Para cambios estructurales mayores (nuevas FKs, columnas obligatorias o eliminación de tablas) seguir el flujo de migraciones y coordinar backups y ventanas de mantenimiento.
