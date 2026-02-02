# db/data/

Carpeta para scripts SQL de inserción de datos históricos en la base de datos de producción.

## Propósito

Esta carpeta almacena archivos `.sql` con inserciones de datos que:

- Representan información histórica disponible hasta un punto en el tiempo
- No deben versionarse en Git (contienen datos de producción)
- Se ejecutan manualmente una única vez por archivo

Los archivos `.sql` en esta carpeta son **ignorados por Git** intencionalmente.

## Uso

### 1. Crear archivo SQL

Crea un archivo con la convención de nombre que prefieras. Sugerencia:

```
NNN_descripcion.sql
```

Ejemplos:

- `001_artistas_2023.sql`
- `002_eventos_festival_2025.sql`
- `fix_typo_artista_juan.sql`

### 2. Ejecutar con Turso CLI

```bash
# Ejecutar archivo específico
turso db shell <DATABASE_NAME> < db/data/001_artistas_2023.sql

# O usando variable de entorno
turso db shell $TURSO_DATABASE_NAME < db/data/001_artistas_2023.sql
```

### 3. Verificar inserción

```bash
turso db shell <DATABASE_NAME> "SELECT COUNT(*) FROM artista;"
```

## Rollback (Reversión)

Si necesitas revertir una inserción, crea un archivo con sufijo `.rollback.sql`:

```
001_artistas_2023.sql          # Inserción original
001_artistas_2023.rollback.sql # Script de reversión
```

Ejemplo de contenido de rollback:

```sql
-- 001_artistas_2023.rollback.sql
DELETE FROM artista WHERE created_at >= '2023-01-01' AND created_at < '2024-01-01';
```

Ejecutar rollback:

```bash
turso db shell <DATABASE_NAME> < db/data/001_artistas_2023.rollback.sql
```

## Notas

- Siempre verifica el contenido del archivo antes de ejecutar
- Considera hacer un backup antes de inserciones grandes: `turso db shell <DB> .dump > backup.sql`
- Los archivos `.sql` no se versionan, mantén respaldos locales si es necesario
