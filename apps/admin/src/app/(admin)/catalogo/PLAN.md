# Plan de Implementación: Catálogo de Artistas

## 📋 Resumen Ejecutivo

Sección de administración para gestionar el catálogo de artistas con edición dual (entrada de catálogo + información de artista en dialog stacked), paginación de 20 elementos, rich text con TipTap, reordenamiento drag & drop entre páginas, y gestión de drafts.

---

## 🎯 Requisitos Funcionales

### Funcionalidades Principales

1. **Listado paginado** de artistas del catálogo (20 por página)
2. **Filtros**: por estado activo/inactivo, destacado, búsqueda por nombre
3. **Reordenamiento drag & drop** entre páginas para el campo `orden`
4. **Edición Entrada Catálogo**: descripción (rich text), destacado, activo
5. **Edición Artista**: nombre, pseudonimo, correo, rrss, ciudad, país (dialog sobre catálogo)
6. **Avatar**: visualización con CDN (placeholder para edición futura)
7. **Draft auto-guardado** por artista con recuperación
8. **Validaciones** cliente y servidor

### Alcance Excluido (Fase 2)

- Upload de imágenes (avatar/galería)
- Historial de cambios
- Selección múltiple/bulk actions

---

## 🏗️ Arquitectura de Directorios

```
src/
├── components/ui/                    # shadcn components (existente)
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── table.tsx
│   └── ...
├── app/(admin)/
│   ├── _components/                  # COMPONENTES COMPARTIDOS ADMIN
│   │   ├── admin/
│   │   │   ├── SaveButton.tsx       # Botón guardar genérico
│   │   │   ├── DraftNotification.tsx # Notificación draft
│   │   │   └── EmptyState.tsx       # Estado vacío
│   │   └── tiptap/                  # TipTap shared
│   │       ├── TiptapEditor.tsx     # Editor rich text
│   │       ├── TiptapToolbar.tsx    # Toolbar TipTap
│   │       └── EditableRichTextField.tsx
│   ├── _lib/                        # UTILIDADES COMPARTIDAS
│   │   └── draft/
│   │       ├── draftManager.ts      # Draft manager genérico
│   │       └── types.ts             # Tipos draft
│   ├── catalogo/
│   │   └── artistas/
│   │       ├── page.tsx             # Server Component
│   │       ├── types/
│   │       │   └── catalogo.ts
│   │       ├── lib/
│   │       │   ├── getCatalogoData.ts
│   │       │   ├── reorderCatalogo.ts # Server action reordenamiento
│   │       │   └── cdn.ts           # Helper CDN
│   │       ├── actions/
│   │       │   └── catalogo.actions.ts
│   │       ├── hooks/
│   │       │   └── useCatalogoForm.ts
│   │       └── components/
│   │           ├── CatalogoArtistasContainer.tsx
│   │           ├── CatalogoTable.tsx
│   │           ├── DraggableCatalogoRow.tsx    # Fila draggeable
│   │           ├── CatalogoFilters.tsx
│   │           ├── CatalogoPagination.tsx
│   │           ├── EditCatalogoDialog.tsx      # Primer nivel
│   │           ├── EditArtistaDialog.tsx       # Segundo nivel (stacked)
│   │           └── ArtistaAvatar.tsx
│   └── organizacion/
│       └── ...                       # Refactorizado para usar shared
```

---

## 📊 Esquema de Datos

### Tipos TypeScript (types/catalogo.ts)

```typescript
// Datos del catálogo
interface CatalogoArtista {
  // From artista table (readonly)
  artistaId: number
  nombre: string | null
  pseudonimo: string
  slug: string
  correo: string | null
  rrss: string | null
  ciudad: string | null
  pais: string | null
  avatarUrl: string | null

  // From catalogo_artista table
  catalogoId: number
  orden: string // Controlado por drag & drop
  destacado: boolean
  activo: boolean
  descripcion: string | null
  catalogoUpdatedAt: string

  // Metadata
  participacionesCount: number
  ultimaEdicion: string | null
}

// Formulario Entrada Catálogo (sin orden - se maneja por DnD)
interface CatalogoEntryFormData {
  destacado: boolean
  activo: boolean
  descripcion: string
}

// Formulario Artista
interface ArtistaFormData {
  nombre: string
  pseudonimo: string
  correo: string
  rrss: string
  ciudad: string
  pais: string
}

// Para reordenamiento DnD
interface ReorderPayload {
  artistaId: number
  newOrden: string
  sourcePage: number
  targetPage: number
}

interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}
```

---

## 🔧 Implementación Detallada

### Fase 1: Refactorización Componentes Compartidos

#### 1.1 Mover TipTap Components

**Origen**: `organizacion/components/`
**Destino**: `_components/tiptap/`

Archivos a mover:

- `TiptapToolbar.tsx` → `_components/tiptap/TiptapToolbar.tsx`
- `EditableRichTextField.tsx` → `_components/tiptap/EditableRichTextField.tsx`
- Crear `TiptapEditor.tsx` wrapper

**Nota**: Los componentes UI de shadcn permanecen en `src/components/ui/` (convención shadcn).

#### 1.2 Mover Draft Manager

**Origen**: `organizacion/lib/draftManager.ts`
**Destino**: `_lib/draft/draftManager.ts`

#### 1.3 Crear Admin Components

**Ubicación**: `_components/admin/`

Archivos nuevos:

- `SaveButton.tsx`
- `DraftNotification.tsx`
- `EmptyState.tsx`

### Fase 2: Backend & Data Layer

#### 2.1 Query de Datos (lib/getCatalogoData.ts)

```typescript
export async function getCatalogoArtistas(
  page: number = 1,
  limit: number = 20,
  filters?: {
    activo?: boolean
    destacado?: boolean
    search?: string
  }
): Promise<PaginatedResult<CatalogoArtista>>
```

**Query incluye**:

- Join de `catalogo_artista`, `artista`, `artistaImagen`
- Avatar con CDN path
- Paginación con offset/limit
- Count total para paginación

#### 2.2 Server Actions (actions/catalogo.actions.ts)

```typescript
// Actualizar entrada del catálogo (sin orden)
export async function updateCatalogoEntry(
  artistaId: number,
  data: CatalogoEntryFormData
): Promise<{ success: boolean; error?: string }>

// Actualizar información del artista
export async function updateArtista(
  artistaId: number,
  data: ArtistaFormData
): Promise<{ success: boolean; error?: string }>

// Reordenar artista (drag & drop)
export async function reorderCatalogoArtista(
  payload: ReorderPayload
): Promise<{ success: boolean; error?: string }>

// Toggle rápido
export async function toggleCatalogoField(
  artistaId: number,
  field: 'destacado' | 'activo',
  value: boolean
): Promise<{ success: boolean; error?: string }>
```

#### 2.3 Lógica de Reordenamiento

El campo `orden` es tipo TEXT para permitir inserción entre elementos:

- Estrategia: "String ordering" (similar a Notion/Linear)
- Ejemplo: orden "1", "2" → insertar entre: "1.5"
- Al mover entre páginas, recalcular orden basado en posición destino
- Si se agota espacio (muchos decimales), re-balancear toda la lista

```typescript
// Ejemplo de generación de orden intermedio
function generateMidOrder(prev: string, next: string): string {
  const prevNum = parseFloat(prev)
  const nextNum = parseFloat(next)
  const mid = (prevNum + nextNum) / 2
  return mid.toString()
}
```

#### 2.4 CDN Helper

```typescript
// lib/cdn.ts
const CDN_URL = process.env.CDN_URL ?? 'https://cdn.frijolmagico.cl/'

export function getAvatarUrl(path: string | null): string {
  if (!path) return '/images/placeholder-avatar.svg'
  if (path.startsWith('http')) return path
  return `${CDN_URL}/${path.replace(/^\//, '')}`
}
```

### Fase 3: State Management

#### 3.1 Zustand Store

```typescript
interface CatalogoFormState {
  // Lista
  artistas: CatalogoArtista[]
  page: number
  totalPages: number
  filters: { activo: boolean | null; destacado: boolean | null; search: string }

  // Drag & Drop
  isDragging: boolean
  draggedArtistaId: number | null

  // Dialogs (stacked)
  catalogoDialogOpen: boolean
  artistaDialogOpen: boolean
  selectedArtista: CatalogoArtista | null

  // Forms
  catalogoFormData: CatalogoEntryFormData | null
  artistaFormData: ArtistaFormData | null
  isDirty: boolean
  isSaving: boolean

  // Actions
  initializeList: (data: PaginatedResult<CatalogoArtista>) => void
  setPage: (page: number) => void
  setFilters: (filters: Partial<CatalogoFormState['filters']>) => void

  // Drag & Drop
  startDrag: (artistaId: number) => void
  endDrag: () => void
  moveArtista: (targetIndex: number, targetPage: number) => Promise<void>

  // Dialogs
  openCatalogoDialog: (artista: CatalogoArtista) => void
  openArtistaDialog: () => void // Abre sobre catálogo
  closeArtistaDialog: () => void // Cierra solo artista
  closeAllDialogs: () => void

  // Forms
  updateCatalogoField: <K extends keyof CatalogoEntryFormData>(
    field: K,
    value: CatalogoEntryFormData[K]
  ) => void
  updateArtistaField: <K extends keyof ArtistaFormData>(
    field: K,
    value: ArtistaFormData[K]
  ) => void
  markAsSaving: () => void
  markAsSaved: () => void
  restoreDraft: (type: 'catalogo' | 'artista', draft: DraftData) => void
}
```

**Draft Keys**:

- Catálogo: `admin:draft:catalogo:${artistaId}`
- Artista: `admin:draft:artista:${artistaId}`

### Fase 4: UI Components - Lista con Drag & Drop

#### 4.1 Drag & Drop Implementation

**Librería**: `@dnd-kit/core` + `@dnd-kit/sortable`

**Componentes**:

- `DndContext` wrapper en `CatalogoArtistasContainer`
- `SortableContext` para lista ordenable
- `DraggableCatalogoRow` usando `useSortable`
- `DragOverlay` para preview mientras arrastra

**Flujo DnD entre páginas**:

1. Usuario arrastra fila
2. Si suelta en misma página: reordenar localmente + API
3. Si suelta en otra página:
   - Detectar página destino (scroll/hover sobre paginación)
   - Cambiar a página destino
   - Colocar en posición específica
   - Calcular nuevo orden
   - Llamar `reorderCatalogoArtista()`

```typescript
// Componente DraggableCatalogoRow
function DraggableCatalogoRow({ artista, index }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: artista.artistaId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes}>
      <TableCell>
        <div {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      </TableCell>
      {/* ... resto de celdas */}
    </TableRow>
  )
}
```

#### 4.2 Tabla (CatalogoTable.tsx)

```typescript
// Columnas
- Drag handle (w-8)     // Icono grip para arrastrar
- Avatar (w-12)
- Nombre (flex-1)
- Orden (w-16)          // Solo lectura
- Destacado (w-24)      // Toggle switch
- Activo (w-20)         // Toggle switch
- Acciones (w-32)       // Editar
```

**Nota**: Campo orden es solo lectura visual, se edita exclusivamente mediante DnD.

### Fase 5: Dialogs Stacked

#### 5.1 Estructura de Dialogs

```typescript
// En CatalogoArtistasContainer
return (
  <div className="space-y-4">
    <CatalogoFilters />
    <CatalogoTable />
    <CatalogoPagination />

    {/* Dialog Nivel 1: Catálogo */}
    <Dialog open={catalogoDialogOpen} onOpenChange={closeAllDialogs}>
      <DialogContent className="max-w-2xl">
        <EditCatalogoDialogContent />
      </DialogContent>
    </Dialog>

    {/* Dialog Nivel 2: Artista (sobre catálogo) */}
    <Dialog open={artistaDialogOpen} onOpenChange={closeArtistaDialog}>
      <DialogContent className="max-w-xl">
        <EditArtistaDialogContent />
      </DialogContent>
    </Dialog>
  </div>
)
```

#### 5.2 EditCatalogoDialog (Nivel 1)

```
┌──────────────────────────────────────────────────────────────┐
│  ✏️ Editar Entrada de Catálogo                    [X]        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  👤 Ana López (@analopez)                              [✏️] │
│  📍 Santiago, Chile                                          │
│  📧 ana@example.com                                          │
│  #️⃣ Orden: 5                                                 │
│                                                              │
│  ──────── Información del Catálogo ────────                  │
│                                                              │
│  Destacado:  [🟢 ON]    Activo:  [🟢 ON]                     │
│                                                              │
│  Descripción:                                                │
│  ┌───────────────────────────────────────────────────────┐   │
│  │ [TipTap Editor con Toolbar]                           │   │
│  │                                                       │   │
│  │ Artista visual especializada en ilustración...        │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│                    [Cancelar]    [Guardar cambios]           │
└──────────────────────────────────────────────────────────────┘
```

**Features**:

- Info del artista como texto estático
- **Icono ✏️ (edit)** junto al nombre abre dialog de artista
- Orden mostrado como referencia (no editable)
- TipTap para descripción
- Draft auto-save

**Acción "Editar info artista"**:

```typescript
// En EditCatalogoDialog
<Button
  variant="ghost"
  size="sm"
  onClick={() => openArtistaDialog()}
  className="ml-2"
>
  <Pencil className="h-4 w-4" />
</Button>
```

#### 5.3 EditArtistaDialog (Nivel 2 - Stacked)

```
┌──────────────────────────────────────────────┐
│  👤 Editar Información del Artista    [X]    │
├──────────────────────────────────────────────┤
│                                              │
│  Nombre: [____Ana____]                       │
│                                              │
│  Pseudónimo: [____analopez____] *            │
│                                              │
│  Correo: [____ana@example.com____]           │
│                                              │
│  Redes Sociales:                             │
│  ┌──────────────────────────────────────┐    │
│  │ @instagram, @twitter                 │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  Ciudad: [____Santiago____]                  │
│                                              │
│  País: [____Chile____]                       │
│                                              │
│  * Campo único en el sistema                 │
│                                              │
│          [Cancelar]    [Guardar cambios]     │
└──────────────────────────────────────────────┘
```

**Comportamiento Stacked**:

- Se abre con `z-index` mayor que el dialog de catálogo
- Fondo semitransparente adicional
- Cerrar este dialog vuelve al de catálogo
- Cerrar catálogo cierra ambos
- Drafts independientes

**Draft Stacking**:

- Si hay draft en catálogo y abro artista: se mantienen ambos
- Al guardar artista: limpiar solo draft de artista
- Al guardar catálogo: limpiar solo draft de catálogo
- Al cerrar todo: persistir drafts no guardados

### Fase 6: Dependencias

#### 6.1 shadcn Components

```bash
bunx shadcn@latest add select
bunx shadcn@latest add switch
```

#### 6.2 Drag & Drop Library

```bash
bun add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Justificación**:

- `@dnd-kit`: Moderno, accesible, flexible
- Soporta sortable lists
- Fácil implementación de drag entre páginas
- Buena integración con React

### Fase 7: Edge Cases DnD

1. **Mover al inicio de lista**:
   - Primer elemento orden "1"
   - Nuevo orden = "0.5" (o menor que el primero)

2. **Mover al final de lista**:
   - Último elemento orden "10"
   - Nuevo orden = "11" (mayor que el último)

3. **Mover entre páginas**:
   - Calcular orden basado en elementos de página destino
   - Si página destino vacía: usar base de página (ej: pág 2 → orden "21")

4. **Re-balanceo**:
   - Detectar cuando orden tiene > 10 decimales
   - Ejecutar rebalanceo: asignar órdenes enteros secuenciales
   - Ej: ["1", "1.5", "1.75", "1.875"] → ["1", "2", "3", "4"]

```typescript
// Server action para rebalancear
export async function rebalanceCatalogoOrders(): Promise<void> {
  const artistas = await db
    .select({ id: catalogoArtista.id })
    .from(catalogoArtista)
    .orderBy(catalogoArtista.orden)

  for (let i = 0; i < artistas.length; i++) {
    await db
      .update(catalogoArtista)
      .set({ orden: (i + 1).toString() })
      .where(eq(catalogoArtista.id, artistas[i].id))
  }
}
```

---

## ✅ Checklist de Implementación

### Fase 1: Setup (45 min)

- [ ] Instalar componentes shadcn (select, switch)
- [ ] Instalar @dnd-kit/core, @dnd-kit/sortable
- [ ] Mover TipTap components a `_components/tiptap/`
- [ ] Mover draftManager a `_lib/draft/`
- [ ] Crear SaveButton, DraftNotification, EmptyState
- [ ] Actualizar organización con nuevos imports

### Fase 2: Backend (1.5 horas)

- [ ] Crear types/catalogo.ts
- [ ] Crear lib/getCatalogoData.ts con paginación
- [ ] Crear lib/reorderCatalogo.ts (server action reordenamiento)
- [ ] Crear lib/cdn.ts helper
- [ ] Crear actions/catalogo.actions.ts
- [ ] Implementar lógica de generación de orden intermedio
- [ ] Probar queries y actions

### Fase 3: State (1 hora)

- [ ] Crear hooks/useCatalogoForm.ts con DnD state
- [ ] Integrar draftManager (2 instancias)
- [ ] Implementar acciones de DnD
- [ ] Probar estado y drafts

### Fase 4: Lista con DnD (2 horas)

- [ ] Page principal con SSR
- [ ] CatalogoArtistasContainer con DndContext
- [ ] CatalogoTable con SortableContext
- [ ] DraggableCatalogoRow con useSortable
- [ ] DragOverlay para preview
- [ ] Implementar reordenamiento entre páginas
- [ ] CatalogoFilters con URL sync
- [ ] CatalogoPagination con DnD targets
- [ ] ArtistaAvatar con CDN
- [ ] Empty states

### Fase 5: Dialogs Stacked (1.5 horas)

- [ ] EditCatalogoDialog (nivel 1)
  - [ ] Layout y campos
  - [ ] Integrar TipTap
  - [ ] Botón "Editar info artista" (icono ✏️)
  - [ ] Draft management
- [ ] EditArtistaDialog (nivel 2)
  - [ ] Layout y campos
  - [ ] Draft management
  - [ ] Validaciones
- [ ] Lógica de stacking (z-index, fondos)
- [ ] SaveButton integración en ambos

### Fase 6: Polish (45 min)

- [ ] Validaciones Zod
- [ ] Error handling
- [ ] Loading states
- [ ] Toast notifications
- [ ] Keyboard navigation
- [ ] ARIA labels para DnD

### Fase 7: Testing (45 min)

- [ ] Probar paginación
- [ ] Probar filtros
- [ ] Probar DnD dentro de página
- [ ] Probar DnD entre páginas
- [ ] Probar edición catálogo
- [ ] Probar edición artista (stacked)
- [ ] Probar drafts independientes
- [ ] Probar rebalanceo de órdenes

**Total Estimado**: ~8 horas de desarrollo enfocado

---

## 🐛 Consideraciones Edge Cases

1. **DnD con filtros activos**: Deshabilitar DnD cuando hay filtros (para no confundir reordenamiento con filtrado)
2. **Mover elemento filtrado**: Mostrar warning si intenta reordenar mientras filtra
3. **Orden con muchos decimales**: Rebalancear automáticamente
4. **Draft en ambos dialogs**: Persistir ambos independientemente
5. **Cerrar catálogo con artista abierto**: Confirmar si hay cambios sin guardar en cualquiera
6. **Error en reordenamiento**: Revertir a posición original
7. **Página destino llena**: Permitir igualmente (no hay límite real por página)

---

## 📝 Notas Técnicas

### Flujo de Edición Stacked

```
Usuario:
1. Click "Editar" en tabla → Abre EditCatalogoDialog
2. Click ✏️ junto a nombre → Abre EditArtistaDialog (encima)
3. Edita artista → Guarda → Cierra solo artista → Vuelve a catálogo
4. Edita descripción → Guarda → Cierra todo
5. Si cierra catálogo con X → Cierra ambos (confirmar cambios)
```

### Gestión de Drafts Stacked

```typescript
// Draft keys
const CATALOG_DRAFT_KEY = `admin:draft:catalogo:${artistaId}`
const ARTIST_DRAFT_KEY = `admin:draft:artista:${artistaId}`

// Al abrir artista sobre catálogo:
// - Catálogo draft se mantiene
// - Artista draft se carga si existe

// Al guardar artista:
// - Limpiar ARTIST_DRAFT_KEY
// - Mantener CATALOG_DRAFT_KEY

// Al guardar catálogo:
// - Limpiar CATALOG_DRAFT_KEY
// - Mantener ARTIST_DRAFT_KEY (si existe)
```

### CDN Implementation

```typescript
// Uso en componentes
const avatarUrl = getAvatarUrl(artista.avatarPath)
// Resultado: https://cdn.frijolmagico.cl/path/to/avatar.jpg
```

---

## 🚀 Próximos Pasos

1. Aprobar plan actualizado
2. Comenzar con Fase 1 (instalaciones y refactorización)
3. Implementar backend primero (para probar DnD)
4. Desarrollar UI por fases
5. Testing exhaustivo de DnD
6. Deploy

**Prioridad Post-MVP**:

1. Upload de avatars (integración Cloudflare R2)
2. Preview del catálogo (vista como usuario final)
3. Filtros avanzados (disciplina, edición)
4. Bulk actions (selección múltiple)
