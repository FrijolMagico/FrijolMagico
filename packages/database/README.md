# @frijolmagico/database

Acceso a Turso/libSQL desde el monorepo: Drizzle ORM para consultas relacionales y cliente SQL para consultas directas. Para desarrollo, `local.dev.db` es una copia real de **staging** y `local.db` una copia real de **producción**; no son bases de datos de prueba generadas con seed.

## Desarrollo local con snapshots

Desde la raíz, `bun run dev` inicia web y admin con una URL `file:` directa a `packages/database/local.dev.db`; `bun run dev:real` usa `packages/database/local.db`. Ambos preservan los filtros Turbo pasados, por ejemplo `bun run dev --filter=@frijolmagico/web` o `bun run dev:real --filter=@frijolmagico/admin`. No inician un servidor Turso local, sincronizan snapshots automáticamente ni leen Turso Cloud. `dev:real` solo apunta al archivo local `local.db` —nunca a una base remota—, pero el admin puede escribir en ese archivo con datos reales de producción.

Los antiguos scripts locales de desarrollo y producción del paquete de base de datos ya no existen. Si iniciás `bun run dev` directamente desde `apps/web/` o `apps/admin/`, configurá explícitamente `TURSO_DATABASE_URL` con la URL `file:` absoluta del snapshot elegido; sin esa variable el acceso a la base falla cerrado.

## Refrescar un snapshot (opcional)

Antes de refrescar, detené los procesos de web/admin y cualquier otro proceso que use los archivos locales. Desde `packages/database/`, obtené autorización de lectura para el destino específico:

- Staging: autenticar la CLI con `turso auth login`, configurar `TURSO_STAGING_DATABASE_NAME` con el nombre exacto y ejecutar `bun --no-env-file run pull:staging` para reemplazar `local.dev.db`.
- Producción: obtener autorización de lectura separada, configurar `TURSO_PRODUCTION_DATABASE_NAME` y ejecutar `bun --no-env-file run pull:production` para reemplazar `local.db`.

Los pulls obtienen un dump, lo importan y validan antes de reemplazar el archivo seleccionado. No migran ni escriben en Turso remoto; sí reemplazan el snapshot local. No configures `TURSO_DATABASE_URL` ni `TURSO_AUTH_TOKEN` para el pull. Verificá el origen independientemente del dump: un dump válido pero del origen equivocado no se puede detectar solo por el esquema.

CI aplica las mismas migraciones versionadas únicamente al archivo aislado `mock.local.db` mediante `bun run migrate:ci` y `drizzle-ci.config.ts`. Esa configuración fija `file:./mock.local.db`, no usa `TURSO_DATABASE_URL` ni tokens y corre con `--no-env-file`; CI no migra bases remotas. Las migraciones de producción son una operación manual fuera de CI que requiere autorización humana separada.

## Comandos y destinos

| Comando (desde `packages/database/`) | Destino / efecto |
| --- | --- |
| `bun --no-env-file run pull:staging` | Lee staging; valida y reemplaza solo `local.dev.db`. |
| `bun --no-env-file run pull:production` | Lee producción; valida y reemplaza solo `local.db`. |
| `bun run dev` (desde la raíz) | Web + admin con URL `file:` a `packages/database/local.dev.db`; sin servidor local ni conexión/sync a Turso Cloud. |
| `bun run dev:real` (desde la raíz) | Web + admin con URL `file:` a `packages/database/local.db`; permite escrituras locales. |
| `bun run migrate:staging` | **Escribe** migraciones versionadas en staging remoto, con autorización específica. |
| `bun run migrate:production` | **Escribe** migraciones versionadas en producción remota, con autorización humana nueva y confirmación explícita. |
| `bun run migrate:ci` | Aplica las migraciones versionadas solo a `mock.local.db` mediante `drizzle-ci.config.ts`; no lee URL ni token del entorno. |
| `bun run new <name>` | Genera una migración SQL custom para editar y revisar. |
| `bun run test --filter=@frijolmagico/database` (desde la raíz) | Ejecuta los tests del paquete vía Turbo. |

No existe `bun run seed`, `bun run migrate` genérico ni `bun run reset:dev-r2` público. `seed/seed.sql` se conserva como fixture sintética para tests; **no hay un comando para repetir su carga remota**. El script heredado `scripts/clean-devr2/reset-dev-r2.ts` solo protege assets del seed, no los del snapshot real: **no lo ejecutes manualmente contra `local.dev.db`**. Si ese archivo existe, el script aborta antes de cualquier acción R2; para limpiar el bucket necesitás un plan nuevo, revisado contra los assets del snapshot y autorizado por separado.

## Estado de staging

`staging-frijolmagico` ya fue creada, migrada y poblada una sola vez con el fixture sintético. La última comprobación registró 27 migraciones, 70 artistas, 38 entradas de catálogo, 60 participaciones en la edición `temp` y ninguna violación de claves foráneas. Los scripts de preparación y carga única se retiraron para evitar repetirla por accidente. `seed/seed.sql` permanece para pruebas locales; producción no fue poblada con ese fixture.

## Checklist de habilitación de previews (pendiente, no ejecutado)

Marcá cada casilla con evidencia para **web y admin** antes de habilitar un preview de prueba. Los checks locales no sustituyen las aprobaciones remotas.

- [x] **Destino, esquema y fixture:** `staging-frijolmagico` está creada con 27 migraciones y el fixture cargado una vez; se verificaron conteos y FK. Su cuota de lecturas sigue compartida con la organización; no inferir aislamiento de cuota por tener dos bases.
- [ ] **Snapshots:** con autorización de lectura y procesos locales cerrados, confirmar identidad del origen independientemente del dump; solo entonces ejecutar `bun --no-env-file run pull:staging` y comprobar `local.dev.db` sin exponer datos. `local.db` requiere autorización de lectura **distinta** para producción. No sustituir ninguno por el seed.
- [ ] **Variables Vercel:** comprobar la configuración efectiva de **ambos** proyectos sin mostrar secretos: Production (`main`) usa la base principal; Preview general usa staging y Preview **específico de la rama `dev`** sobrescribe con la principal. Vercel `Development` no es el Preview de `dev`; no colocar tokens en `NEXT_PUBLIC_*`. Confirmar que el Ignored Build Step sigue permitiendo solo `main` y `dev`; cualquier preview de una rama feature requiere una decisión y acción de despliegue separadas. No asumir aislamiento hasta verificar desde una ejecución autorizada de cada rama.
- [ ] **Comportamiento y lecturas:** pedir autorización para **un** preview controlado; comprobar su destino sin revelar credenciales, el endpoint de slugs canónicos, redirects y consultas de catálogo con tráfico acotado. Registrar ventana/consulta/branch, estado de caché, latencia y métrica de *rows read* de Turso antes/después si el proveedor la ofrece. Las lecturas de la organización son compartidas y la diferencia temporal puede incluir tráfico ajeno; no atribuir ahorros facturables a una SQL sin métricas por consulta. Los pasos VM de SQLite no son *rows read* facturados.
- [ ] **Cierre:** decidir conservar o revertir variables/builds del preview según la evidencia, sin desplegar producción ni migrarla automáticamente. Escalar cualquier desacuerdo de identidad, historial, FK o consumo antes de continuar.

## Configuración y migraciones remotas

La CLI `turso` usa su propia autenticación (`turso auth login`); los tokens de Drizzle **no** la autentican. Guardá credenciales solo en un entorno privado, nunca en Git ni en comandos compartidos. Para migraciones, agregá manualmente las credenciales del destino a `packages/database/.env.local`, que está ignorado por Git; no incluyas valores reales en documentación, comandos ni logs. Los scripts `bun run migrate:staging` y `bun run migrate:production` cargan explícitamente ese archivo y ejecutan Drizzle Kit con `--config=drizzle-staging.config.ts` o `--config=drizzle-production.config.ts`. Cada config lee y valida solo las variables de su destino; no hay wrapper que filtre el entorno del proceso. Drizzle Kit puede mostrar URLs o tokens en su salida: no ejecutes con credenciales reales en logs compartidos ni guardes la salida en lugares inseguros. Los pulls siguen usando `bun --no-env-file run pull:<destino>` y no cargan ese archivo; requieren solo el nombre de la base y autenticación separada de la CLI Turso. No hay que configurar tokens para servir los archivos locales.

Para migrar, configurá únicamente el juego de identidad, URL y token del destino que vas a migrar:

| Destino | Nombre exacto | URL remota (libsql:// o https://) | Token de migración |
| --- | --- | --- | --- |
| Staging | `TURSO_STAGING_DATABASE_NAME` | `TURSO_STAGING_DATABASE_URL` | `TURSO_STAGING_AUTH_TOKEN` |
| Producción | `TURSO_PRODUCTION_DATABASE_NAME` | `TURSO_PRODUCTION_DATABASE_URL` | `TURSO_PRODUCTION_AUTH_TOKEN` |

La URL debe tener esquema `libsql:` o `https:`, sin credenciales, puerto, ruta, query ni fragmento; su hostname debe ser de Turso y empezar con el nombre exacto seleccionado seguido del separador `-`, no solo contenerlo en otra parte. Cada config pasa a Drizzle las credenciales del destino seleccionado. Producción requiere `TURSO_PRODUCTION_MIGRATION_CONFIRM=migrate:<nombre-de-producción>`; la confirmación exacta **no sustituye** la autorización humana. Las dos configs comparten `./migrations/`, pero Drizzle mantiene su registro de migraciones aplicado por separado en cada base.

Secuencia operativa: revisar el SQL pendiente y el destino, obtener autorización para **staging**, ejecutar `bun run migrate:staging` y verificar el estado remoto; luego solicitar **otra autorización** para producción, revisar respaldo/rollback y ejecutar `bun run migrate:production` con su confirmación exacta. Nunca ejecutes los dos destinos como una sola operación implícita. Producción se migra manualmente, fuera de CI, y requiere autorización humana separada; ningún PR ni workflow aplica migraciones remotas. Un pull posterior permite obtener snapshots compatibles con las migraciones. La migración y carga iniciales de staging ya se completaron con autorizaciones separadas; estos comandos siguen disponibles solo para nuevas migraciones autorizadas.

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
