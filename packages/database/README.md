# @frijolmagico/database

Acceso a Turso/libSQL desde el monorepo: Drizzle ORM para consultas relacionales y cliente SQL para consultas directas. Para desarrollo, `local.dev.db` es una copia real de **staging** y `local.db` una copia real de **producción**; no son bases de datos de prueba generadas con seed.

## Camino rápido: copiar staging para desarrollo

Desde `packages/database/`, con `turso`, `sqlite3` y `bun` disponibles:

1. Cerrá `bun run dev`/`bun run prod` y cualquier otro proceso que use los archivos locales. No actualices una base abierta.
2. Autenticate en la CLI con `turso auth login` (sesión de CLI separada de los tokens de la app) y verificá por fuera del dump que estás en la organización y base esperadas. Configurá `TURSO_STAGING_DATABASE_NAME` con el nombre exacto de staging. No configures `TURSO_DATABASE_URL` ni `TURSO_AUTH_TOKEN` para el pull.
3. Con autorización para leer staging, ejecutá `bun --no-env-file run pull:staging`. El comando obtiene `turso db shell <nombre> .dump`, importa con `sqlite3`, verifica integridad, claves foráneas, metadatos de migración y un esquema mínimo, y recién entonces reemplaza `local.dev.db`.
4. Verificá el origen y los datos localmente antes de ejecutar `bun run dev` (`turso dev --db-file local.dev.db`). La validación estructural no demuestra de qué base vino el dump.

Para una copia de producción, obtené **autorización de lectura de producción por separado**, configurá `TURSO_PRODUCTION_DATABASE_NAME`, cerrá ambos servidores locales y ejecutá `bun --no-env-file run pull:production`; verificá origen y contenido antes de `bun run prod` (`turso dev --db-file local.db`). Los nombres de staging y producción deben ser distintos. Un pull no migra ni escribe en Turso remoto; **sí reemplaza el archivo local seleccionado**. Si falla antes del reemplazo, conserva el archivo anterior. Un dump válido pero del origen equivocado no se puede detectar solo por el esquema.

## Comandos y destinos

| Comando (desde `packages/database/`) | Destino / efecto |
| --- | --- |
| `bun --no-env-file run pull:staging` | Lee staging; valida y reemplaza solo `local.dev.db`. |
| `bun --no-env-file run pull:production` | Lee producción; valida y reemplaza solo `local.db`. |
| `bun run dev` / `bun run prod` | Sirve el archivo local de staging / producción, respectivamente. No conecta a Turso Cloud. |
| `bun --no-env-file run migrate:staging` | **Escribe** migraciones versionadas en staging remoto, con autorización específica. |
| `bun --no-env-file run migrate:production` | **Escribe** migraciones versionadas en producción remota, con autorización humana nueva y confirmación explícita. |
| `bun run new <name>` | Genera una migración SQL custom para editar y revisar. |
| `bun run test --filter=@frijolmagico/database` (desde la raíz) | Ejecuta los tests del paquete vía Turbo. |

No existe `bun run seed`, `bun run migrate` genérico ni `bun run reset:dev-r2` público. `seed/seed.sql` se conserva como fixture de tests y referencia histórica, **no** como procedimiento de desarrollo ni como datos para sincronizar con Turso. El script heredado `scripts/clean-devr2/reset-dev-r2.ts` solo protege assets del seed, no los del snapshot real: **no lo ejecutes manualmente contra `local.dev.db`**. Si ese archivo existe, el script aborta antes de cualquier acción R2; para limpiar el bucket necesitás un plan nuevo, revisado contra los assets del snapshot y autorizado por separado.

## Configuración y migraciones remotas

La CLI `turso` usa su propia autenticación (`turso auth login`); los tokens de Drizzle **no** la autentican. Guardá credenciales solo en un entorno privado, nunca en Git ni en comandos compartidos. Los pulls requieren únicamente el nombre `TURSO_STAGING_DATABASE_NAME` o `TURSO_PRODUCTION_DATABASE_NAME` del destino correspondiente; rechazan `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` ambientales. Ejecutá los comandos de pull y migración con `bun --no-env-file run ...`: así Bun no carga automáticamente `.env.local` en el proceso de entrada. Los scripts del paquete también usan `bun --no-env-file` para evitar una segunda carga. Las variables explícitas ya exportadas en el shell siguen disponibles. Los comandos cortos anteriores `bun run pull:staging`, `bun run pull:production` y `bun run migrate:<destino>` fallan cerrado antes de llamar a Turso si Bun carga credenciales genéricas desde `.env.local`; no las ignoran ni seleccionan un destino alternativo. No hay que configurar tokens para servir los archivos locales.

Para migrar, configurá **ambos** juegos de identidad y URL, y el token solo del destino que vas a migrar:

| Destino | Identidad CLI | URL remota (libsql:// o https://) | Token de migración |
| --- | --- | --- | --- |
| Staging | `TURSO_STAGING_DATABASE_NAME` | `TURSO_STAGING_DATABASE_URL` | `TURSO_STAGING_AUTH_TOKEN` |
| Producción | `TURSO_PRODUCTION_DATABASE_NAME` | `TURSO_PRODUCTION_DATABASE_URL` | `TURSO_PRODUCTION_AUTH_TOKEN` |

Las URL deben identificar el host de la base nombrada y los destinos deben ser distintos. `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` ambientales se rechazan también en migraciones. El wrapper verifica además la URL de la CLI (`turso db show <nombre> --url`) antes de aplicar el mismo directorio `migrations/` al destino seleccionado. Producción requiere `TURSO_PRODUCTION_MIGRATION_CONFIRM=migrate:<nombre-de-producción>`; esta marca **no sustituye** la autorización humana.

Secuencia operativa: revisar el SQL pendiente y el destino, obtener autorización para **staging**, ejecutar `bun --no-env-file run migrate:staging`, verificar el estado remoto; luego solicitar **otra autorización** para producción, revisar respaldo/rollback y ejecutar `bun --no-env-file run migrate:production` con su confirmación exacta. Nunca ejecutes los dos destinos como una sola operación implícita. Un pull posterior permite obtener snapshots compatibles con las migraciones. Ningún comando de este documento se ejecutó contra Turso al actualizar la documentación.

## Privacidad, fallas y rollback

- `local.dev.db` y `local.db` contienen datos reales privados. No los subas a Git ni compartas dumps, tokens, URLs con secretos o logs con filas. Protegé también cualquier copia, temporal y archivo SQLite `-wal`/`-shm`; cerrá servidores y escritores antes del pull. El comando rechaza sidecars existentes y crea un directorio temporal privado para importar y validar.
- Antes de reemplazar una copia local útil, conservá un respaldo **privado** fuera del repositorio conforme a la política de datos. Si el contenido nuevo es incorrecto, cerrá los procesos locales y restaurá la copia anterior de forma segura o volvé a obtener el snapshot del origen verificado. No confundas esa recuperación local con rollback remoto.
- Si una migración remota falla, **detenete** y verificá el estado de migraciones y datos en el destino; no reintentes a ciegas ni ejecutes producción automáticamente. Un rollback remoto exige plan, respaldo y autorización específicos: las migraciones ya aplicadas no se revierten por restaurar un archivo local.
- La facturación por filas leídas de `.dump` frente a `turso db export` **no está documentada aquí ni verificada por el proveedor**; no prometemos que uno sea más barato. `.dump` omite tablas internas de SQLite; la importación exige metadatos de migración y esquema mínimo, por lo que algunos dumps pueden fallar la validación. Un snapshot de `db export` puede estar desactualizado. Validá frescura, identidad, integridad, esquema y datos antes de usar cualquier exportación alternativa; este script utiliza `.dump`, no `db export`.

## Uso en código

```typescript
import { db } from '@frijolmagico/database/orm'
import { executeQuery } from '@frijolmagico/database/client'
import { schema } from '@frijolmagico/database/schema'
import { isNotDeleted } from '@frijolmagico/database/filters'
import { loadSql } from '@frijolmagico/database/sql'
```

El esquema vive en `src/db/schema/`; `migrations/` contiene las migraciones versionadas, `data/` SQL de referencia (no migraciones) y `seed/seed.sql` una fixture de tests. Admin utiliza Drizzle ORM; web utiliza el cliente SQL para consultas especializadas. Ver [README raíz](../../README.md) para el resto del monorepo.
