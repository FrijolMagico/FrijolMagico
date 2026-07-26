import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'

const getHistory = mock(async (_artistId: number) => [])
const restoreAvatar = mock(
  async (_input: { artistaId: number; avatarId: number }) => ({
    success: true
  })
)

mock.module(
  '@/core/artistas/_actions/get-artist-avatar-history.action',
  () => ({
    getArtistAvatarHistoryAction: getHistory
  })
)

mock.module('@/core/artistas/_actions/restore-artist-avatar.action', () => ({
  restoreArtistAvatarAction: restoreAvatar
}))

mock.module('@/shared/components/ui/button', () => ({
  Button: ({
    children,
    onClick
  }: {
    children: unknown
    onClick?: () => void
  }) => createElement('button', { type: 'button', onClick }, children)
}))

mock.module('@/shared/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: { children: unknown; open: boolean }) =>
    open ? children : null,
  AlertDialogAction: ({
    children,
    onClick
  }: {
    children: unknown
    onClick: () => void
  }) => createElement('button', { type: 'button', onClick }, children),
  AlertDialogCancel: ({ children }: { children: unknown }) =>
    createElement('button', { type: 'button' }, children),
  AlertDialogContent: ({ children }: { children: unknown }) =>
    createElement('div', null, children),
  AlertDialogFooter: ({ children }: { children: unknown }) =>
    createElement('div', null, children),
  AlertDialogHeader: ({ children }: { children: unknown }) =>
    createElement('div', null, children),
  AlertDialogTitle: ({ children }: { children: unknown }) =>
    createElement('h3', null, children)
}))

// prettier-ignore
class TestNode { nodeType=1; nodeName:string; tagName:string; parentNode:TestNode|null=null; childNodes:TestNode[]=[]; ownerDocument:TestDocument; attributes=new Map<string,string>(); listeners=new Map<string,(event:Event)=>void>(); style={}; namespaceURI='http://www.w3.org/1999/xhtml'
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

function buttons(root: TestNode): TestNode[] {
  return root.childNodes.flatMap((child) => [
    ...(child.tagName === 'BUTTON' ? [child] : []),
    ...buttons(child)
  ])
}

function reactProps(node: TestNode): Record<string, () => void> {
  const key = Object.getOwnPropertyNames(node).find((name) =>
    name.startsWith('__reactProps$')
  )
  if (!key) throw new Error('React props were not attached to the test node')
  return node[key as keyof TestNode] as unknown as Record<string, () => void>
}

function buttonByText(container: TestNode, text: string): TestNode {
  const button = buttons(container).find((item) => item.textContent === text)
  if (!button) throw new Error(`Button not found: ${text}`)
  return button
}

const document = new TestDocument()
globalThis.document = document as unknown as Document
globalThis.window = globalThis as unknown as Window & typeof globalThis
globalThis.Node = TestNode as unknown as typeof Node
globalThis.HTMLElement = TestNode as unknown as typeof HTMLElement
globalThis.Element = TestNode as unknown as typeof Element
globalThis.SVGElement = TestNode as unknown as typeof SVGElement
globalThis.HTMLIFrameElement = TestNode as unknown as typeof HTMLIFrameElement
;(globalThis.window as unknown as { Event: typeof Event }).Event = Event
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const { ArtistAvatarHistory } =
  await import('@/core/artistas/catalogo/_components/artist-avatar-history')

let root: ReturnType<typeof createRoot> | null = null
let container: TestNode

beforeEach(() => {
  getHistory.mockReset()
  restoreAvatar.mockReset()
  document.body.childNodes = []
  container = document.createElement('main')
  document.body.appendChild(container)
  root = createRoot(container as unknown as Element)
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
})

describe('ArtistAvatarHistory', () => {
  test('loads one artist on demand and wraps navigation from active to latest deleted', async () => {
    getHistory.mockResolvedValue([
      { id: 9, path: 'avatars/active.webp', version: 'v9', deletedAt: null },
      {
        id: 8,
        path: 'avatars/latest-deleted.webp',
        version: 'v8',
        deletedAt: '2026-07-25T10:00:00.000Z'
      }
    ])

    await act(async () => {
      root?.render(<ArtistAvatarHistory artistId={42} />)
    })
    expect(container.textContent).not.toContain('avatars/active.webp')

    await act(async () => {
      reactProps(buttonByText(container, 'Ver historial')).onClick()
    })
    expect(getHistory).toHaveBeenCalledWith(42)
    expect(container.textContent).toContain('avatars/active.webp')

    await act(async () => {
      reactProps(buttonByText(container, 'Anterior')).onClick()
    })
    expect(container.textContent).toContain('avatars/latest-deleted.webp')
    expect(container.textContent).toContain('Restaurar avatar')

    await act(async () => {
      reactProps(buttonByText(container, 'Siguiente')).onClick()
    })
    expect(container.textContent).toContain('avatars/active.webp')
  })

  test('requires confirmation before restoring and refreshes history after success', async () => {
    getHistory
      .mockResolvedValueOnce([
        {
          id: 8,
          path: 'avatars/historical.webp',
          version: 'v8',
          deletedAt: '2026-07-25T10:00:00.000Z'
        }
      ])
      .mockResolvedValueOnce([
        { id: 8, path: 'avatars/restored.webp', version: 'v8', deletedAt: null }
      ])
    restoreAvatar.mockResolvedValue({ success: true })

    await act(async () => {
      root?.render(<ArtistAvatarHistory artistId={42} />)
    })
    await act(async () => {
      reactProps(buttonByText(container, 'Ver historial')).onClick()
    })
    await act(async () => {
      reactProps(buttonByText(container, 'Restaurar avatar')).onClick()
    })

    expect(container.textContent).toContain('¿Restaurar este avatar?')
    expect(restoreAvatar).not.toHaveBeenCalled()

    await act(async () => {
      reactProps(buttonByText(container, 'Restaurar')).onClick()
    })
    expect(restoreAvatar).toHaveBeenCalledWith({ artistaId: 42, avatarId: 8 })
    expect(getHistory).toHaveBeenCalledTimes(2)
    expect(container.textContent).toContain('avatars/restored.webp')
  })

  test('shows the restore error without refreshing history', async () => {
    getHistory.mockResolvedValue([
      {
        id: 8,
        path: 'avatars/historical.webp',
        version: 'v8',
        deletedAt: '2026-07-25T10:00:00.000Z'
      }
    ])
    restoreAvatar.mockResolvedValue({
      success: false,
      errors: [{ message: 'No se pudo restaurar el avatar seleccionado' }]
    })

    await act(async () => {
      root?.render(<ArtistAvatarHistory artistId={42} />)
    })
    await act(async () => {
      reactProps(buttonByText(container, 'Ver historial')).onClick()
    })
    await act(async () => {
      reactProps(buttonByText(container, 'Restaurar avatar')).onClick()
    })
    await act(async () => {
      reactProps(buttonByText(container, 'Restaurar')).onClick()
    })

    expect(container.textContent).toContain(
      'No se pudo restaurar el avatar seleccionado'
    )
    expect(getHistory).toHaveBeenCalledTimes(1)
  })
})
