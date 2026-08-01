import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { act, createElement, useState } from 'react'
import { createRoot } from 'react-dom/client'

const hookState = {
  phase: 'idle' as 'idle' | 'uploading',
  job: null as { sentBytes: number; totalBytes: number } | null
}
let selectFileCallCount = 0
let enqueueCallCount = 0

mock.module('@/core/artistas/catalogo/_hooks/use-avatar-controller', () => ({
  useAvatarController: () => {
    const [, rerender] = useState(0)
    return {
      state: {
        phase: hookState.phase,
        preview: null,
        currentAvatar: { path: 'avatar.webp', version: 'v1' },
        job: hookState.job,
        error: null
      },
      async selectFile() {
        selectFileCallCount += 1
        hookState.phase = 'uploading'
        hookState.job = { sentBytes: 40, totalBytes: 100 }
        rerender((value) => value + 1)
        return { phase: 'ready' }
      },
      async enqueue() {
        enqueueCallCount += 1
      },
      cancel() {},
      retry: async () => {},
      reset() {},
      syncAvatar() {}
    }
  }
}))

mock.module('next/image', () => ({
  default: (props: Record<string, unknown>) => createElement('img', props)
}))

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

function nodesByTag(root: TestNode, tagName: string): TestNode[] {
  return root.childNodes.flatMap((child) => [
    ...(child.tagName === tagName.toUpperCase() ? [child] : []),
    ...nodesByTag(child, tagName)
  ])
}

function buttons(root: TestNode) {
  return nodesByTag(root, 'button')
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

const { ArtistAvatarSection } =
  await import('@/core/artistas/catalogo/_components/artist-avatar-section')

let root: ReturnType<typeof createRoot> | null = null

beforeEach(() => {
  hookState.phase = 'idle'
  hookState.job = null
  selectFileCallCount = 0
  enqueueCallCount = 0
  document.body.childNodes = []
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
})

  test('4.10 regression: default autoEnqueue=true still calls enqueue (UpdateCatalogDialog compat)', async () => {
    const container = document.createElement('main')
    document.body.appendChild(container)
    root = createRoot(container as unknown as Element)

    await act(async () => {
      root?.render(
        <ArtistAvatarSection
          artistId='artist-1'
          currentAvatar={{ path: 'avatar.webp', version: 'v1' }}
          // No autoEnqueue prop — defaults to true, same as UpdateCatalogDialog usage
        />
      )
    })

    const input = nodesByTag(container, 'input')[0]
    Object.defineProperty(input, 'files', {
      value: [{ name: 'new-avatar.webp', type: 'image/webp', size: 100 }]
    })

    await act(async () => {
      reactProps(input).onChange?.({ currentTarget: input })
    })

    expect(selectFileCallCount).toBe(1)
    expect(enqueueCallCount).toBe(1)
  })

  test('drives file selection into upload progress markup', async () => {
  const container = document.createElement('main')
  document.body.appendChild(container)
  root = createRoot(container as unknown as Element)

  await act(async () => {
    root?.render(
      <ArtistAvatarSection
        artistId='artist-1'
        currentAvatar={{ path: 'avatar.webp', version: 'v1' }}
      />
    )
  })

  const input = nodesByTag(container, 'input')[0]
  Object.defineProperty(input, 'files', {
    value: [{ name: 'new-avatar.webp', type: 'image/webp', size: 100 }]
  })

  await act(async () => {
    reactProps(input).onChange?.({ currentTarget: input })
  })

  const progress = nodesByTag(container, 'progress')[0]
  expect(selectFileCallCount).toBe(1)
  expect(enqueueCallCount).toBe(1)
  expect(progress.attributes.get('aria-label')).toBe('Progreso de carga')
  expect(progress.attributes.get('value')).toBe('40')
  expect(container.textContent).toContain('40%')
})

test('does not show catalog history controls outside the catalog context', async () => {
  const container = document.createElement('main')
  document.body.appendChild(container)
  root = createRoot(container as unknown as Element)

  await act(async () => {
    root?.render(
      <ArtistAvatarSection
        artistId='artist-1'
        currentAvatar={{ path: 'avatar.webp', version: 'v1' }}
      />
    )
  })

  expect(container.textContent).not.toContain('Ver historial')
})

test('autoEnqueue=false prevents enqueue after selectFile', async () => {
  const container = document.createElement('main')
  document.body.appendChild(container)
  root = createRoot(container as unknown as Element)

  await act(async () => {
    root?.render(
      <ArtistAvatarSection
        artistId='artist-1'
        currentAvatar={{ path: 'avatar.webp', version: 'v1' }}
        autoEnqueue={false}
      />
    )
  })

  const input = nodesByTag(container, 'input')[0]
  Object.defineProperty(input, 'files', {
    value: [{ name: 'new-avatar.webp', type: 'image/webp', size: 100 }]
  })

  await act(async () => {
    reactProps(input).onChange?.({ currentTarget: input })
  })

  // selectFile was called
  expect(selectFileCallCount).toBe(1)
  // enqueue was NOT called (autoEnqueue=false)
  expect(enqueueCallCount).toBe(0)
})

describe('external controller prop', () => {
  test('uses external controller state instead of internal', async () => {
    const container = document.createElement('main')
    document.body.appendChild(container)
    root = createRoot(container as unknown as Element)

    const externalSelectFile = mock(async () => ({ phase: 'ready' as const }))
    const externalEnqueue = mock(async () => {})
    const externalCancel = mock(() => {})

    await act(async () => {
      root?.render(
        <ArtistAvatarSection
          artistId='artist-1'
          currentAvatar={{ path: 'avatar.webp', version: 'v1' }}
          autoEnqueue={false}
          controller={{
            state: {
              phase: 'idle' as const,
              preview: null,
              currentAvatar: { path: 'ext-avatar.png', version: 'v1' },
              job: null,
              error: null
            },
            selectFile: externalSelectFile,
            enqueue: externalEnqueue,
            cancel: externalCancel,
            retry: async () => {}
          }}
        />
      )
    })

    // External controller state should be used — verify the avatar shows
    const img = container.textContent
    expect(img).not.toContain('Sin avatar')

    // Trigger file selection on the input
    const input = nodesByTag(container, 'input')[0]
    Object.defineProperty(input, 'files', {
      value: [{ name: 'ext-upload.webp', type: 'image/webp', size: 100 }]
    })

    await act(async () => {
      reactProps(input).onChange?.({ currentTarget: input })
    })

    // External selectFile was called (not internal)
    expect(externalSelectFile).toHaveBeenCalledTimes(1)
    // Internal selectFile was NOT called (external controller used)
    expect(selectFileCallCount).toBe(0)
    // enqueue was NOT called (autoEnqueue=false)
    expect(externalEnqueue).toHaveBeenCalledTimes(0)
  })
})
