# @frijolmagico/database

Paquete de base de datos centralizado para el monorepo de Frijol Mágico. Proporciona acceso a la base de datos Turso/libSQL mediante dos interfaces:

- **Cliente Raw (libSQL)**: Para queries SQL directas (usado en `web`)
- **Cliente Drizzle ORM**: Para queries type-safe con relaciones (usado en `admin`)

---

## 📦 Instalación

Este paquete es interno del monorepo y se instala automáticamente:

```bash
bun install
```

---

## 🗂️ Estructura del Proyecto

```
packages/database/
├── src/
│   ├── db/
│   │   ├── schema.ts      # Definición de tablas (Drizzle)
│   │   ├── relations.ts   # Relaciones entre tablas
│   │   └── types.ts       # Tipos TypeScript inferidos
│   ├── client.ts          # Cliente raw libSQL
│   ├── drizzle.ts         # Cliente Drizzle ORM
│   ├── index.ts           # Re-exports principales
│   └── types/
│       └── index.ts       # Tipos personalizados
├── migrations/            # Migraciones SQL
├── drizzle.config.ts      # Configuración Drizzle Kit
└── package.json
```

---

## 🚀 Uso

### Opción 1: Cliente Drizzle ORM (Recomendado para Admin)

Cliente type-safe con soporte completo para relaciones y autocomplete.

```typescript
// Importar el cliente Drizzle
import { db } from '@frijolmagico/database/orm'
import { artista, artistaImagen } from '@frijolmagico/database/schema'
import type { Artista, NewArtista } from '@frijolmagico/database/types'

// ✅ Query simple
const artistas = await db.select().from(artista)

// ✅ Query con filtros
import { eq, and, like } from 'drizzle-orm'

const artistasPorEstado = await db
  .select()
  .from(artista)
  .where(eq(artista.estadoId, 1))

// ✅ Query con relaciones (relational queries)
const artistasConImagenes = await db.query.artista.findMany({
  with: {
    imagenes: true,
    estado: true,
    catalogoArtista: true
  }
})

// ✅ Insert
const nuevoArtista: NewArtista = {
  pseudonimo: 'El Artista',
  slug: 'el-artista',
  nombre: 'Juan Pérez',
  correo: 'juan@example.com'
}

const resultado = await db.insert(artista).values(nuevoArtista).returning()

// ✅ Update
await db.update(artista).set({ ciudad: 'Santiago' }).where(eq(artista.id, 1))

// ✅ Delete
await db.delete(artista).where(eq(artista.id, 1))

// ✅ Transacciones
await db.transaction(async (tx) => {
  const [nuevoArtista] = await tx
    .insert(artista)
    .values({
      pseudonimo: 'Nuevo',
      slug: 'nuevo'
    })
    .returning()

  await tx.insert(artistaImagen).values({
    artistaId: nuevoArtista.id,
    imagenUrl: '/avatar.jpg',
    tipo: 'avatar'
  })
})
```

### Opción 2: Cliente Raw libSQL (Para Web o SQL Directo)

Cliente directo para queries SQL raw (mantiene compatibilidad con código existente).

```typescript
// Importar el cliente raw
import { executeQuery, getTursoClient } from '@frijolmagico/database/client'

// ✅ Query simple
const { data, error } = await executeQuery<{ id: number; nombre: string }>(
  'SELECT id, nombre FROM artista WHERE estado_id = ?',
  [1]
)

if (error) {
  console.error('Error:', error)
} else {
  console.log('Artistas:', data)
}

// ✅ Insert con lastInsertRowid
import { executeInsert } from '@frijolmagico/database/client'

const { lastInsertRowid, error: insertError } = await executeInsert(
  'INSERT INTO artista (pseudonimo, slug) VALUES (?, ?)',
  ['El Artista', 'el-artista']
)

// ✅ Batch de queries
import { executeBatch } from '@frijolmagico/database/client'

const { success, error: batchError } = await executeBatch([
  {
    sql: 'UPDATE artista SET ciudad = ? WHERE id = ?',
    params: ['Santiago', 1]
  },
  { sql: 'UPDATE artista SET pais = ? WHERE id = ?', params: ['Chile', 1] }
])

// ✅ Cliente directo para casos avanzados
const client = getTursoClient()
const result = await client.execute('SELECT * FROM artista')
```

---

## 📚 Schema y Tipos

### Tablas Disponibles

El schema incluye 24 tablas organizadas por dominio:

**Core:**

- `organizacion`, `organizacionEquipo`
- `lugar`, `disciplina`

**Artistas:**

- `artistaEstado`, `artista`, `artistaImagen`, `artistaHistorial`
- `catalogoArtista`, `agrupacion`

**Eventos:**

- `evento`, `eventoEdicion`, `eventoEdicionDia`
- `eventoEdicionMetrica`, `eventoEdicionSnapshot`, `eventoEdicionPostulacion`

**Participantes:**

- `tipoActividad`, `modoIngreso`
- `eventoEdicionParticipante`, `participanteExposicion`, `participanteActividad`, `actividad`

### Tipos TypeScript

Cada tabla tiene tipos inferidos automáticamente:

```typescript
import type {
  Artista, // Tipo para SELECT
  NewArtista, // Tipo para INSERT
  Evento,
  NewEvento
  // ... etc
} from '@frijolmagico/database/types'

// Uso en funciones
async function crearArtista(data: NewArtista): Promise<Artista> {
  const [artista] = await db.insert(artista).values(data).returning()
  return artista
}
```

### Relaciones

Las relaciones están definidas y se pueden usar en queries relacionales:

```typescript
// Query con múltiples niveles de relaciones
const eventos = await db.query.evento.findMany({
  with: {
    organizacion: true,
    ediciones: {
      with: {
        dias: {
          with: {
            lugar: true
          }
        },
        participantes: {
          with: {
            artista: {
              with: {
                estado: true,
                imagenes: true
              }
            }
          }
        }
      }
    }
  }
})
```

---

## 🔄 Migraciones

### Crear una Nueva Migración

```bash
# En packages/database/
bun run db:new nombre-de-migracion
```

Esto creará un archivo `.sql` vacío en `migrations/`. Edita el archivo con tu SQL:

```sql
-- Custom SQL migration file, put your code below! --

CREATE TABLE nueva_tabla (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL
);
--> statement-breakpoint

CREATE INDEX idx_nueva_tabla_nombre ON nueva_tabla (nombre);
```

**Importante:** Usa `--> statement-breakpoint` entre statements para compatibilidad con Turso.

### Aplicar Migraciones

```bash
# Aplicar migraciones pendientes
bun run db:migrate
```

### Sincronizar Schema con Migraciones

Si modificas `src/db/schema.ts`, debes generar una migración que refleje esos cambios en SQL:

1. Actualiza `schema.ts` con tus cambios
2. Genera migración: `bun run db:new nombre-descriptivo`
3. Revisa el SQL generado en `migrations/`
4. Aplica: `bun run db:migrate`

---

## 🌍 Variables de Entorno

Crea `.env.local` en `packages/database/`:

```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

O para desarrollo local:

```env
TURSO_DATABASE_URL=file:./local.db
```

---

## 📖 Ejemplos por Caso de Uso

### Consultar artistas del catálogo activo

```typescript
import { db } from '@frijolmagico/database/drizzle'
import { catalogoArtista } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'

const artistasActivos = await db.query.catalogoArtista.findMany({
  where: eq(catalogoArtista.activo, true),
  with: {
    artista: {
      with: {
        imagenes: {
          where: eq(artistaImagen.tipo, 'avatar')
        }
      }
    }
  },
  orderBy: (catalogo) => catalogo.orden
})
```

### Crear un participante de evento

```typescript
import { db } from '@frijolmagico/database/drizzle'
import {
  eventoEdicionParticipante,
  participanteExposicion
} from '@frijolmagico/database/schema'

await db.transaction(async (tx) => {
  // 1. Crear registro maestro
  const [participante] = await tx
    .insert(eventoEdicionParticipante)
    .values({
      eventoEdicionId: 1,
      artistaId: 5,
      estado: 'activo'
    })
    .returning()

  // 2. Crear registro de exposición
  await tx.insert(participanteExposicion).values({
    artistaId: 5,
    eventoEdicionId: 1,
    participanteId: participante.id,
    disciplinaId: 2,
    modoIngresoId: 1,
    estado: 'confirmado'
  })
})
```

### Buscar eventos con sus días

```typescript
import { db } from '@frijolmagico/database/drizzle'
import { like } from 'drizzle-orm'
import { evento } from '@frijolmagico/database/schema'

const festivalFrijol = await db.query.evento.findFirst({
  where: like(evento.nombre, '%Frijol%'),
  with: {
    ediciones: {
      with: {
        dias: {
          with: {
            lugar: true
          }
        }
      },
      orderBy: (edicion) => edicion.numeroEdicion
    }
  }
})
```

---

## 🔧 Drizzle Studio (Opcional)

Para explorar la base de datos visualmente:

```bash
# En packages/database/
bunx drizzle-kit studio
```

Abre `https://local.drizzle.studio` en tu navegador.

---

## 🎯 Decisiones de Diseño

### ¿Por qué dos clientes?

- **Admin** necesita queries complejas con relaciones → Drizzle ORM
- **Web** usa queries optimizadas manuales → Raw SQL (más control)
- Ambos comparten la misma conexión subyacente (sin overhead)

### ¿Por qué custom SQL migrations?

Drizzle Kit no soporta triggers, constraints complejas ni lógica de negocio avanzada. Las migraciones custom SQL nos dan control total.

### Integridad referencial

Las FKs y constraints están definidas en:

1. **Schema Drizzle** (para validación a nivel de código)
2. **Migraciones SQL** (para enforcement a nivel de BD)

---

## 🐛 Troubleshooting

### Error: `SQL_MANY_STATEMENTS`

**Causa:** Falta `--> statement-breakpoint` en tus migraciones.

**Solución:** Agrega el breakpoint entre statements en el archivo `.sql`.

### Error: No se pueden importar tipos

**Causa:** Tu IDE/TypeScript no reconoce los exports.

**Solución:**

```bash
# Re-instalar dependencias
bun install

# Reiniciar el servidor de TypeScript (VSCode: Cmd+Shift+P → "Restart TS Server")
```

### Queries lentas

**Causa:** Falta índice o query no optimizada.

**Solución:**

1. Revisa con `EXPLAIN QUERY PLAN` en Drizzle Studio
2. Agrega índice en migración
3. Considera usar raw SQL para queries críticas

---

## 📝 Notas Importantes

- **Triggers y constraints:** Definidos en migraciones SQL, no en schema Drizzle (limitación del ORM)
- **Better Auth:** Las tablas de auth se agregarán en una migración futura
- **Backfills:** Scripts de datos históricos en `migrations/` (ejecutar manualmente si es necesario)
- **Testing:** No borrar `__drizzle_migrations` en producción

---

## 🔗 Referencias

- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Turso Docs](https://docs.turso.tech/)
- [libSQL Client](https://github.com/tursodatabase/libsql-client-ts)

---

## 📞 Soporte

Para dudas o problemas con la base de datos, contactar al equipo de desarrollo.
