import {
  afterEach,
  beforeEach,
  describe,
  expect,
  mock,
  spyOn,
  test
} from 'bun:test'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'

// ── Mock the server action ───────────────────────────────────────────
const mockUpdateCatalogFieldAction = mock(async () => ({ success: true }))

mock.module(
  '@/core/artistas/catalogo/_actions/update-catalog-field.action',
  () => ({
    updateCatalogFieldAction: mockUpdateCatalogFieldAction
  })
)

// ── Mock the Zustand store ───────────────────────────────────────────
mock.module('@/core/artistas/catalogo/_store/catalog-dialog-store', () => ({
  useCatalogDialog: () => mock(() => {})
}))

mock.module(
  '@/core/artistas/catalogo/_hooks/use-catalog-avatar-completion-refresh',
  () => ({ useCatalogAvatarCompletionRefresh: () => {} })
)

let hasRecentCompletion = false
mock.module('@/core/artistas/catalogo/_lib/catalog-avatar-queue-state', () => ({
  useCatalogAvatarPending: () => false,
  useCatalogAvatarRecentCompletion: () => hasRecentCompletion
}))

// ── Mock sonner ──────────────────────────────────────────────────────
mock.module('sonner', () => ({
  toast: {
    error: mock(() => {}),
    success: mock(() => {})
  }
}))

// ── Mock Tooltip (renders content inline without hover interaction) ──
mock.module('@/shared/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: unknown }) =>
    createElement('div', { 'data-testid': 'tooltip' }, children),
  TooltipTrigger: ({
    children,
    render
  }: {
    children?: unknown
    render?: unknown
  }) =>
    createElement(
      'div',
      { 'data-testid': 'tooltip-trigger' },
      render ?? children
    ),
  TooltipContent: ({ children }: { children: unknown }) =>
    createElement('div', { 'data-testid': 'tooltip-content' }, children),
  TooltipProvider: ({ children }: { children: unknown }) =>
    createElement('div', { 'data-testid': 'tooltip-provider' }, children)
}))

// ── Mock ActionMenuButton (complex dependencies) ───────────────────
mock.module('@/shared/components/action-menu-button', () => ({
  ActionMenuButton: ({
    isDeleted,
    onRestore
  }: {
    isDeleted?: boolean
    onRestore?: () => void
  }) => {
    if (isDeleted) {
      return createElement(
        'button',
        { 'data-testid': 'restore-button', onClick: onRestore },
        'Restaurar'
      )
    }
    return createElement('div', { 'data-testid': 'action-menu' })
  }
}))

// ── Mock Tabler icons to make them distinguishable in tests ─────────
mock.module('@tabler/icons-react', () => ({
  IconAlertTriangle: (props: Record<string, unknown>) =>
    createElement('svg', { ...props, 'data-icon': 'alert-triangle' }),
  IconUser: (props: Record<string, unknown>) =>
    createElement('svg', { ...props, 'data-icon': 'user' }),
  IconStar: (props: Record<string, unknown>) =>
    createElement('svg', { ...props, 'data-icon': 'star' }),
  IconCheck: (props: Record<string, unknown>) =>
    createElement('svg', { ...props, 'data-icon': 'check' }),
  IconClock: (props: Record<string, unknown>) =>
    createElement('svg', { ...props, 'data-icon': 'clock' }),
  IconX: (props: Record<string, unknown>) =>
    createElement('svg', { ...props, 'data-icon': 'x' }),
  IconDotsVertical: () => null,
  IconRotateClockwise: () => null
}))

// ── Test DOM setup ──────────────────────────────────────────────────
// prettier-ignore
class TestNode { nodeType=1; nodeName:string; tagName:string; parentNode:TestNode|null=null; childNodes:TestNode[]=[]; ownerDocument:TestDocument; attributes=new Map<string,string>(); listeners=new Map<string,(event:Event)=>void>(); style={}; value=''; disabled=false; namespaceURI='http://www.w3.org/1999/xhtml'
  constructor(ownerDocument:TestDocument,nodeName:string){this.ownerDocument=ownerDocument;this.nodeName=nodeName.toUpperCase();this.tagName=this.nodeName}
  appendChild(child:TestNode){child.parentNode=this;this.childNodes.push(child);return child}
  insertBefore(child:TestNode,before:TestNode|null){child.parentNode=this;const index=before?this.childNodes.indexOf(before):-1;this.childNodes.splice(index===-1?this.childNodes.length:index,0,child);return child}
  removeChild(child:TestNode){this.childNodes.splice(this.childNodes.indexOf(child),1);child.parentNode=null;return child}
  setAttribute(name:string,value:string){this.attributes.set(name,String(value))}
  removeAttribute(name:string){this.attributes.delete(name)}
  addEventListener(name:string,listener:(event:Event)=>void){this.listeners.set(name,listener)}
  removeEventListener(name:string){this.listeners.delete(name)}
  get textContent(){return this.childNodes.map((child)=>child.textContent).join('')}
  set textContent(value:string){this.childNodes=[this.ownerDocument.createTextNode(value)]}
  get firstChild(){return this.childNodes[0]??null}
  get nextSibling(){const siblings=this.parentNode?.childNodes??[];return siblings[siblings.indexOf(this)+1]??null}
  closest(_selector:string){return this.parentNode}
  get form(){return this.parentNode}
  reset(){}
  submit(){}
}
// prettier-ignore
class TestTextNode extends TestNode { nodeType=3; data:string; constructor(ownerDocument:TestDocument,data:string){super(ownerDocument,'#text');this.data=data} get textContent(){return this.data} set textContent(value:string){this.data=value} }
// prettier-ignore
class TestDocument extends TestNode { body:TestNode; documentElement:TestNode; activeElement:TestNode; defaultView=globalThis
  constructor(){super(null as unknown as TestDocument,'#document');this.ownerDocument=this;this.body=new TestNode(this,'body');this.documentElement=new TestNode(this,'html');this.activeElement=this.body;this.documentElement.appendChild(this.body);this.appendChild(this.documentElement)}
  createElement(name:string){return new TestNode(this,name)}
  createElementNS(_namespace:string,name:string){return this.createElement(name)}
  createTextNode(value:string){return new TestTextNode(this,value)}
  createComment(value:string){return this.createTextNode(value)}
}

function nodesByAttribute(
  root: TestNode,
  attr: string,
  value: string
): TestNode[] {
  const result: TestNode[] = []
  function walk(node: TestNode) {
    if (node.attributes?.get(attr) === value) {
      result.push(node)
    }
    for (const child of node.childNodes) {
      walk(child)
    }
  }
  walk(root)
  return result
}

function nodesByTag(root: TestNode, tagName: string): TestNode[] {
  return root.childNodes.flatMap((child) => [
    ...(child.tagName === tagName.toUpperCase() ? [child] : []),
    ...nodesByTag(child, tagName)
  ])
}

function reactProps(node: TestNode): Record<string, (event?: unknown) => void> {
  const key = Object.getOwnPropertyNames(node).find((name) =>
    name.startsWith('__reactProps$')
  )
  if (!key) throw new Error('React props were not attached to the test node')
  return node[key as keyof TestNode] as unknown as Record<
    string,
    (event?: unknown) => void
  >
}

const document = new TestDocument()
globalThis.document = document as unknown as Document
globalThis.window = globalThis as unknown as Window & typeof globalThis
globalThis.Node = TestNode as unknown as typeof Node
globalThis.HTMLElement = TestNode as unknown as typeof HTMLElement
globalThis.Element = TestNode as unknown as typeof Element
globalThis.SVGElement = TestNode as unknown as typeof SVGElement
globalThis.HTMLIFrameElement = TestNode as unknown as typeof HTMLIFrameElement
;(
  globalThis.window as unknown as {
    HTMLIFrameElement: typeof HTMLIFrameElement
  }
).HTMLIFrameElement = TestNode as unknown as typeof HTMLIFrameElement
;(globalThis.window as unknown as { Event: typeof Event }).Event = Event
globalThis.IS_REACT_ACT_ENVIRONMENT = true
// @base-ui/react/avatar's useImageLoadingStatus uses new window.Image()
class MockImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src = ''
  currentSrc = ''
  complete = false
  naturalWidth = 0
  naturalHeight = 0
  width = 0
  height = 0
  decode() {
    return Promise.resolve()
  }
  addEventListener() {}
  removeEventListener() {}
}
globalThis.Image = MockImage as unknown as typeof Image

// ── Components ──────────────────────────────────────────────────────
const { ArtistAvatar } =
  await import('@/core/artistas/catalogo/_components/artist-avatar')
const { CatalogRow } =
  await import('@/core/artistas/catalogo/_components/catalog-row')

// ── Fixtures ─────────────────────────────────────────────────────────
function createMockCatalog(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    artistaId: 1,
    orden: 'a0',
    destacado: false,
    activo: false,
    descripcion: null,
    deletedAt: null,
    avatarUrl: null,
    activeAvatar: null,
    artist: {
      id: 1,
      pseudonimo: 'Test Artist',
      nombre: 'Test Name',
      rut: null,
      telefono: null,
      correo: null,
      ciudad: 'Montevideo',
      pais: 'Uruguay',
      estadoId: 1,
      rrss: null
    },
    ...overrides
  }
}

// ── Test setup ──────────────────────────────────────────────────────
let root: ReturnType<typeof createRoot> | null = null
let container: TestNode

beforeEach(() => {
  mockUpdateCatalogFieldAction.mockClear()
  document.body.childNodes = []
  container = document.createElement('main')
  document.body.appendChild(container)
  root = createRoot(container as unknown as Element)
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
})

// ── Helpers ──────────────────────────────────────────────────────────
/** Find the switch inside the activo cell, identified by data-testid */
function getActivoSwitch(root: TestNode): TestNode | null {
  const cells = nodesByAttribute(root, 'data-testid', 'switch-activo-cell')
  if (cells.length === 0) return null
  const switchesInCell = nodesByAttribute(cells[0], 'data-slot', 'switch')
  return switchesInCell[0] ?? null
}

function renderCatalogRow(catalog: ReturnType<typeof createMockCatalog>) {
  return act(async () => {
    root?.render(
      createElement(CatalogRow, {
        catalog: catalog as never,
        onDelete: mock(() => {}),
        onRestore: mock(() => {})
      })
    )
  })
}

// ── Tests ────────────────────────────────────────────────────────────

describe('CatalogRow — Avatar Business Rule', () => {
  test('1. Missing avatar: no IconUser, switch disabled, tooltip shown', async () => {
    const catalog = createMockCatalog({ avatarUrl: null })
    await renderCatalogRow(catalog)

    // Should NOT show user icon (the mock returns <svg data-icon='user'>)
    const userIcons = nodesByAttribute(container, 'data-icon', 'user')
    expect(userIcons.length).toBe(0)

    // Active switch is disabled
    const activoSwitch = getActivoSwitch(container)
    expect(activoSwitch).not.toBeNull()
    expect(activoSwitch!.attributes.get('data-disabled')).toBe('')

    // Tooltip content exists in tree (component structure, not interaction)
    const tooltipContents = nodesByAttribute(
      container,
      'data-testid',
      'tooltip-content'
    )
    expect(tooltipContents.length).toBeGreaterThan(0)
  })

  test('2. Missing avatar: active switch is disabled', async () => {
    const catalog = createMockCatalog({ avatarUrl: null })
    await renderCatalogRow(catalog)

    expect(getActivoSwitch(container)).not.toBeNull()

    const activoSwitch = getActivoSwitch(container)!
    // The activo switch should have data-disabled when avatar missing
    expect(activoSwitch.attributes.get('data-disabled')).toBe('')
  })

  test('3. Missing avatar: active display shows false even if activo=true', async () => {
    const catalog = createMockCatalog({
      avatarUrl: null,
      activo: true // DB says true, but UI should force false
    })
    await renderCatalogRow(catalog)

    const activoSwitch = getActivoSwitch(container)!

    // Should show as unchecked (data-unchecked) even though activo=true in data
    expect(activoSwitch.attributes.get('data-unchecked')).toBe('')
    // IconX should be shown (inactive state) instead of IconCheck
    const checkIcons = nodesByAttribute(container, 'data-icon', 'check')
    expect(checkIcons.length).toBe(0)
  })

  test('4. Has avatar: active switch is enabled (normal behavior)', async () => {
    const catalog = createMockCatalog({
      avatarUrl: 'http://cdn.test/avatar.webp',
      activeAvatar: {
        id: 1,
        path: 'http://cdn.test/avatar.webp',
        version: 'v1'
      },
      activo: true
    })
    await renderCatalogRow(catalog)

    const activoSwitch = getActivoSwitch(container)!

    // Should NOT have data-disabled when avatar exists
    expect(activoSwitch.attributes.has('data-disabled')).toBe(false)
    // Should show as checked (data-checked) since activo=true
    expect(activoSwitch.attributes.get('data-checked')).toBe('')
    // IconCheck should be shown
    const checkIcons = nodesByAttribute(container, 'data-icon', 'check')
    expect(checkIcons.length).toBeGreaterThan(0)
  })

  test('4b. Exact pending avatar: locks only Active while featured remains editable', async () => {
    const catalog = createMockCatalog({
      activeAvatar: {
        id: 1,
        path: 'http://cdn.test/avatar.webp',
        version: 'v1'
      }
    })
    await act(async () => {
      root?.render(
        createElement(CatalogRow, {
          catalog: catalog as never,
          hasPendingAvatar: true,
          onDelete: mock(() => {}),
          onRestore: mock(() => {})
        })
      )
    })

    const switches = nodesByAttribute(container, 'data-slot', 'switch')
    expect(switches).toHaveLength(2)
    expect(switches[0]?.attributes.has('data-disabled')).toBe(false)
    expect(getActivoSwitch(container)?.attributes.get('data-disabled')).toBe('')
  })

  test('4c. Pending avatar: shows a waiting clock instead of a missing-avatar error', async () => {
    const catalog = createMockCatalog({ activeAvatar: null })
    await act(async () => {
      root?.render(
        createElement(CatalogRow, {
          catalog: catalog as never,
          hasPendingAvatar: true,
          onDelete: mock(() => {}),
          onRestore: mock(() => {})
        })
      )
    })

    expect(nodesByAttribute(container, 'data-icon', 'clock')).toHaveLength(1)
    expect(
      nodesByAttribute(container, 'data-icon', 'alert-triangle')
    ).toHaveLength(0)
    expect(container.textContent).toContain('El avatar se está preparando')
  })

  test('4d. Missing avatar without pending work: retains the missing-avatar error', async () => {
    const catalog = createMockCatalog({ activeAvatar: null })
    await renderCatalogRow(catalog)

    expect(nodesByAttribute(container, 'data-icon', 'clock')).toHaveLength(0)
    expect(
      nodesByAttribute(container, 'data-icon', 'alert-triangle')
    ).toHaveLength(1)
  })

  test('4e. Completed stale props keep the warning clock until a fresh avatar wins', async () => {
    hasRecentCompletion = true
    await renderCatalogRow(createMockCatalog({ activeAvatar: null }))
    expect(nodesByAttribute(container, 'data-icon', 'clock')).toHaveLength(1)
    expect(nodesByAttribute(container, 'data-icon', 'alert-triangle')).toHaveLength(0)

    await renderCatalogRow(
      createMockCatalog({
        activeAvatar: { id: 1, path: 'avatar.webp', version: 'v1' }
      })
    )
    expect(nodesByAttribute(container, 'data-icon', 'alert-triangle')).toHaveLength(0)
    expect(nodesByAttribute(container, 'data-testid', 'tooltip-content')).toHaveLength(0)
    hasRecentCompletion = false
  })

  test('5. Missing avatar: handleToggleActivo is guarded', async () => {
    const catalog = createMockCatalog({ avatarUrl: null })
    await renderCatalogRow(catalog)

    // The updateCatalogFieldAction should NOT be called on render
    expect(mockUpdateCatalogFieldAction).not.toHaveBeenCalled()

    // Activate the onCheckedChange for the activo switch
    const activoSwitch = getActivoSwitch(container)!
    const props = reactProps(activoSwitch)

    // Simulate clicking the switch (onCheckedChange callback)
    // The Switch from @base-ui calls onCheckedChange with the new checked value
    await act(async () => {
      props.onCheckedChange?.(true)
    })

    // Wait for async
    await new Promise((resolve) => setTimeout(resolve, 10))

    // The action should NOT be called because hasAvatar is false
    expect(mockUpdateCatalogFieldAction).not.toHaveBeenCalled()
  })

  test('6. Deleted view: avatar business rule NOT applied', async () => {
    const catalog = createMockCatalog({
      avatarUrl: null,
      activo: true,
      deletedAt: '2024-01-01'
    })
    await act(async () => {
      root?.render(
        createElement(CatalogRow, {
          catalog: catalog as never,
          isDeletedView: true,
          onDelete: mock(() => {}),
          onRestore: mock(() => {})
        })
      )
    })

    // Should show "Eliminado" text (deleted state body)
    expect(container.textContent).toContain('Eliminado')

    // Should NOT have the activo switch in deleted view
    const activoSwitch = getActivoSwitch(container)
    expect(activoSwitch).toBeNull()
  })

  test('7. Has avatar: normal ArtistAvatar renders (no alert, no tooltip)', async () => {
    const catalog = createMockCatalog({
      avatarUrl: 'http://cdn.test/avatar.webp',
      activeAvatar: {
        id: 1,
        path: 'http://cdn.test/avatar.webp',
        version: 'v1'
      }
    })
    await renderCatalogRow(catalog)

    // No alert icon
    const alertIcons = nodesByAttribute(
      container,
      'data-icon',
      'alert-triangle'
    )
    expect(alertIcons.length).toBe(0)

    // Tooltip content should NOT be present in the tree
    const tooltipContents = nodesByAttribute(
      container,
      'data-testid',
      'tooltip-content'
    )
    expect(tooltipContents.length).toBe(0)

    // Switch is enabled
    const activoSwitch = getActivoSwitch(container)!
    expect(activoSwitch.attributes.has('data-disabled')).toBe(false)
  })
})
