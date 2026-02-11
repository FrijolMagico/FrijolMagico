# Entity State Factory

Sistema de gestión de estado UI optimizado para el Admin de Frijol Mágico. Basado en el patrón **Entity State** (Redux Toolkit style) con una arquitectura de 3 capas.

## 1. Overview

La Entity State Factory proporciona una forma consistente y performante de manejar datos que provienen del servidor pero necesitan ser editados localmente antes de persistirse.

### Arquitectura de 3 Capas
1. **Layer 1: Remote Data**: Datos inmutables provenientes de la API.
2. **Layer 2: Applied Changes**: Cambios confirmados que ya pasaron por el journal de cambios.
3. **Layer 3: Current Edits**: Ediciones en memoria (drafts) que aún no se han confirmado.

El sistema calcula automáticamente los **Effective Data** mergeando estas 3 capas en tiempo real con prioridad L3 > L2 > L1.

## 2. Decision Matrix: ¿Qué Factory usar?

| Caso de Uso | Factory Recomendada | Razón |
|-------------|---------------------|-------|
| **Objetos planos** (Organización) | `createUIStateStore` | Simple, suficiente para un solo objeto |
| **Colecciones pequeñas** (< 50) | `createUIStateStore` | Overhead de Entity no justificado |
| **Colecciones medianas** (50-200) | `createEntityUIStateStore` | Prevenir problemas de performance en renders |
| **Colecciones grandes** (200-1000+) | `createEntityUIStateStore` | **OBLIGATORIO**: O(1) performance garantizado |
| **Operaciones Bulk** frecuentes | `createEntityUIStateStore` | API nativa para `addMany`, `updateMany`, etc. |

## 3. API Reference

### Configuration
```typescript
interface CreateEntityUIStateStoreConfig<T> {
  sectionName: string           // Identificador para el journal
  idField: keyof T              // Campo único (PK)
  isSingleton?: boolean         // Activa métodos set() y update()
  writeToJournal?: (op: EntityOperation<T>) => Promise<void>
}
```

### Selectors (O(1))
- `selectAll()`: Retorna array de entidades.
- `selectById(id)`: Retorna entidad por ID.
- `selectOne()`: Retorna el primer item (ideal para singletons).
- `getEffectiveData()`: Retorna el estado normalizado `{ entities, ids }`.
- `getHasChanges()`: Indica si hay cambios en L2 o L3.

### Actions
- `addOne(entity, id?)`: Agrega una entidad (soporta IDs temporales).
- `updateOne(id, changes)`: Actualiza campos de una entidad.
- `removeOne(id)`: Elimina una entidad.
- `addMany(entities)`, `updateMany(updates)`, `removeMany(ids)`: Operaciones bulk.
- `commitCurrentEdits()`: Mueve cambios de L3 a L2 y dispara el journal.

## 4. Usage Examples

### Collection Mode (Ej: Equipo)
```typescript
export const useEquipoUIStore = createEntityUIStateStore<TeamMember>({
  sectionName: 'equipo',
  idField: 'id'
})

// En componente
const { updateOne, removeOne } = useEquipoUIStore()
const equipo = useEquipoUIStore((s) => s.selectAll())

const onToggleDelete = (id: string) => {
  updateOne(id, { isDeleted: true })
}
```

### Singleton Mode (Ej: Organización)
```typescript
export const useOrganizationUIStore = createEntityUIStateStore<Organizacion>({
  sectionName: 'organizacion',
  idField: 'id',
  isSingleton: true
})

// En componente
const org = useOrganizationUIStore((s) => s.selectOne())
const { update, set } = useOrganizationUIStore()

// No requiere ID
update({ nombre: 'Frijol Mágico v2' })
```

## 5. Migration Guide

### Store Creation
**Before (Old Factory):**
```typescript
const useStore = createUIStateStore<T, TForm>({ sectionName: 'x' })
```
**After (Entity Factory):**
```typescript
const useStore = createEntityUIStateStore<T>({ 
  sectionName: 'x',
  idField: 'id' 
})
```

### Component Logic
**Before (Index-based):**
```typescript
const handleDelete = (index: number) => {
  const updated = [...equipo]
  updated[index].isDeleted = true
  updateCurrentEdits({ equipo: updated })
}
```
**After (ID-based):**
```typescript
const handleDelete = (memberId: string) => {
  updateOne(memberId, { isDeleted: true })
}
```

## 6. Performance

El sistema garantiza operaciones constantes sin importar el tamaño de la colección:

| Métrica | Target | Resultado (1000 items) |
|---------|--------|-----------|
| Lookup Time | < 1ms | **~0.1ms** |
| Update Time | < 1ms | **~0.2ms** |
| Delete Time | < 1ms | **~0.1ms** |
| Bulk (50 items) | < 16ms | **~4ms** |
| Memory Per Item | < 1KB | **~0.5KB** |

## 7. Gotchas & Best Practices

- **Flat Interfaces**: Evita objetos anidados dentro de la entidad. El merge es shallow.
- **ID Types**: Usa `number | string` en tus interfaces para soportar IDs temporales generados por la factory (`temp-123...`).
- **Selectors**: Siempre prefiere usar selectores específicos (`state => state.selectById(id)`) para minimizar re-renders.
- **Soft Delete**: Para registros persistidos, prefiere `updateOne(id, { isDeleted: true })` en lugar de `removeOne(id)`.
