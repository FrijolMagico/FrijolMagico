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
| `bun run check:staging-seed` | Valida offline en una base temporal que las migraciones, la carga atómica con FK activas y los conteos exactos del fixture funcionan. No acepta destino ni realiza I/O remoto. |
| `bun run new <name>` | Genera una migración SQL custom para editar y revisar. |
| `bun run test --filter=@frijolmagico/database` (desde la raíz) | Ejecuta los tests del paquete vía Turbo. |

No existe `bun run seed`, `bun run migrate` genérico ni `bun run reset:dev-r2` público. `seed/seed.sql` se conserva como fixture sintética; `bun run check:staging-seed` solo comprueba el fixture contra las migraciones en una base desechable bajo el directorio temporal del sistema. No lee ni modifica `local.db` o `local.dev.db`, no recibe una ruta de destino y no llama a Turso. El resultado demuestra que esta versión de SQLite/libSQL acepta las 654 sentencias en una transacción con FK activas sobre el esquema migrado y vacío; **no es autorización ni un comando de carga remota**. El script heredado `scripts/clean-devr2/reset-dev-r2.ts` solo protege assets del seed, no los del snapshot real: **no lo ejecutes manualmente contra `local.dev.db`**. Si ese archivo existe, el script aborta antes de cualquier acción R2; para limpiar el bucket necesitás un plan nuevo, revisado contra los assets del snapshot y autorizado por separado.

## Futura población sintética de staging (requiere aprobaciones separadas)

No hay hoy un comando de creación o carga del fixture remoto. No ejecutes esta secuencia ahora: cada escritura necesita una aprobación humana nueva para el destino staging exacto; la aprobación de un paso no habilita el siguiente.

1. **Crear staging:** confirmar y registrar el nombre exacto del nuevo destino y su grupo. Obtener aprobación explícita para crear esa base; luego ejecutar el procedimiento de creación Turso aprobado para ese nombre (por ejemplo, `turso db create <nombre-staging>`). Verificar identidad y host sin copiar URL con credenciales a logs.
2. **Migrar staging:** revisar las migraciones pendientes y verificar nuevamente el nombre/host. Pedir autorización independiente para la escritura de migraciones y ejecutar `bun --no-env-file run migrate:staging` siguiendo [Configuración y migraciones remotas](#configuración-y-migraciones-remotas). Comprobar después el historial Drizzle remoto y detenerse ante cualquier discrepancia.
3. **Cargar fixture:** solo después de verificar esquema e historial, pedir aprobación independiente para cargar los datos sintéticos en ese staging. Antes de operar, el mecanismo elegido debe demostrar que fija `foreign_keys = ON`, verifica un destino vacío y ejecuta todo el archivo en una única transacción con rollback ante error. El check offline prueba ese contrato local para la fixture, pero no valida la semántica del shell/driver remoto; hasta que se seleccione y pruebe un importador remoto transaccional, **no existe comando remoto de carga y no se debe canalizar el SQL a Turso**. Después de la carga autorizada, verificar los conteos esperados (artista 70, catálogo 38, 60 participaciones en la edición `temp`) y `foreign_key_check` con una lectura aprobada.

Nunca crear, migrar ni cargar producción con este procedimiento. No reutilizar autorización entre pasos ni reintentar a ciegas; no pasar URL o token en argumentos, documentación, tests o logs. El check `bun run check:staging-seed` es exclusivamente offline.

## Checklist de habilitación de previews (pendiente, no ejecutado)

Marcá cada casilla con evidencia para **web y admin** antes de habilitar un preview de prueba. Los checks locales no sustituyen las aprobaciones remotas.

- [ ] **Destino y cuota:** confirmar organización, nombre y grupo de `staging-frijolmagico`, así como el presupuesto de lecturas compartido de Turso. Pedir autorización específica para crear la base; no inferir aislamiento de cuota por tener dos bases.
- [ ] **Esquema y fixture:** ejecutar `bun --no-env-file run check:staging-seed` desde este paquete en SQLite temporal; revisar migraciones SQL pendientes. Luego, con autorizaciones **separadas**, crear staging, migrarla con `migrate:staging` (Drizzle registra su historial en esa base) y cargar la fixture solo mediante un importador remoto transaccional previamente probado. Verificar identidad antes de cada escritura, base vacía antes de cargar, `__drizzle_migrations`, FK y conteos (70 artistas, 38 catálogo, 60 participaciones en `temp`) después. Hoy **no hay importador remoto**.
- [ ] **Snapshots:** con autorización de lectura y procesos locales cerrados, confirmar identidad del origen independientemente del dump; solo entonces ejecutar `bun --no-env-file run pull:staging` y comprobar `local.dev.db` sin exponer datos. `local.db` requiere autorización de lectura **distinta** para producción. No sustituir ninguno por el seed.
- [ ] **Variables Vercel:** comprobar la configuración efectiva de **ambos** proyectos sin mostrar secretos: Production (`main`) usa la base principal; Preview general usa staging y Preview **específico de la rama `dev`** sobrescribe con la principal. Vercel `Development` no es el Preview de `dev`; no colocar tokens en `NEXT_PUBLIC_*`. Confirmar que el Ignored Build Step sigue permitiendo solo `main` y `dev`; cualquier preview de una rama feature requiere una decisión y acción de despliegue separadas. No asumir aislamiento hasta verificar desde una ejecución autorizada de cada rama.
- [ ] **Comportamiento y lecturas:** pedir autorización para **un** preview controlado; comprobar su destino sin revelar credenciales, el endpoint de slugs canónicos, redirects y consultas de catálogo con tráfico acotado. Registrar ventana/consulta/branch, estado de caché, latencia y métrica de *rows read* de Turso antes/después si el proveedor la ofrece. Las lecturas de la organización son compartidas y la diferencia temporal puede incluir tráfico ajeno; no atribuir ahorros facturables a una SQL sin métricas por consulta. Los pasos VM de SQLite y el check offline no son *rows read* facturados.
- [ ] **Cierre:** decidir conservar o revertir variables/builds del preview según la evidencia, sin desplegar producción ni migrarla automáticamente. Escalar cualquier desacuerdo de identidad, historial, FK o consumo antes de continuar.

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
